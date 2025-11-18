import api from './api';

export interface Payment {
  id: string;
  payment_id: string;
  booking_id: string;
  booking?: {
    id: string;
    reservation_id: string;
    customer_id: string;
    customer_name: string;
    destination: string;
    total_amount: number;
  };
  customer_id: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  amount: number;
  payment_method: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Check' | 'Other';
  payment_status: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Partially Refunded';
  transaction_id?: string;
  payment_date: string;
  due_date?: string;
  notes?: string;
  created_by: string;
  created_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  booking_id: string;
  customer_id: string;
  amount: number;
  payment_method: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Check' | 'Other';
  payment_status?: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Partially Refunded';
  transaction_id?: string;
  payment_date: string;
  due_date?: string;
  notes?: string;
}

export interface UpdatePaymentData {
  amount?: number;
  payment_method?: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Check' | 'Other';
  payment_status?: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Partially Refunded';
  transaction_id?: string;
  payment_date?: string;
  due_date?: string;
  notes?: string;
}

export interface PaymentFilters {
  payment_status?: string;
  payment_method?: string;
  customer_id?: string;
  booking_id?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedPayments {
  payments: Payment[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const paymentService = {
  getAllPayments: async (filters: PaymentFilters = {}): Promise<PaginatedPayments> => {
    const response = await api.get('/payments', { params: filters });
    // Backend returns { success: true, data: [...], pagination: {...} }
    const data = response.data?.data;
    // Handle both direct array and paginated response
    const payments = Array.isArray(data) ? data : (data?.payments || []);
    const pagination = response.data?.pagination || {
      page: filters.page || 1,
      limit: filters.limit || 10,
      total: payments.length,
      totalPages: 1
    };
    return {
      payments: Array.isArray(payments) ? payments : [],
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages || Math.ceil((pagination.total || payments.length) / (pagination.limit || 10)),
      totalResults: pagination.total || payments.length
    };
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data.data;
  },

  createPayment: async (paymentData: CreatePaymentData): Promise<Payment> => {
    const response = await api.post('/payments', paymentData);
    return response.data.data;
  },

  updatePayment: async (id: string, paymentData: UpdatePaymentData): Promise<Payment> => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data.data;
  },

  deletePayment: async (id: string): Promise<void> => {
    await api.delete(`/payments/${id}`);
  },

  getPaymentStats: async (): Promise<any> => {
    const response = await api.get('/payments/stats');
    return response.data.data;
  },

  getCustomerPayments: async (customerId: string, page = 1, limit = 10): Promise<PaginatedPayments> => {
    const response = await api.get(`/payments/customer/${customerId}`, {
      params: { page, limit }
    });
    const payments = response.data?.data || [];
    const pagination = response.data?.pagination || {
      page,
      limit,
      total: payments.length,
      totalPages: 1
    };
    return {
      payments,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      totalResults: pagination.total
    };
  },

  getPaymentsByBooking: async (bookingId: string, page = 1, limit = 10): Promise<PaginatedPayments> => {
    const response = await api.get(`/payments/booking/${bookingId}`, {
      params: { page, limit }
    });
    const payments = response.data?.data || [];
    const pagination = response.data?.pagination || {
      page,
      limit,
      total: payments.length,
      totalPages: 1
    };
    return {
      payments,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      totalResults: pagination.total
    };
  },

  updatePaymentStatus: async (id: string, payment_status: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Partially Refunded'): Promise<Payment> => {
    const response = await api.patch(`/payments/${id}/status`, { payment_status });
    return response.data.data;
  },

  processRefund: async (id: string, amount: number, reason?: string): Promise<Payment> => {
    const response = await api.post(`/payments/${id}/refund`, { amount, reason });
    return response.data.data;
  }
};

export default paymentService;
