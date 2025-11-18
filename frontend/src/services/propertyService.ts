import api from './api';

export interface Property {
  id: number;
  propertyId: string;
  name: string;
  location: string;
  type: 'Apartment' | 'Villa' | 'Commercial' | 'Land';
  status: 'Available' | 'Reserved' | 'Sold' | 'Under Maintenance';
  nightlyRate: number;
  capacity: number;
  occupancy: number;
  description?: string | null;
  owner?: {
    id: number;
    ownerId: string;
    companyName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  status?: Property['status'] | 'All';
  type?: Property['type'] | 'All';
  ownerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const propertyService = {
  async getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
    const response = await api.get('/properties', { params: filters });
    return response.data.data;
  },

  async getPropertyById(id: number): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response.data.data;
  },

  async createProperty(payload: Partial<Property>): Promise<Property> {
    const response = await api.post('/properties', payload);
    return response.data.data;
  },

  async updateProperty(id: number, payload: Partial<Property>): Promise<Property> {
    const response = await api.put(`/properties/${id}`, payload);
    return response.data.data;
  },

  async deleteProperty(id: number): Promise<void> {
    await api.delete(`/properties/${id}`);
  },
  async getPropertyAvailability(propertyId: number): Promise<any[]> {
    const response = await api.get(`/properties/${propertyId}/availability`);
    // Backend returns { success: true, data: { availability: [...] } }
    return response.data.data?.availability || [];
  },
  async updatePropertyAvailability(propertyId: number, availabilityData: any[]): Promise<void> {
    await api.put(`/properties/${propertyId}/availability`, { availability: availabilityData });
  }
};

export default propertyService;

