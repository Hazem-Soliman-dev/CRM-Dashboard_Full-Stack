import api from './api';

export interface SupportTicket {
  id: string;
  ticket_id: string;
  customer_id: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assigned_to?: string;
  assigned_user?: {
    id: string;
    full_name: string;
    email: string;
  };
  created_by: string;
  created_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSupportTicketData {
  customer_id: string;
  subject: string;
  description: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  assigned_to?: string;
}

export interface UpdateSupportTicketData {
  subject?: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  status?: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assigned_to?: string;
}

export interface SupportTicketFilters {
  status?: string;
  priority?: string;
  assigned_to?: string;
  customer_id?: string;
  created_by?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedTickets {
  tickets: SupportTicket[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const supportService = {
  getAllTickets: async (filters: SupportTicketFilters = {}): Promise<PaginatedTickets> => {
    const response = await api.get('/support/tickets', { params: filters });
    // Backend returns { success: true, data: SupportTicket[], pagination: {...} }
    const data = response.data.data || [];
    const pagination = response.data.pagination || {
      page: 1,
      limit: filters.limit || 10,
      total: data.length,
      totalPages: 1
    };
    return {
      tickets: data,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      totalResults: pagination.total
    };
  },

  getTicketById: async (id: string): Promise<SupportTicket> => {
    const response = await api.get(`/support/tickets/${id}`);
    return response.data.data;
  },

  createTicket: async (ticketData: CreateSupportTicketData): Promise<SupportTicket> => {
    const response = await api.post('/support/tickets', ticketData);
    return response.data.data;
  },

  updateTicket: async (id: string, ticketData: UpdateSupportTicketData): Promise<SupportTicket> => {
    const response = await api.put(`/support/tickets/${id}`, ticketData);
    return response.data.data;
  },

  deleteTicket: async (id: string): Promise<void> => {
    await api.delete(`/support/tickets/${id}`);
  },

  getTicketStats: async (): Promise<any> => {
    const response = await api.get('/support/tickets/stats');
    return response.data.data;
  },

  getMyTickets: async (page = 1, limit = 10): Promise<PaginatedTickets> => {
    const response = await api.get('/support/tickets/my', {
      params: { page, limit }
    });
    // Backend returns { success: true, data: SupportTicket[], pagination: {...} }
    const data = response.data.data || [];
    const pagination = response.data.pagination || {
      page,
      limit,
      total: data.length,
      totalPages: 1
    };
    return {
      tickets: data,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      totalResults: pagination.total
    };
  },

  updateTicketStatus: async (id: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'): Promise<SupportTicket> => {
    const response = await api.patch(`/support/tickets/${id}/status`, { status });
    return response.data.data;
  },

  assignTicket: async (id: string, assigned_to: string): Promise<SupportTicket> => {
    const response = await api.patch(`/support/tickets/${id}/assign`, { assigned_to });
    return response.data.data;
  },

  addTicketNote: async (id: string, note: string): Promise<void> => {
    await api.post(`/support/tickets/${id}/notes`, { note });
  },

  getTicketNotes: async (id: string): Promise<any[]> => {
    const response = await api.get(`/support/tickets/${id}/notes`);
    return response.data.data;
  }
};

export default supportService;
