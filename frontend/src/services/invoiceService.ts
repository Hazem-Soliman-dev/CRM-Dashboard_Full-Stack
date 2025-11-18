import api from './api';

const invoiceService = {
  // Get all invoices for a specific booking
  getInvoicesForBooking: async (bookingId: string, params = {}) => {
    const response = await api.get(`/bookings/${bookingId}/invoices`, { params });
    // Backend returns { success: true, data: [...] }
    const data = response.data?.data || [];
    return { invoices: Array.isArray(data) ? data : [] };
  },

  // Create a new invoice
  createInvoice: async (invoiceData: any) => {
    const response = await api.post('/invoices', invoiceData);
    // Backend returns { success: true, data: {...} }
    return response.data.data || response.data;
  },

  // Get a single invoice by ID
  getInvoiceById: async (id: string) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data.data;
  },

  // Update an invoice
  updateInvoice: async (id: string, invoiceData: any) => {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data.data;
  },

  // Delete an invoice
  deleteInvoice: async (id: string) => {
    await api.delete(`/invoices/${id}`);
  },
};

export default invoiceService;
