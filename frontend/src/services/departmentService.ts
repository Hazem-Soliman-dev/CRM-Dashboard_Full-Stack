import api from "./api";

const departmentService = {
  // Get all departments
  getAllDepartments: async (params: any = {}) => {
    // const response = await api.get('/departments', { params });
    // return response.data;
    console.warn("Returning mock department data. Endpoint does not exist.");
    return Promise.resolve({
      departments: [
        { id: "1", name: "Sales" },
        { id: "2", name: "Operations" },
        { id: "3", name: "Finance" },
        { id: "4", name: "Reservation" },
        { id: "5", name: "Support" },
      ],
    });
  },

  // Get a single department by ID
  getDepartmentById: async (id: string) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // Create a new department
  createDepartment: async (departmentData: any) => {
    const response = await api.post("/departments", departmentData);
    return response.data;
  },

  // Update a department
  updateDepartment: async (id: string, departmentData: any) => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data;
  },

  // Delete a department
  deleteDepartment: async (id: string) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

export default departmentService;
