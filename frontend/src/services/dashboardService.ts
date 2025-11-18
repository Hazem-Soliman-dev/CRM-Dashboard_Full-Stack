import api from './api';

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalCustomers: number;
    totalLeads: number;
    totalReservations: number;
    totalPayments: number;
    totalTickets: number;
    totalRevenue: number;
    newLeadsToday?: number;
  };
  recentActivity: {
    recentLeads: any[];
    recentReservations: any[];
  };
}

export interface RevenueTrend {
  month: string;
  revenue: number;
}

export interface LeadSource {
  source: string;
  value: number; // Percentage
  count: number;
  total_value: number;
  color: string;
}

export interface PerformanceMetrics {
  totalLeads?: number;
  totalValue?: number;
  conversionRate?: number;
  teamPerformance?: any[];
}

const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },

  getRevenueTrend: async (period = '30'): Promise<RevenueTrend[]> => {
    const response = await api.get('/dashboard/revenue-trend', {
      params: { period }
    });
    // Backend returns data in format: [{ month: string, revenue: number }]
    const data = response.data.data || [];
    return data.map((item: any) => ({
      month: item.month || item.date || '',
      revenue: parseFloat(item.revenue) || 0
    }));
  },

  getLeadSources: async (): Promise<LeadSource[]> => {
    const response = await api.get('/dashboard/lead-sources');
    // Backend returns data in format: [{ source: string, value: number, color: string, count: number }]
    const data = response.data.data || [];
    return data.map((item: any) => ({
      source: item.source || '',
      value: item.value || 0, // Percentage
      count: item.count || 0,
      total_value: item.total_value || 0,
      color: item.color || '#6B7280'
    }));
  },

  getRecentActivity: async (limit = 10): Promise<any[]> => {
    const response = await api.get('/dashboard/recent-activity', {
      params: { limit }
    });
    return response.data.data;
  },

  getPerformanceMetrics: async (): Promise<PerformanceMetrics> => {
    const response = await api.get('/dashboard/performance');
    return response.data.data;
  },

  getTodayTasks: async (): Promise<{ tasks: any[]; checklist: any[] }> => {
    const response = await api.get('/dashboard/tasks/today');
    return response.data.data;
  }
};

export default dashboardService;
