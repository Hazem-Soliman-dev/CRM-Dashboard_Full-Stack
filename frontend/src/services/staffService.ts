import api from "./api";

const staffService = {
  getAllStaff: async (params = {}) => {
    try {
      const response = await api.get("/users", { params });
      const data = response.data?.data;
      if (Array.isArray(data)) return { staff: data };
      if (data && Array.isArray(data.users)) return { staff: data.users };
      if (data && Array.isArray(data.staff)) return { staff: data.staff };
    } catch (err) {
      console.error("getAllStaff error", err);
    }
    return { staff: [] };
  },

  getStaffById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createStaff: async (staffData: any) => {
    const response = await api.post("/users", staffData);
    return response.data;
  },

  updateStaff: async (id: string, staffData: any) => {
    const response = await api.put(`/users/${id}`, staffData);
    return response.data;
  },

  deleteStaff: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default staffService;
