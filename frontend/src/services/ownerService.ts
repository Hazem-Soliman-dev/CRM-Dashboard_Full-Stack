import api from './api';

export interface Owner {
  id: number;
  ownerId: string;
  companyName: string;
  primaryContact?: string | null;
  email?: string | null;
  phone?: string | null;
  status: 'Active' | 'Onboarding' | 'Dormant';
  portfolioSize: number;
  locations: string[];
  notes?: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerFilters {
  status?: 'Active' | 'Onboarding' | 'Dormant' | 'All';
  search?: string;
  page?: number;
  limit?: number;
}

const ownerService = {
  async getOwners(filters: OwnerFilters = {}): Promise<Owner[]> {
    const response = await api.get('/owners', { params: filters });
    // Support optional pagination in backend; return data array for now
    return response.data.data;
  },

  async getOwnerById(id: number): Promise<Owner> {
    const response = await api.get(`/owners/${id}`);
    return response.data.data;
  },

  async createOwner(payload: Partial<Owner>): Promise<Owner> {
    const response = await api.post('/owners', payload);
    return response.data.data;
  },

  async updateOwner(id: number, payload: Partial<Owner>): Promise<Owner> {
    const response = await api.put(`/owners/${id}`, payload);
    return response.data.data;
  },

  async deleteOwner(id: number): Promise<void> {
    await api.delete(`/owners/${id}`);
  },
  async assignManager(ownerId: number, managerId: string | null): Promise<Owner> {
    const response = await api.post(`/owners/${ownerId}/assign-manager`, { managerId });
    return response.data.data;
  }
};

export default ownerService;

