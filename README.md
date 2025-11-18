# ERP-CRM Project

A unified ERP-CRM system built with Node.js, Express, TypeScript, React, and SQLite. This monorepo contains both the backend API and frontend dashboard, designed for seamless deployment on Vercel.

## 📁 Project Structure

```
ERP-CRM-Project/
├── backend/          # Node.js/Express API server
│   ├── api/         # Vercel serverless entry point
│   ├── src/         # Source code (controllers, models, routes, etc.)
│   └── dist/        # Compiled JavaScript
├── frontend/         # React/Vite frontend application
│   ├── src/         # React components and pages
│   └── dist/        # Production build output
├── package.json      # Root workspace configuration
├── vercel.json       # Vercel deployment configuration
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Git**

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ERP-CRM-Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and set at minimum:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Backend API on `http://localhost:5000`
   - Frontend app on `http://localhost:5173`

5. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:5000/api/v1

### Seed Data

The database automatically seeds with demo data on first initialization. You can also manually seed:

```bash
npm run seed
```

**Default Login Credentials:**
- Email: `admin@example.com`
- Password: `password`

**Test Users:**
- `manager1@example.com` / `password`
- `agent1@example.com` / `password`
- `agent2@example.com` / `password`
- `customer1@example.com` / `password`

## 🛠️ Available Scripts

### Root Level

- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build the frontend bundle for Vercel/static hosting
- `npm run build:all` - Build backend (tsc) + frontend (Vite) locally
- `npm run seed` - Run database seed script
- `npm run install:all` - Install dependencies for all workspaces

### Backend (`backend/`)

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:seed` - Seed database with test data

### Frontend (`frontend/`)

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 📦 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT
- **Validation**: express-validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router

## 🌐 Deployment

### Vercel Deployment

This project is configured for seamless deployment on Vercel as a monorepo.

1. **Connect to Vercel**
   - Push your code to GitHub
   - Import the repository in Vercel dashboard
   - Vercel will automatically detect the monorepo structure

2. **Configure Environment Variables**
   
   In Vercel dashboard (Development/Preview/Production scopes), add:
   - `JWT_SECRET`
   - `LIBSQL_URL` / `LIBSQL_AUTH_TOKEN`
   - `FRONTEND_URL`, `PRINT_BASE_URL`
   - `VITE_API_BASE_URL`
   Then sync them locally with `vercel env pull .env`.

3. **Deploy**
   - Vercel will automatically build and deploy on every push to main branch
   - The first deployment will initialize the database with seed data
   - Use `vercel dev` locally to mirror the monorepo build/runtime before pushing

### Deployment Architecture

- **API Routes**: `/api/*` → Backend serverless functions
- **Static Files**: All other routes → Frontend React app
- **Database**: Turso/libSQL (persistent) with automatic seeding on cold start

**Note**: The built-in compatibility layer still supports local SQLite for development while pointing production deployments at libSQL.

## 🔐 Environment Variables

### Required

- `JWT_SECRET` - Secret key for JWT token signing (minimum 32 characters)
- `LIBSQL_URL` - Turso/libSQL database URL
- `LIBSQL_AUTH_TOKEN` - Auth token for the libSQL database

### Optional

- `JWT_EXPIRES_IN` - JWT token expiration (default: `7d`)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: `30d`)
- `NODE_ENV` - Environment mode (default: `production` on Vercel)
- `PORT` - Server port (default: `5000`)
- `VITE_API_BASE_URL` - Frontend API base URL (default: `/api/v1` in production)
- `FORCE_DEMO_SEED` - Force reseed data (set to `1` to enable)
- `FRONTEND_URL` - Origin allowed in REST responses (used by invoices, PDFs)
- `PRINT_BASE_URL` - Absolute base URL for print-ready pages
- `PDF_MAX_CONCURRENCY` - Limits parallel headless-browser PDF jobs (default `2`)
- `CHROME_EXECUTABLE_PATH` - Local Chrome/Chromium path for PDF rendering during development
- `FORCE_SCHEMA_INIT` - Force schema reinitialization (set to `1` to enable)

## 📊 Database

The project uses SQLite for simplicity and ease of deployment.

### Local Development
- Database file: `backend/database.db`
- Automatically created on first run
- Seed data loads automatically

### Production (Vercel)
- Recommended: Turso/libSQL with `LIBSQL_URL` + `LIBSQL_AUTH_TOKEN`
- The bundled compatibility layer still works locally with `better-sqlite3`
- Automatically seeds the persistent database on first cold start

### Configuring libSQL / Turso
1. Install the Turso CLI and create a database:
   ```bash
   turso db create erp-crm-production
   turso db tokens create erp-crm-production
   ```
2. Copy the connection string into `LIBSQL_URL` and the token into `LIBSQL_AUTH_TOKEN`.
3. Run the local seed script once to upload schema/data:
   ```bash
   npm run db:seed --workspace backend
   ```
4. Deploy to Vercel with the two environment variables defined for Development/Preview/Production scopes.

### Schema Management
- Schema is defined in `backend/sqlite_schema.sql`
- Automatically initialized on first run
- Migrations handled automatically

## 🖨️ PDF Rendering

- Uses `puppeteer-core` + `@sparticuz/chromium` for Vercel compatibility.
- For local development, set `CHROME_EXECUTABLE_PATH` to your Chrome/Chromium binary (or install the Chromium binary provided by the `@sparticuz/chromium` package).
- Tune `PDF_MAX_CONCURRENCY` to limit parallel jobs when exporting large reports.
- The dedicated `backend/api/reports.ts` function is configured with higher memory/time limits on Vercel.

## 🔑 Authentication

The API uses JWT-based authentication:

1. **Login**: `POST /api/v1/auth/login`
   ```json
   {
     "email": "admin@example.com",
     "password": "password"
   }
   ```

2. **Use Token**: Include in Authorization header
   ```
   Authorization: Bearer <your-jwt-token>
   ```

3. **Refresh Token**: `POST /api/v1/auth/refresh-token`
   ```json
   {
     "refreshToken": "<your-refresh-token>"
   }
   ```

## 📝 API Documentation

### Base URL
- **Local**: `http://localhost:5000/api/v1`
- **Production**: `https://your-domain.vercel.app/api/v1`

### Main Endpoints

- **Authentication**: `/api/v1/auth/*`
- **Users**: `/api/v1/users/*`
- **Customers**: `/api/v1/customers/*`
- **Leads**: `/api/v1/leads/*`
- **Reservations**: `/api/v1/reservations/*`
- **Payments**: `/api/v1/payments/*`
- **Sales Cases**: `/api/v1/sales-cases/*`
- **Support**: `/api/v1/support/*`
- **Dashboard**: `/api/v1/dashboard/*`

See `backend/README.md` for detailed API documentation.

## 🐛 Troubleshooting

### Database Issues

**Problem**: Database not initializing
- **Solution**: Check that `sqlite_schema.sql` exists in `backend/` directory
- **Solution**: Ensure write permissions for database directory

**Problem**: Seed data not loading
- **Solution**: Check console logs for seed errors
- **Solution**: Set `FORCE_DEMO_SEED=1` to force reseed

### Build Issues

**Problem**: Build fails on Vercel
- **Solution**: Ensure Node.js version is 18+ in `package.json` engines
- **Solution**: Check that all dependencies are listed in `package.json`

### API Connection Issues

**Problem**: Frontend can't connect to API in production
- **Solution**: Verify `VITE_API_BASE_URL` is set to `/api/v1` (relative path)
- **Solution**: Check Vercel routing configuration in `vercel.json`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review API documentation in `backend/README.md`
3. Check server logs for detailed error messages
4. Verify environment variables are set correctly

## 🪄 Fallback: Split Repositories

If you prefer hosting the backend outside of Vercel:
1. Move the `backend/` directory into its own repository and add a Dockerfile or Procfile for your target platform (Render/Railway/Fly).
2. Reuse the same `env.example` file—only `VITE_API_BASE_URL` in the frontend needs to point to the hosted API (e.g. `https://api.example.com/api/v1`).
3. In Vercel, remove the `/api/*` route and deploy only the frontend workspace. All REST calls will proxy to the remote backend via the configured `VITE_API_BASE_URL`.

## 🎯 Next Steps

- [ ] Add comprehensive testing (Jest/Vitest)
- [ ] Implement CI/CD pipeline
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Migrate to persistent database for production
- [ ] Add monitoring and logging (Sentry, LogRocket)
- [ ] Implement file upload functionality
- [ ] Add email notifications
- [ ] Create admin dashboard enhancements

