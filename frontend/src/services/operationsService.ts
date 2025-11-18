import api from "./api";

export type TripStatus =
  | "Planned"
  | "In Progress"
  | "Issue"
  | "Completed"
  | "Delayed";

export interface OptionalService {
  id: number;
  serviceCode: string;
  tripId: number;
  serviceName: string;
  category?: string | null;
  price: number;
  addedBy?: string | null;
  addedDate?: string | null;
  status: "Added" | "Confirmed" | "Cancelled";
  invoiced: boolean;
}

export interface OperationsTrip {
  id: number;
  tripCode: string;
  bookingReference?: string | null;
  customerName: string;
  customerCount: number;
  itinerary?: string | null;
  duration?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  destinations: string[];
  assignedGuide?: string | null;
  assignedDriver?: string | null;
  transport?: string | null;
  transportDetails?: string | null;
  status: TripStatus;
  specialRequests?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  optionalServices: OptionalService[];
}

export interface TripFilters {
  status?: TripStatus | "All";
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface CreateTripPayload {
  bookingReference?: string;
  customerName: string;
  customerCount?: number;
  itinerary?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  destinations?: string[];
  assignedGuide?: string;
  assignedDriver?: string;
  transport?: string;
  transportDetails?: string;
  status?: TripStatus;
  specialRequests?: string;
  notes?: string;
}

export interface UpdateTripPayload extends Partial<CreateTripPayload> {}

export interface AssignStaffPayload {
  assignedGuide: string;
  assignedDriver: string;
  transport: string;
  transportDetails?: string;
}

export interface OptionalServicePayload {
  serviceName: string;
  category?: string;
  price?: number;
  addedBy?: string;
  addedDate?: string;
  status?: "Added" | "Confirmed" | "Cancelled";
  invoiced?: boolean;
}

const operationsService = {
  async getTrips(filters: TripFilters = {}): Promise<OperationsTrip[]> {
    const response = await api.get("/operations/trips", { params: filters });
    return response.data.data;
  },

  async getTrip(id: number): Promise<OperationsTrip> {
    const response = await api.get(`/operations/trips/${id}`);
    return response.data.data;
  },

  async createTrip(payload: CreateTripPayload): Promise<OperationsTrip> {
    const response = await api.post("/operations/trips", payload);
    return response.data.data;
  },

  async updateTrip(
    id: number,
    payload: UpdateTripPayload
  ): Promise<OperationsTrip> {
    const response = await api.put(`/operations/trips/${id}`, payload);
    return response.data.data;
  },

  async updateTripStatus(
    id: number,
    status: TripStatus
  ): Promise<OperationsTrip> {
    const response = await api.patch(`/operations/trips/${id}/status`, {
      status,
    });
    return response.data.data;
  },

  async assignStaff(
    id: number,
    payload: AssignStaffPayload
  ): Promise<OperationsTrip> {
    const response = await api.patch(`/operations/trips/${id}/staff`, payload);
    return response.data.data;
  },

  async deleteTrip(id: number): Promise<void> {
    await api.delete(`/operations/trips/${id}`);
  },

  async getOptionalServices(tripId: number): Promise<OptionalService[]> {
    const response = await api.get(`/operations/trips/${tripId}/services`);
    return response.data.data;
  },

  async addOptionalService(
    tripId: number,
    payload: OptionalServicePayload
  ): Promise<OptionalService> {
    const response = await api.post(
      `/operations/trips/${tripId}/services`,
      payload
    );
    return response.data.data;
  },

  async updateOptionalService(
    tripId: number,
    serviceId: number,
    payload: OptionalServicePayload
  ): Promise<OptionalService> {
    const response = await api.put(
      `/operations/trips/${tripId}/services/${serviceId}`,
      payload
    );
    return response.data.data;
  },

  async deleteOptionalService(
    tripId: number,
    serviceId: number
  ): Promise<void> {
    await api.delete(`/operations/trips/${tripId}/services/${serviceId}`);
  },
};

export default operationsService;
