import api from "./api";

export interface SalesCase {
  id: string;
  case_id: string;
  customer_id: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
  lead_id?: string;
  title: string;
  description?: string;
  status: "Open" | "In Progress" | "Quoted" | "Won" | "Lost";
  case_type?: "B2C" | "B2B";
  value?: number;
  probability: number;
  expected_close_date?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSalesCaseData {
  customer_id: number | string;
  lead_id?: number | string;
  title: string;
  description?: string;
  value?: number;
  probability?: number;
  expected_close_date?: string;
  assigned_to?: number | string;
}

export interface UpdateSalesCaseData {
  title?: string;
  description?: string;
  status?: "Open" | "In Progress" | "Quoted" | "Won" | "Lost";
  case_type?: "B2C" | "B2B";
  quotation_status?: "Draft" | "Sent" | "Accepted" | "Rejected";
  value?: number;
  probability?: number;
  expected_close_date?: string;
  assigned_to?: number | string;
  linked_items?: number[];
  assigned_departments?: number[];
}

export interface SalesCaseFilters {
  status?: string;
  assigned_to?: string;
  customer_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const salesService = {
  getAllSalesCases: async (
    filters: SalesCaseFilters = {}
  ): Promise<{ cases: SalesCase[]; total: number }> => {
    const response = await api.get("/sales-cases", { params: filters });
    // Backend returns { success: true, data: { salesCases: SalesCase[], pagination: {...} } }
    const data = response.data.data || {};
    const salesCases = data.salesCases || [];
    const pagination = data.pagination || {};

    return {
      cases: salesCases,
      total: pagination.total || salesCases.length,
    };
  },

  getSalesCaseById: async (id: string): Promise<SalesCase> => {
    const response = await api.get(`/sales-cases/${id}`);
    return response.data.data;
  },

  createSalesCase: async (data: CreateSalesCaseData): Promise<SalesCase> => {
    const response = await api.post("/sales-cases", data);
    return response.data.data;
  },

  updateSalesCase: async (
    id: string,
    data: UpdateSalesCaseData
  ): Promise<SalesCase> => {
    const response = await api.put(`/sales-cases/${id}`, data);
    return response.data.data;
  },

  deleteSalesCase: async (id: string): Promise<void> => {
    await api.delete(`/sales-cases/${id}`);
  },

  updateSalesCaseStatus: async (
    id: string,
    status: "Open" | "In Progress" | "Quoted" | "Won" | "Lost"
  ): Promise<SalesCase> => {
    const response = await api.patch(`/sales-cases/${id}/status`, { status });
    return response.data.data;
  },

  assignSalesCase: async (
    id: string,
    assigned_to: number | string
  ): Promise<SalesCase> => {
    const response = await api.patch(`/sales-cases/${id}/assign`, {
      assigned_to,
    });
    return response.data.data;
  },

  getSalesCaseStats: async (): Promise<any> => {
    const response = await api.get("/sales-cases/stats");
    return response.data.data;
  },
};

export default salesService;
