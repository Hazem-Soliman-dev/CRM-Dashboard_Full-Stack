import api from './api';

export interface Attendance {
  id: string;
  user_id: string;
  clock_in?: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  total_hours: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Time' | 'Working' | 'On Leave';
  notes?: string;
  created_at: string;
  updated_at: string;
  // Display fields
  employee?: string;
  employee_name?: string;
  employee_id?: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: string;
  department?: string;
  shift?: string;
  date?: string;
  check_in_time?: string;
  check_out_time?: string;
  original_status?: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: 'Sick' | 'Vacation' | 'Personal' | 'Emergency' | 'Other';
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceFilters {
  user_id?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  staff_id?: string;
}

export interface CreateLeaveRequestData {
  leave_type: 'Sick' | 'Vacation' | 'Personal' | 'Emergency' | 'Other';
  start_date: string;
  end_date: string;
  reason?: string;
}

const attendanceService = {
  /**
   * Get attendance records with filters
   */
  getAttendance: async (filters: AttendanceFilters = {}): Promise<{ attendance: Attendance[]; total: number }> => {
    // Map frontend filter names to backend
    const backendFilters: any = {
      employee_id: filters.user_id || filters.staff_id,
      date_from: filters.date_from,
      date_to: filters.date_to,
      status: filters.status,
      page: filters.page || 1,
      limit: filters.limit || 50
    };
    
    const response = await api.get('/attendance', { params: backendFilters });
    // Backend returns { success: true, data: [...], pagination: {...} }
    const data = response.data?.data || [];
    const pagination = response.data?.pagination || {};
    
    // Map backend format to frontend format
    const mappedAttendance = (Array.isArray(data) ? data : []).map((record: any) => {
      // Map status: Present -> On Time, Leave -> On Leave, etc.
      const statusMap: Record<string, string> = {
        'Present': 'On Time',
        'Absent': 'Absent',
        'Late': 'Late',
        'Half Day': 'Working',
        'Leave': 'On Leave'
      };
      
      const mappedStatus = statusMap[record.status] || record.status;
      
      // Calculate total hours if check_in and check_out are available
      let totalHours = 0;
      if (record.check_in_time && record.check_out_time) {
        try {
          const checkIn = new Date(`${record.date} ${record.check_in_time}`);
          const checkOut = new Date(`${record.date} ${record.check_out_time}`);
          const diffMs = checkOut.getTime() - checkIn.getTime();
          totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
        } catch (error) {
          console.error('Error calculating total hours:', error);
        }
      }
      
      // Format time for display
      const formatTime = (timeStr: string | undefined) => {
        if (!timeStr) return 'N/A';
        if (timeStr.includes('T') || timeStr.includes(' ')) {
          // Already formatted timestamp
          try {
            const date = new Date(timeStr);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          } catch (error) {
            return timeStr;
          }
        }
        // TIME format (HH:MM:SS)
        return timeStr.slice(0, 5); // Return HH:MM
      };
      
      return {
        id: record.id,
        user_id: record.user_id || record.employee_id,
        clock_in: record.clock_in || (record.check_in_time ? `${record.date} ${record.check_in_time}` : undefined),
        clock_out: record.clock_out || (record.check_out_time ? `${record.date} ${record.check_out_time}` : undefined),
        break_start: record.break_start,
        break_end: record.break_end,
        total_hours: totalHours,
        status: mappedStatus as any,
        original_status: record.status, // Keep original for backend operations
        notes: record.notes || record.remarks,
        created_at: record.created_at,
        updated_at: record.updated_at,
        // Frontend display fields
        employee: record.employee_name || record.employee || 'Unknown',
        employee_name: record.employee_name,
        checkIn: formatTime(record.clock_in || (record.check_in_time ? `${record.date} ${record.check_in_time}` : undefined)),
        checkOut: formatTime(record.clock_out || (record.check_out_time ? `${record.date} ${record.check_out_time}` : undefined)),
        totalHours: totalHours > 0 ? `${totalHours.toFixed(1)}h` : '0h',
        department: record.department || 'N/A',
        shift: record.shift || 'Day',
        // Keep backend fields for compatibility
        employee_id: record.employee_id,
        date: record.date,
        check_in_time: record.check_in_time,
        check_out_time: record.check_out_time
      };
    });
    
    return {
      attendance: mappedAttendance,
      total: pagination.total || mappedAttendance.length
    };
  },

  getAttendanceById: async (id: string): Promise<Attendance> => {
    const response = await api.get(`/attendance/${id}`);
    return response.data.data;
  },

  clockIn: async (): Promise<Attendance> => {
    const response = await api.post('/attendance/clock-in');
    return response.data.data;
  },

  clockOut: async (): Promise<Attendance> => {
    const response = await api.post('/attendance/clock-out');
    return response.data.data;
  },

  startBreak: async (): Promise<Attendance> => {
    const response = await api.post('/attendance/start-break');
    return response.data.data;
  },

  endBreak: async (): Promise<Attendance> => {
    const response = await api.post('/attendance/end-break');
    return response.data.data;
  },

  getLeaveRequests: async (filters: any = {}): Promise<{ requests: LeaveRequest[]; total: number }> => {
    const response = await api.get('/attendance/leave-requests', { params: filters });
    // Backend returns { success: true, data: [...], pagination: {...} }
    const data = response.data?.data || [];
    const pagination = response.data?.pagination || {};
    
    return {
      requests: Array.isArray(data) ? data : [],
      total: pagination.total || 0
    };
  },

  createLeaveRequest: async (data: CreateLeaveRequestData): Promise<LeaveRequest> => {
    const response = await api.post('/attendance/leave-requests', data);
    return response.data.data;
  },

  approveLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await api.patch(`/attendance/leave-requests/${id}/approve`);
    return response.data.data;
  },

  rejectLeaveRequest: async (id: string, reason?: string): Promise<LeaveRequest> => {
    const response = await api.patch(`/attendance/leave-requests/${id}/reject`, { reason });
    return response.data.data;
  },

  getTodayAttendance: async (): Promise<Attendance | null> => {
    try {
      const response = await api.get('/attendance/today');
      const data = response.data.data;
      if (!data) return null;
      
      // Map backend format to frontend format
      return {
        id: data.id,
        user_id: data.user_id || data.employee_id,
        clock_in: data.clock_in || (data.check_in_time ? `${data.date} ${data.check_in_time}` : undefined),
        clock_out: data.clock_out || (data.check_out_time ? `${data.date} ${data.check_out_time}` : undefined),
        break_start: data.break_start,
        break_end: data.break_end,
        total_hours: data.total_hours || 0,
        status: data.status,
        notes: data.notes || data.remarks,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getAttendanceSummary: async (month: string): Promise<any> => {
    const response = await api.get('/attendance/summary', { params: { month } });
    return response.data.data;
  },

  updateAttendance: async (employeeId: string, data: any): Promise<Attendance> => {
    // Map frontend status to backend status
    const statusMap: Record<string, string> = {
      'On Time': 'Present',
      'Absent': 'Absent',
      'Late': 'Late',
      'Working': 'Half Day',
      'On Leave': 'Leave'
    };
    
    const backendStatus = data.original_status || statusMap[data.status] || data.status || 'Present';
    
    // Map frontend format to backend format
    const updateData: any = {
      user_id: parseInt(employeeId, 10),
      date: data.date || new Date().toISOString().split('T')[0],
      status: backendStatus,
      notes: data.notes,
      remarks: data.notes || data.remarks,
      clock_in: data.clock_in,
      clock_out: data.clock_out,
      check_in_time: data.check_in_time,
      check_out_time: data.check_out_time
    };
    
    const response = await api.put('/attendance', updateData);
    const record = response.data.data;
    
    // Map backend format to frontend format
    return {
      id: record.id,
      user_id: record.user_id || record.employee_id,
      clock_in: record.clock_in || (record.check_in_time ? `${record.date} ${record.check_in_time}` : undefined),
      clock_out: record.clock_out || (record.check_out_time ? `${record.date} ${record.check_out_time}` : undefined),
      break_start: record.break_start,
      break_end: record.break_end,
      total_hours: record.total_hours || 0,
      status: record.status,
      notes: record.notes || record.remarks,
      created_at: record.created_at,
      updated_at: record.updated_at
    };
  }
};

export default attendanceService;
