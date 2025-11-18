import api from './api';

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  services?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierData {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  services?: string;
}

const supplierService = {
  getAllSuppliers: async (): Promise<Supplier[]> => {
    const response = await api.get('/suppliers');
    // Backend wraps data as { suppliers: [...] }
    const data = response.data?.data;
    if (Array.isArray(data)) return data as Supplier[];
    if (data && Array.isArray(data.suppliers)) return data.suppliers as Supplier[];
    return [];
  },

  getSupplierById: async (id: string): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data.data;
  },

  createSupplier: async (data: CreateSupplierData): Promise<Supplier> => {
    const response = await api.post('/suppliers', data);
    return response.data.data;
  },

  updateSupplier: async (id: string, data: Partial<CreateSupplierData>): Promise<Supplier> => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data.data;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },

  updateSupplierStatus: async (id: string, status: 'Active' | 'Inactive'): Promise<Supplier> => {
    const response = await api.patch(`/suppliers/${id}/status`, { status });
    return response.data.data;
  }
};

export default supplierService;
