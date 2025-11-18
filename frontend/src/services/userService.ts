import api from './api';
import { User } from './authService';

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'customer' | 'sales' | 'reservation' | 'finance' | 'operations';
  department?: string;
}

export interface UpdateUserData {
  full_name?: string;
  phone?: string;
  role?: 'admin' | 'customer' | 'sales' | 'reservation' | 'finance' | 'operations';
  department?: string;
  status?: 'active' | 'inactive';
}

export interface UserFilters {
  role?: string;
  status?: string;
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedUsers {
  users: User[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const userService = {
  getAllUsers: async (filters: UserFilters = {}): Promise<PaginatedUsers> => {
    const response = await api.get('/users', { params: filters });
    // Backend returns { success: true, data: [...], pagination?: {...} }
    const users = response.data?.data || [];
    const pagination = response.data?.pagination || {
      page: filters.page || 1,
      limit: filters.limit || 100,
      total: users.length,
      totalPages: 1
    };
    return {
      users,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      totalResults: pagination.total
    };
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  createUser: async (userData: CreateUserData): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data.data;
  },

  updateUser: async (id: string, userData: UpdateUserData): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  updateUserStatus: async (id: string, status: 'active' | 'inactive'): Promise<User> => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data.data;
  }
};

export default userService;
