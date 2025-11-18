import api from "./api";

export interface Reservation {
  id: string;
  reservation_id: string;
  customer_id: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  supplier_id?: string;
  supplier?: {
    id: string;
    name: string;
    contact_person: string;
    phone: string;
    email: string;
  };
  service_type:
    | "Flight"
    | "Hotel"
    | "Car Rental"
    | "Tour"
    | "Package"
    | "Other";
  destination: string;
  departure_date: string;
  return_date?: string;
  adults: number;
  children: number;
  infants: number;
  total_amount: number;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  payment_status: "Pending" | "Partial" | "Paid" | "Refunded";
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

export interface CreateReservationData {
  customer_id: string;
  supplier_id?: string;
  service_type:
    | "Flight"
    | "Hotel"
    | "Car Rental"
    | "Tour"
    | "Package"
    | "Other";
  destination: string;
  departure_date: string;
  return_date?: string;
  adults: number;
  children?: number;
  infants?: number;
  total_amount: number;
  notes?: string;
}

export interface UpdateReservationData {
  supplier_id?: string;
  service_type?:
    | "Flight"
    | "Hotel"
    | "Car Rental"
    | "Tour"
    | "Package"
    | "Other";
  destination?: string;
  departure_date?: string;
  return_date?: string;
  adults?: number;
  children?: number;
  infants?: number;
  total_amount?: number;
  status?: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  payment_status?: "Pending" | "Partial" | "Paid" | "Refunded";
  notes?: string;
}

export interface ReservationFilters {
  status?: string;
  payment_status?: string;
  service_type?: string;
  supplier_id?: string;
  customer_id?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedReservations {
  reservations: Reservation[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const reservationService = {
  getAllReservations: async (
    filters: ReservationFilters = {}
  ): Promise<PaginatedReservations> => {
    const response = await api.get("/reservations", { params: filters });
    // Backend returns { success: true, data: [...], pagination: {...} }
    const reservations = response.data?.data || [];
    const pagination = response.data?.pagination || {
      page: filters.page || 1,
      limit: filters.limit || 10,
      total: reservations.length,
      totalPages: 1
    };

    return {
      reservations,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      totalResults: pagination.total,
    };
  },

  getReservationById: async (id: string): Promise<Reservation> => {
    const response = await api.get(`/reservations/${id}`);
    return response.data.data;
  },

  createReservation: async (
    reservationData: CreateReservationData
  ): Promise<Reservation> => {
    const response = await api.post("/reservations", reservationData);
    return response.data.data;
  },

  updateReservation: async (
    id: string,
    reservationData: UpdateReservationData
  ): Promise<Reservation> => {
    const response = await api.put(`/reservations/${id}`, reservationData);
    return response.data.data;
  },

  deleteReservation: async (id: string): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },

  getTodaySchedule: async (): Promise<Reservation[]> => {
    const response = await api.get("/reservations/today-schedule");
    return response.data.data;
  },

  getReservationStats: async (): Promise<any> => {
    const response = await api.get("/reservations/stats");
    return response.data.data;
  },

  updateReservationStatus: async (
    id: string,
    status: "Pending" | "Confirmed" | "Cancelled" | "Completed"
  ): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}/status`, { status });
    return response.data.data;
  },

  updatePaymentStatus: async (
    id: string,
    payment_status: "Pending" | "Partial" | "Paid" | "Refunded"
  ): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}/payment-status`, {
      payment_status,
    });
    return response.data.data;
  },

  getCustomerReservations: async (
    customerId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedReservations> => {
    const response = await api.get(`/reservations/customer/${customerId}`, {
      params: { page, limit },
    });
    // Backend returns { success: true, data: [...], pagination: {...} }
    const reservations = response.data?.data || [];
    const pagination = response.data?.pagination || {
      page,
      limit,
      total: reservations.length,
      totalPages: 1,
    };
    return {
      reservations,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      totalResults: pagination.total,
    };
  },
};

export default reservationService;
