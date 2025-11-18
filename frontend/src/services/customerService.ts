import api from "./api";

export interface Customer {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: "Individual" | "Corporate";
  status: "Active" | "Inactive" | "Suspended";
  contact_method: "Email" | "Phone" | "SMS";
  assigned_staff_id?: string;
  assigned_staff?: {
    id: string;
    full_name: string;
    email: string;
  };
  total_bookings: number;
  total_value: number;
  last_trip?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: "Individual" | "Corporate";
  contact_method?: "Email" | "Phone" | "SMS";
  assigned_staff_id?: string;
  notes?: string;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  type?: "Individual" | "Corporate";
  status?: "Active" | "Inactive" | "Suspended";
  contact_method?: "Email" | "Phone" | "SMS";
  assigned_staff_id?: string;
  notes?: string;
}

export interface CustomerFilters {
  status?: string;
  type?: string;
  assigned_staff_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedCustomers {
  customers: Customer[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// Transform snake_case backend data to camelCase for frontend
const transformCustomer = (customer: any): any => {
  // Ensure total_bookings is a number (handle null, undefined, or string)
  const totalBookings = customer.total_bookings !== null && customer.total_bookings !== undefined
    ? (typeof customer.total_bookings === 'number' ? customer.total_bookings : parseInt(String(customer.total_bookings), 10) || 0)
    : 0;

  return {
    ...customer,
    assignedStaff:
      customer.assigned_staff?.full_name || customer.assigned_staff_id || "",
    contactMethod: customer.contact_method || "Email",
    totalBookings: totalBookings,
    totalValue: customer.total_value || 0,
    lastTrip: customer.last_trip || customer.last_trip,
    createdAt: customer.created_at,
    updatedAt: customer.updated_at,
    // Keep original fields for backward compatibility
    assigned_staff: customer.assigned_staff,
    assigned_staff_id: customer.assigned_staff_id,
    contact_method: customer.contact_method,
    total_bookings: totalBookings,
    total_value: customer.total_value || 0,
    last_trip: customer.last_trip,
    created_at: customer.created_at,
    updated_at: customer.updated_at,
  };
};

const customerService = {
  getAllCustomers: async (
    filters: CustomerFilters = {}
  ): Promise<PaginatedCustomers> => {
    const response = await api.get("/customers", { params: filters });
    // Backend returns { success: true, data: [...], pagination: {...} }
    const customers = response.data?.data || [];
    // Transform snake_case to camelCase
    const transformedCustomers = customers.map(transformCustomer);
    const pagination = response.data?.pagination || {
      page: filters.page || 1,
      limit: filters.limit || 10,
      total: customers.length,
      totalPages: 1,
    };
    return {
      customers: transformedCustomers,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      totalResults: pagination.total,
    };
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return transformCustomer(response.data.data);
  },

  createCustomer: async (
    customerData: CreateCustomerData
  ): Promise<Customer> => {
    const response = await api.post("/customers", customerData);
    return transformCustomer(response.data.data);
  },

  updateCustomer: async (
    id: string,
    customerData: UpdateCustomerData
  ): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, customerData);
    return transformCustomer(response.data.data);
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  getCustomerStats: async (id: string): Promise<any> => {
    const response = await api.get(`/customers/${id}/stats`);
    return response.data.data;
  },

  getCustomerBookings: async (
    id: string,
    page = 1,
    limit = 10
  ): Promise<any> => {
    const response = await api.get(`/customers/${id}/bookings`, {
      params: { page, limit },
    });
    return response.data;
  },

  getCustomerPayments: async (
    id: string,
    page = 1,
    limit = 10
  ): Promise<any> => {
    const response = await api.get(`/customers/${id}/payments`, {
      params: { page, limit },
    });
    return response.data;
  },

  updateCustomerStatus: async (
    id: string,
    status: "Active" | "Inactive" | "Suspended"
  ): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}/status`, { status });
    return transformCustomer(response.data.data);
  },

  assignCustomerToStaff: async (
    id: string,
    assigned_staff_id: string
  ): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}/assign`, {
      assigned_staff_id,
    });
    return transformCustomer(response.data.data);
  },
};

export default customerService;
