import api from './api';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TripStatus = 'Planned' | 'In Progress' | 'Issue' | 'Completed';

export interface OperationsTaskTripSummary {
  id: number;
  tripCode: string;
  bookingReference?: string | null;
  status: TripStatus;
  startDate?: string | null;
  endDate?: string | null;
  customerName: string;
  assignedGuide?: string | null;
  assignedDriver?: string | null;
}

export interface OperationsTask {
  id: number;
  taskId: string;
  tripId?: number | null;
  title: string;
  tripReference?: string | null;
  customerName?: string | null;
  scheduledAt?: string | null;
  location?: string | null;
  assignedTo?: number | null;
  assignedToName?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  taskType?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  trip?: OperationsTaskTripSummary | null;
}

export interface TaskFilters {
  status?: TaskStatus | 'All';
  priority?: TaskPriority | 'All';
  assignedTo?: number;
  dateFrom?: string;
  dateTo?: string;
  tripId?: number;
}

export interface CreateTaskPayload {
  title: string;
  tripId?: number;
  tripReference?: string;
  customerName?: string;
  scheduledAt?: string;
  location?: string;
  assignedTo?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  taskType?: string;
  notes?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}

const taskService = {
  async getTasks(filters: TaskFilters = {}): Promise<OperationsTask[]> {
    const response = await api.get('/operations/tasks', { params: filters });
    return response.data.data;
  },

  async getTask(id: number): Promise<OperationsTask> {
    const response = await api.get(`/operations/tasks/${id}`);
    return response.data.data;
  },

  async createTask(payload: CreateTaskPayload): Promise<OperationsTask> {
    const response = await api.post('/operations/tasks', payload);
    return response.data.data;
  },

  async updateTask(id: number, payload: UpdateTaskPayload): Promise<OperationsTask> {
    const response = await api.put(`/operations/tasks/${id}`, payload);
    return response.data.data;
  },

  async updateTaskStatus(id: number, status: TaskStatus): Promise<OperationsTask> {
    const response = await api.patch(`/operations/tasks/${id}/status`, { status });
    return response.data.data;
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/operations/tasks/${id}`);
  }
};

export default taskService;

