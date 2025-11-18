import Database from "better-sqlite3";
import {
  Client,
  ResultSet,
  Transaction,
  createClient,
} from "@libsql/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

type SqlPrimitive = string | number | null | Buffer;
type SqlValue = SqlPrimitive | boolean | Date | undefined | Uint8Array;
type LegacyStatement = {
  run: (...params: SqlValue[]) => { changes: number; lastInsertRowid: number };
  get: (...params: SqlValue[]) => any;
  all: (...params: SqlValue[]) => any[];
};

interface RunResult {
  changes: number;
  lastInsertRowid?: number;
}

interface SqlExecutor {
  run(sql: string, params?: SqlValue[]): Promise<RunResult>;
  query<T = Record<string, unknown>>(
    sql: string,
    params?: SqlValue[]
  ): Promise<T[]>;
  queryOne<T = Record<string, unknown>>(
    sql: string,
    params?: SqlValue[]
  ): Promise<T | undefined>;
}

interface DbClient extends SqlExecutor {}

interface DatabaseFacade extends DbClient {
  transaction<T>(fn: (client: DbClient) => Promise<T>): Promise<T>;
}

const isServerless = process.env.VERCEL === "1";
const useLibsql = Boolean(process.env.LIBSQL_URL);
const localDbPath = isServerless
  ? path.join("/tmp", "database.db")
  : path.join(process.cwd(), "backend", "database.db");

let sqliteDb: Database.Database | null = null;
let libsqlClient: Client | null = null;
let connectionInitialized = false;
let schemaInitialized = false;
let compatTransactionExecutor: SqlExecutor | null = null;
let legacyCompatDb: Database.Database | null = null;

const schemaSearchPaths = [
  path.join(__dirname, "..", "..", "sqlite_schema.sql"),
  path.join(process.cwd(), "backend", "sqlite_schema.sql"),
  path.join(process.cwd(), "sqlite_schema.sql"),
];

const sanitizeParam = (value: SqlValue): SqlPrimitive => {
  if (value === undefined || value === null) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  return value as SqlPrimitive;
};

const sanitizeParams = (params: SqlValue[] = []): SqlPrimitive[] =>
  params.map(sanitizeParam);

const coerceRowId = (
  value?: string | number | bigint | null
): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return value;
};

const ensureSqliteDb = (): Database.Database => {
  if (sqliteDb) {
    return sqliteDb;
  }

  const directory = path.dirname(localDbPath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  sqliteDb = new Database(localDbPath);
  sqliteDb.pragma("foreign_keys = ON");
  sqliteDb.pragma("journal_mode = WAL");
  sqliteDb.pragma("synchronous = NORMAL");
  console.log(`💾 SQLite database ready at ${localDbPath}`);
  return sqliteDb;
};

const ensureLibsqlClient = (): Client => {
  if (!process.env.LIBSQL_URL) {
    throw new Error(
      "LIBSQL_URL is not defined. Please configure your Turso/libSQL connection."
    );
  }

  if (!libsqlClient) {
    libsqlClient = createClient({
      url: process.env.LIBSQL_URL,
      authToken: process.env.LIBSQL_AUTH_TOKEN,
    });
    console.log(`🔗 Connected to libSQL database: ${process.env.LIBSQL_URL}`);
  }

  return libsqlClient;
};

class SqliteExecutor implements SqlExecutor {
  constructor(private readonly database: Database.Database) {}

  async run(sql: string, params: SqlValue[] = []): Promise<RunResult> {
    const info = this.database
      .prepare(sql)
      .run(...sanitizeParams(params));
    return {
      changes: info.changes,
      lastInsertRowid: coerceRowId(info.lastInsertRowid),
    };
  }

  async query<T>(
    sql: string,
    params: SqlValue[] = []
  ): Promise<T[]> {
    const rows = this.database
      .prepare(sql)
      .all(...sanitizeParams(params)) as T[];
    return rows;
  }

  async queryOne<T>(
    sql: string,
    params: SqlValue[] = []
  ): Promise<T | undefined> {
    const row = this.database
      .prepare(sql)
      .get(...sanitizeParams(params)) as T | undefined;
    return row ?? undefined;
  }
}

class LibsqlExecutor implements SqlExecutor {
  constructor(private readonly client: Client | Transaction) {}

  private async execute(
    sql: string,
    params: SqlValue[] = []
  ): Promise<ResultSet> {
    return this.client.execute({
      sql,
      args: sanitizeParams(params),
    });
  }

  async run(sql: string, params: SqlValue[] = []): Promise<RunResult> {
    const result = await this.execute(sql, params);
    return {
      changes: result.rowsAffected ?? 0,
      lastInsertRowid: coerceRowId(result.lastInsertRowid),
    };
  }

  async query<T>(
    sql: string,
    params: SqlValue[] = []
  ): Promise<T[]> {
    const result = await this.execute(sql, params);
    return result.rows as T[];
  }

  async queryOne<T>(
    sql: string,
    params: SqlValue[] = []
  ): Promise<T | undefined> {
    const rows = await this.query<T>(sql, params);
    return rows[0];
  }
}

const getExecutor = (): SqlExecutor =>
  useLibsql
    ? new LibsqlExecutor(ensureLibsqlClient())
    : new SqliteExecutor(ensureSqliteDb());

const createDbClient = (executor: SqlExecutor): DbClient => ({
  run: (sql, params) => executor.run(sql, params),
  query: (sql, params) => executor.query(sql, params),
  queryOne: (sql, params) => executor.queryOne(sql, params),
});

export const db: DatabaseFacade = {
  run: (sql, params) => getExecutor().run(sql, params),
  query: (sql, params) => getExecutor().query(sql, params),
  queryOne: (sql, params) => getExecutor().queryOne(sql, params),
  transaction: async <T>(fn: (client: DbClient) => Promise<T>) => {
    if (useLibsql) {
      const client = ensureLibsqlClient();
      const tx = await client.transaction("write");
      const txClient = createDbClient(new LibsqlExecutor(tx));
      try {
        const result = await fn(txClient);
        await tx.commit();
        return result;
      } catch (error) {
        await tx.rollback();
        throw error;
      }
    }

    const executor = new SqliteExecutor(ensureSqliteDb());
    await executor.run("BEGIN IMMEDIATE");
    const txClient = createDbClient(executor);
    try {
      const result = await fn(txClient);
      await executor.run("COMMIT");
      return result;
    } catch (error) {
      await executor.run("ROLLBACK");
      throw error;
    }
  },
};

const splitSqlStatements = (sql: string): string[] => {
  const statements: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment && char === "\n") {
      inLineComment = false;
    }

    if (inBlockComment && char === "*" && next === "/") {
      inBlockComment = false;
      i += 1;
      continue;
    }

    if (!inSingle && !inDouble) {
      if (!inBlockComment && char === "-" && next === "-") {
        inLineComment = true;
      } else if (!inLineComment && char === "/" && next === "*") {
        inBlockComment = true;
      }
    }

    if (inLineComment || inBlockComment) {
      continue;
    }

    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (char === '"' && !inSingle) {
      inDouble = !inDouble;
    }

    if (!inSingle && !inDouble && char === ";") {
      const trimmed = current.trim();
      if (trimmed) {
        statements.push(trimmed);
      }
      current = "";
    } else {
      current += char;
    }
  }

  const trimmed = current.trim();
  if (trimmed) {
    statements.push(trimmed);
  }

  return statements;
};

const loadSchemaStatements = async (): Promise<string[]> => {
  for (const candidate of schemaSearchPaths) {
    if (fs.existsSync(candidate)) {
      const content = await fs.promises.readFile(candidate, "utf-8");
      console.log(`📄 Using schema file: ${candidate}`);
      return splitSqlStatements(content);
    }
  }
  throw new Error(
    `Schema file not found. Checked: ${schemaSearchPaths.join(", ")}`
  );
};

const tableExists = async (table: string): Promise<boolean> => {
  const row = await db.queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name=?`,
    [table]
  );
  return (row?.count ?? 0) > 0;
};

const blockOnPromise = <T>(promise: Promise<T>): T => {
  if (!useLibsql) {
    throw new Error("blockOnPromise should only be used in libSQL mode");
  }
  const sab = new SharedArrayBuffer(4);
  const view = new Int32Array(sab);
  let result: T | undefined;
  let error: unknown;
  promise
    .then((value) => {
      result = value;
      Atomics.store(view, 0, 1);
      Atomics.notify(view, 0);
    })
    .catch((err) => {
      error = err;
      Atomics.store(view, 0, 2);
      Atomics.notify(view, 0);
    });
  while (true) {
    const state = Atomics.load(view, 0);
    if (state === 0) {
      Atomics.wait(view, 0, 0);
    } else {
      break;
    }
  }
  if (error) {
    throw error;
  }
  return result as T;
};

const resolveCompatExecutor = (): SqlExecutor => {
  if (compatTransactionExecutor) {
    return compatTransactionExecutor;
  }
  return new LibsqlExecutor(ensureLibsqlClient());
};

const createCompatStatement = (sql: string): LegacyStatement => ({
  run: (...params: SqlValue[]) => {
    const result = blockOnPromise(resolveCompatExecutor().run(sql, params));
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid ?? 0,
    };
  },
  get: (...params: SqlValue[]) =>
    blockOnPromise(resolveCompatExecutor().queryOne(sql, params)),
  all: (...params: SqlValue[]) =>
    blockOnPromise(resolveCompatExecutor().query(sql, params)),
});

const getCompatDatabase = (): Database.Database => {
  if (legacyCompatDb) {
    return legacyCompatDb;
  }

  legacyCompatDb = {
    prepare: (sql: string) => createCompatStatement(sql),
    transaction:
      (fn: (...args: any[]) => any) =>
      (...args: any[]) => {
        return blockOnPromise(
          (async () => {
            const client = ensureLibsqlClient();
            const tx = await client.transaction("write");
            const previous = compatTransactionExecutor;
            compatTransactionExecutor = new LibsqlExecutor(tx);
            try {
              const result = fn(...args);
              await tx.commit();
              return result;
            } catch (error) {
              await tx.rollback();
              throw error;
            } finally {
              compatTransactionExecutor = previous;
            }
          })()
        );
      },
  } as unknown as Database.Database;

  return legacyCompatDb;
};

const ensureDefaultAdmin = async (): Promise<void> => {
  const admin = await db.queryOne<{ id: number }>(
    "SELECT id FROM users WHERE email = ?",
    ["admin@example.com"]
  );

  if (admin?.id) {
    return;
  }

  const hashedPassword = await bcrypt.hash("password", 10);
  await db.run(
    `
      INSERT INTO users (email, password, full_name, role, department, status)
      VALUES (?, ?, 'System Administrator', 'admin', 'Operations', 'active')
    `,
    ["admin@example.com", hashedPassword]
  );

  console.log("👤 Created default admin user (admin@example.com / password)");
};

const ensureModulePermissions = async (): Promise<void> => {
  const ensureForModule = async (module: string, role: string) => {
    const actions = ["read", "create", "update", "delete"];
    for (const action of actions) {
      const pretty = module.charAt(0).toUpperCase() + module.slice(1);
      const label = `${action.charAt(0).toUpperCase() + action.slice(1)} ${
        pretty
      }`;
      await db.run(
        `
          INSERT OR IGNORE INTO permissions (name, module, action, description)
          VALUES (?, ?, ?, ?)
        `,
        [label, module, action, `Permission to ${action} ${module}`]
      );
      const perm = await db.queryOne<{ id: number }>(
        "SELECT id FROM permissions WHERE module = ? AND action = ?",
        [module, action]
      );
      if (perm?.id) {
        await db.run(
          `
            INSERT OR IGNORE INTO role_permissions (role, permission_id)
            VALUES (?, ?)
          `,
          [role, perm.id]
        );
      }
    }
  };

  await ensureForModule("sales", "sales");
  await ensureForModule("reservations", "reservation");
  await ensureForModule("accounting", "finance");
};

const ensureSupplementalTables = async (): Promise<void> => {
  const statements = [
    `
      CREATE TABLE IF NOT EXISTS reservation_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_id INTEGER NOT NULL,
        note TEXT NOT NULL,
        note_type TEXT CHECK(note_type IN ('internal', 'interdepartmental', 'supplier_update')) DEFAULT 'internal',
        target_department TEXT,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `,
    `
      CREATE TABLE IF NOT EXISTS reservation_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_id INTEGER NOT NULL,
        document_name TEXT NOT NULL,
        document_type TEXT NOT NULL,
        file_data TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        description TEXT,
        uploaded_by INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `,
    `
      CREATE TABLE IF NOT EXISTS operations_trip_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        note TEXT NOT NULL,
        note_type TEXT CHECK(note_type IN ('internal', 'interdepartmental')) DEFAULT 'internal',
        target_department TEXT,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (trip_id) REFERENCES operations_trips(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `,
    `
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id TEXT UNIQUE NOT NULL,
        booking_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        due_date TEXT NOT NULL,
        payment_terms TEXT,
        status TEXT CHECK(status IN ('Draft', 'Issued', 'Sent', 'Paid', 'Overdue', 'Cancelled')) DEFAULT 'Draft',
        notes TEXT,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (booking_id) REFERENCES reservations(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `,
  ];

  for (const statement of statements) {
    await db.run(statement);
  }
};

const seedDepartments = async (tx: DbClient): Promise<Record<string, number>> => {
  const departments = [
    { name: "Sales", description: "Sales and customer acquisition" },
    { name: "Operations", description: "Operations and logistics" },
    { name: "Support", description: "Customer support and service" },
    { name: "Finance", description: "Billing and accounting" },
  ];

  const ids: Record<string, number> = {};
  for (const dept of departments) {
    await tx.run(
      `
        INSERT OR IGNORE INTO departments (name, description)
        VALUES (?, ?)
      `,
      [dept.name, dept.description]
    );
    const row = await tx.queryOne<{ id: number }>(
      "SELECT id FROM departments WHERE name = ?",
      [dept.name]
    );
    if (row?.id) {
      ids[dept.name] = row.id;
    }
  }

  return ids;
};

const seedUsers = async (
  tx: DbClient
): Promise<Record<string, number>> => {
  const users = [
    {
      email: "manager1@example.com",
      password: "password",
      full_name: "John Manager",
      role: "sales",
      department: "Sales",
    },
    {
      email: "agent1@example.com",
      password: "password",
      full_name: "Jane Agent",
      role: "sales",
      department: "Sales",
    },
    {
      email: "agent2@example.com",
      password: "password",
      full_name: "Bob Agent",
      role: "operations",
      department: "Operations",
    },
    {
      email: "customer1@example.com",
      password: "password",
      full_name: "Alice Customer",
      role: "customer",
      department: null,
    },
  ];

  const ids: Record<string, number> = {};
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await tx.run(
      `
        INSERT OR IGNORE INTO users (
          email, password, full_name, phone, role, department, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'active')
      `,
      [
        user.email,
        hashedPassword,
        user.full_name,
        null,
        user.role,
        user.department ?? null,
      ]
    );
    const row = await tx.queryOne<{ id: number }>(
      "SELECT id FROM users WHERE email = ?",
      [user.email]
    );
    if (row?.id) {
      ids[user.email] = row.id;
    }
  }

  const admin = await tx.queryOne<{ id: number }>(
    "SELECT id FROM users WHERE email = ?",
    ["admin@example.com"]
  );
  if (admin?.id) {
    ids["admin@example.com"] = admin.id;
  }

  return ids;
};

const seedSuppliers = async (tx: DbClient): Promise<number[]> => {
  const suppliers = [
    {
      name: "Airline Express",
      contact_person: "John Smith",
      phone: "+1234567890",
      email: "contact@airline.com",
      address: "123 Airport Rd",
      services: "Flight booking, Tickets",
      status: "Active",
    },
    {
      name: "Hotel Grand",
      contact_person: "Sarah Johnson",
      phone: "+1234567891",
      email: "sales@hotel.com",
      address: "456 Main St",
      services: "Hotel booking, Accommodation",
      status: "Active",
    },
  ];

  const ids: number[] = [];
  for (const supplier of suppliers) {
    await tx.run(
      `
        INSERT OR IGNORE INTO suppliers (
          name, contact_person, phone, email, address, services, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        supplier.name,
        supplier.contact_person,
        supplier.phone,
        supplier.email,
        supplier.address,
        supplier.services,
        supplier.status,
      ]
    );
    const row = await tx.queryOne<{ id: number }>(
      "SELECT id FROM suppliers WHERE name = ?",
      [supplier.name]
    );
    if (row?.id) {
      ids.push(row.id);
    }
  }

  return ids;
};

const seedCustomers = async (
  tx: DbClient,
  userIds: Record<string, number>
): Promise<number[]> => {
  const timestamp = Date.now().toString().slice(-6);
  const customers = [
    {
      customer_id: `CU-${timestamp}1`,
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "+1987654321",
      company: null,
      type: "Individual",
      status: "Active",
      contact_method: "Email",
      assigned_staff_id: userIds["agent1@example.com"],
    },
    {
      customer_id: `CU-${timestamp}2`,
      name: "Tech Corp",
      email: "info@techcorp.com",
      phone: "+1987654322",
      company: "Tech Corp Inc",
      type: "Corporate",
      status: "Active",
      contact_method: "Phone",
      assigned_staff_id: userIds["agent1@example.com"],
    },
    {
      customer_id: `CU-${timestamp}3`,
      name: "Bob Williams",
      email: "bob@example.com",
      phone: "+1987654323",
      company: null,
      type: "Individual",
      status: "Active",
      contact_method: "SMS",
      assigned_staff_id: userIds["agent2@example.com"],
    },
  ];

  const ids: number[] = [];
  for (const customer of customers) {
    await tx.run(
      `
        INSERT OR IGNORE INTO customers (
          customer_id, name, email, phone, company, type, status, contact_method, assigned_staff_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        customer.customer_id,
        customer.name,
        customer.email,
        customer.phone,
        customer.company,
        customer.type,
        customer.status,
        customer.contact_method,
        customer.assigned_staff_id ?? null,
      ]
    );
    const row = await tx.queryOne<{ id: number }>(
      "SELECT id FROM customers WHERE customer_id = ?",
      [customer.customer_id]
    );
    if (row?.id) {
      ids.push(row.id);
    }
  }

  return ids;
};

const seedLeads = async (
  tx: DbClient,
  userIds: Record<string, number>
): Promise<void> => {
  const timestamp = Date.now().toString().slice(-6);
  const leads = [
    {
      lead_id: `LD-${timestamp}1`,
      name: "David Lee",
      email: "david@example.com",
      phone: "+1122334455",
      company: null,
      source: "Website",
      type: "B2C",
      status: "New",
      agent_id: userIds["agent1@example.com"],
      value: 5000,
    },
    {
      lead_id: `LD-${timestamp}2`,
      name: "Enterprise Solutions",
      email: "sales@enterprise.com",
      phone: "+1122334456",
      company: "Enterprise Solutions",
      source: "Social Media",
      type: "B2B",
      status: "Qualified",
      agent_id: userIds["agent1@example.com"],
      value: 25000,
    },
  ];

  for (const lead of leads) {
    await tx.run(
      `
        INSERT OR IGNORE INTO leads (
          lead_id, name, email, phone, company, source, type, status, agent_id, value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        lead.lead_id,
        lead.name,
        lead.email,
        lead.phone,
        lead.company,
        lead.source,
        lead.type,
        lead.status,
        lead.agent_id ?? null,
        lead.value,
      ]
    );
  }
};

const seedReservations = async (
  tx: DbClient,
  adminId: number,
  customerIds: number[],
  supplierIds: number[]
): Promise<number[]> => {
  if (customerIds.length === 0 || supplierIds.length === 0) {
    return [];
  }

  const timestamp = Date.now().toString().slice(-6);
  const reservations = [
    {
      reservation_id: `RES-${timestamp}1`,
      customer_id: customerIds[0],
      supplier_id: supplierIds[0],
      service_type: "Flight",
      destination: "Paris, France",
      departure_date: new Date(Date.now() + 30 * 86400000).toISOString().split(
        "T"
      )[0],
      return_date: new Date(Date.now() + 37 * 86400000).toISOString().split(
        "T"
      )[0],
      adults: 2,
      children: 0,
      infants: 0,
      total_amount: 2500,
      status: "Confirmed",
      payment_status: "Paid",
      created_by: adminId,
    },
    {
      reservation_id: `RES-${timestamp}2`,
      customer_id: customerIds[1] ?? customerIds[0],
      supplier_id: supplierIds[1] ?? supplierIds[0],
      service_type: "Hotel",
      destination: "Tokyo, Japan",
      departure_date: new Date(Date.now() + 45 * 86400000).toISOString().split(
        "T"
      )[0],
      return_date: new Date(Date.now() + 52 * 86400000).toISOString().split(
        "T"
      )[0],
      adults: 4,
      children: 2,
      infants: 0,
      total_amount: 5400,
      status: "Pending",
      payment_status: "Partial",
      created_by: adminId,
    },
  ];

  const ids: number[] = [];
  for (const reservation of reservations) {
    await tx.run(
      `
        INSERT OR IGNORE INTO reservations (
          reservation_id, customer_id, supplier_id, service_type, destination,
          departure_date, return_date, adults, children, infants, total_amount,
          status, payment_status, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        reservation.reservation_id,
        reservation.customer_id,
        reservation.supplier_id,
        reservation.service_type,
        reservation.destination,
        reservation.departure_date,
        reservation.return_date,
        reservation.adults,
        reservation.children,
        reservation.infants,
        reservation.total_amount,
        reservation.status,
        reservation.payment_status,
        null,
        reservation.created_by,
      ]
    );
    const row = await tx.queryOne<{ id: number }>(
      "SELECT id FROM reservations WHERE reservation_id = ?",
      [reservation.reservation_id]
    );
    if (row?.id) {
      ids.push(row.id);
    }
  }

  return ids;
};

const seedSalesCases = async (
  tx: DbClient,
  adminId: number,
  customerIds: number[],
  leadIds: Array<{ id: number; lead_id: string }>
)=>{
  const timestamp = Date.now().toString().slice(-6);
  const cases = [
    {
      case_id: `SC-${timestamp}1`,
      customer_id: customerIds[0],
      lead_id: leadIds[0]?.id,
      title: "Corporate retreat package",
      description: "Week-long premium retreat for Tech Corp executives.",
      status: "In Progress",
      case_type: "B2B",
      quotation_status: "Sent",
      value: 15000,
      probability: 65,
      expected_close_date: new Date(
        Date.now() + 14 * 86400000
      ).toISOString(),
      assigned_to: adminId,
    },
    {
      case_id: `SC-${timestamp}2`,
      customer_id: customerIds[1] ?? customerIds[0],
      lead_id: leadIds[1]?.id,
      title: "Luxury honeymoon itinerary",
      description: "Custom honeymoon package across Europe.",
      status: "Open",
      case_type: "B2C",
      quotation_status: "Draft",
      value: 9000,
      probability: 45,
      expected_close_date: new Date(
        Date.now() + 21 * 86400000
      ).toISOString(),
      assigned_to: adminId,
    },
  ];

  for (const sc of cases) {
    await tx.run(
      `
        INSERT OR IGNORE INTO sales_cases (
          case_id, customer_id, lead_id, title, description, status, case_type,
          quotation_status, value, probability, expected_close_date,
          assigned_to, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        sc.case_id,
        sc.customer_id,
        sc.lead_id ?? null,
        sc.title,
        sc.description,
        sc.status,
        sc.case_type,
        sc.quotation_status,
        sc.value,
        sc.probability,
        sc.expected_close_date,
        sc.assigned_to,
        adminId,
      ]
    );
  }
};

const seedPayments = async (
  tx: DbClient,
  adminId: number,
  reservationIds: number[],
  customerIds: number[]
): Promise<void> => {
  if (reservationIds.length === 0) {
    return;
  }

  const payments = [
    {
      payment_id: `PAY-${Date.now().toString().slice(-6)}1`,
      booking_id: reservationIds[0],
      customer_id: customerIds[0],
      amount: 2500,
      payment_method: "Credit Card",
      payment_status: "Completed",
      transaction_id: "TXN-001",
      payment_date: new Date().toISOString(),
      created_by: adminId,
    },
  ];

  for (const payment of payments) {
    await tx.run(
      `
        INSERT OR IGNORE INTO payments (
          payment_id, booking_id, customer_id, amount, payment_method,
          payment_status, transaction_id, payment_date, due_date, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payment.payment_id,
        payment.booking_id,
        payment.customer_id,
        payment.amount,
        payment.payment_method,
        payment.payment_status,
        payment.transaction_id,
        payment.payment_date,
        null,
        null,
        payment.created_by,
      ]
    );
  }
};

const createLeadLookup = async (tx: DbClient): Promise<
  Array<{ id: number; lead_id: string }>
> => {
  const rows = await tx.query<{ id: number; lead_id: string }>(
    "SELECT id, lead_id FROM leads ORDER BY id LIMIT 10"
  );
  return rows;
};

export const initializeDatabase = async (): Promise<void> => {
  if (connectionInitialized) {
    return;
  }

  if (useLibsql) {
    ensureLibsqlClient();
  } else {
    ensureSqliteDb();
  }

  connectionInitialized = true;
};

export const closeDatabase = (): void => {
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
  }
  libsqlClient = null;
  connectionInitialized = false;
  schemaInitialized = false;
};

export const initializeSchema = async (): Promise<void> => {
  await initializeDatabase();

  if (schemaInitialized && process.env.FORCE_SCHEMA_INIT !== "1") {
    return;
  }

  const hasUsers = await tableExists("users");
  if (!hasUsers || process.env.FORCE_SCHEMA_INIT === "1") {
    const statements = await loadSchemaStatements();
    for (const statement of statements) {
      await db.run(statement);
    }
    console.log("✅ Database schema applied from sqlite_schema.sql");
  }

  await ensureSupplementalTables();
  await ensureDefaultAdmin();
  await ensureModulePermissions();

  schemaInitialized = true;
};

export const seedData = async (): Promise<void> => {
  await initializeSchema();

  const forceSeed = (process.env.FORCE_DEMO_SEED || "").trim() === "1";
  const existing = await db.queryOne<{
    customers: number;
    reservations: number;
    leads: number;
    sales_cases: number;
  }>(
    `
      SELECT
        (SELECT COUNT(*) FROM customers) AS customers,
        (SELECT COUNT(*) FROM reservations) AS reservations,
        (SELECT COUNT(*) FROM leads) AS leads,
        (SELECT COUNT(*) FROM sales_cases) AS sales_cases
    `
  );

  if (
    !forceSeed &&
    existing &&
    (existing.customers > 0 ||
      existing.reservations > 0 ||
      existing.leads > 0 ||
      existing.sales_cases > 0)
  ) {
    console.log(
      "ℹ️  Demo data already present. Set FORCE_DEMO_SEED=1 to reseed."
    );
    return;
  }

  console.log("🌱 Seeding demo data...");
  await db.transaction(async (tx) => {
    const admin = await tx.queryOne<{ id: number }>(
      "SELECT id FROM users WHERE email = ?",
      ["admin@example.com"]
    );
    if (!admin?.id) {
      throw new Error("Admin user missing after initialization.");
    }

    await seedDepartments(tx);
    const userIds = await seedUsers(tx);
    const supplierIds = await seedSuppliers(tx);
    const customerIds = await seedCustomers(tx, userIds);
    await seedLeads(tx, userIds);
    const leadLookup = await createLeadLookup(tx);
    const reservationIds = await seedReservations(
      tx,
      admin.id,
      customerIds,
      supplierIds
    );
    await seedPayments(tx, admin.id, reservationIds, customerIds);
    await seedSalesCases(tx, admin.id, customerIds, leadLookup);
  });
  console.log("✅ Demo data seeded successfully");
};

export const testConnection = async (): Promise<boolean> => {
  try {
    await db.queryOne("SELECT 1 as ok");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", (error as Error).message);
    return false;
  }
};

export const healthCheck = async (): Promise<{
  healthy: boolean;
  message: string;
}> => {
  const healthy = await testConnection();
  return {
    healthy,
    message: healthy
      ? "Database connection is healthy"
      : "Database connection failed",
  };
};

export const initializeDatabaseWithSeed = async (): Promise<void> => {
  await initializeDatabase();
  await initializeSchema();
  await seedData();
};

export const getDatabase = (): Database.Database => {
  if (useLibsql) {
    return getCompatDatabase();
  }
  return ensureSqliteDb();
};

export default getDatabase;

// Initialize eagerly for local environments
initializeDatabase().catch((error) => {
  console.error("⚠️  Initial database connection failed:", error);
});

