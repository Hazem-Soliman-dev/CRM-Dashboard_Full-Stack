import api from './api';

export interface Lead {
  id: string;
  lead_id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: 'Website' | 'Social Media' | 'Email' | 'Walk-in' | 'Referral';
  type: 'B2B' | 'B2C';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  agent_id?: string;
  agent?: {
    id: string;
    full_name: string;
    email: string;
  };
  value?: number;
  notes?: string;
  last_contact?: string;
  next_followup?: string;
  // Optional links to related entities
  customer_id?: string;
  reservation_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: 'Website' | 'Social Media' | 'Email' | 'Walk-in' | 'Referral';
  type: 'B2B' | 'B2C';
  agent_id?: string;
  value?: number;
  notes?: string;
  next_followup?: string;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: 'Website' | 'Social Media' | 'Email' | 'Walk-in' | 'Referral';
  type?: 'B2B' | 'B2C';
  status?: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  agent_id?: string;
  value?: number;
  notes?: string;
  last_contact?: string;
  next_followup?: string;
  // Optional links to related entities
  customer_id?: string;
  reservation_id?: string;
}

export interface LeadFilters {
  status?: string;
  source?: string;
  type?: string;
  agent_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LeadResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class LeadService {
  // Get all leads with filters (alias for getLeads)
  async getAllLeads(filters: LeadFilters = {}): Promise<LeadResponse> {
    return this.getLeads(filters);
  }

  // Get all leads with filters
  async getLeads(filters: LeadFilters = {}): Promise<LeadResponse> {
    try {
      const response = await api.get('/leads', { params: filters });
      // Backend returns { success: true, data: Lead[], pagination: {...} }
      const data = response.data.data || [];
      const pagination = response.data.pagination || {
        page: 1,
        limit: filters.limit || 10,
        total: data.length,
        totalPages: 1
      };
      return {
        leads: data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: pagination.totalPages
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leads');
    }
  }

  // Get single lead by ID
  async getLeadById(id: string): Promise<Lead> {
    try {
      const response = await api.get(`/leads/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch lead');
    }
  }

  // Create new lead
  async createLead(leadData: CreateLeadData): Promise<Lead> {
    try {
      const response = await api.post('/leads', leadData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create lead');
    }
  }

  // Update lead
  async updateLead(id: string, updateData: UpdateLeadData): Promise<Lead> {
    try {
      const response = await api.put(`/leads/${id}`, updateData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update lead');
    }
  }

  // Delete lead
  async deleteLead(id: string): Promise<void> {
    try {
      await api.delete(`/leads/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete lead');
    }
  }

  // Get overdue leads
  async getOverdueLeads(): Promise<Lead[]> {
    try {
      const response = await api.get('/leads/overdue');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch overdue leads');
    }
  }

  // Convert lead to customer
  async convertToCustomer(id: string): Promise<{ lead: Lead; customerId: string }> {
    try {
      const response = await api.post(`/leads/${id}/convert`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to convert lead');
    }
  }

  // Update lead status
  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    try {
      const response = await api.patch(`/leads/${id}/status`, { status });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update lead status');
    }
  }

  // Schedule follow-up
  async scheduleFollowUp(id: string, next_followup: string, notes?: string): Promise<Lead> {
    try {
      const response = await api.patch(`/leads/${id}/follow-up`, { 
        next_followup, 
        notes 
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to schedule follow-up');
    }
  }
}

export default new LeadService();
