import api from "./api";

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parent_id?: string;
}

const categoryService = {
  getAllCategories: async (filters?: {
    page?: number;
    limit?: number;
    search?: string;
    parent_id?: string;
  }): Promise<{ categories: Category[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    try {
      const params = {
        ...filters,
        limit: filters?.limit || 10,
        page: filters?.page || 1
      };
      const response = await api.get("/categories", { params });
      // Backend returns { success: true, data: { categories: [...], pagination: {...} } }
      const data = response.data?.data;
      
      if (data && data.categories && data.pagination) {
        return {
          categories: data.categories,
          pagination: data.pagination
        };
      }
      
      // Fallback for old format
      if (Array.isArray(data)) {
        return {
          categories: data,
          pagination: { page: 1, limit: data.length, total: data.length, totalPages: 1 }
        };
      }
      
      return { categories: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  getCategoryTree: async (): Promise<Category[]> => {
    try {
      const response = await api.get("/categories/tree");
      const data = response.data?.data;
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching category tree:", error);
      throw error;
    }
  },

  getCategoryById: async (id: string): Promise<Category> => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },

  getCategoryStats: async (id: string): Promise<{
    totalItems: number;
    activeItems: number;
    totalValue: number;
  }> => {
    try {
      const response = await api.get(`/categories/${id}/stats`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching category stats:", error);
      throw error;
    }
  },

  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    try {
      const response = await api.post("/categories", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (
    id: string,
    data: Partial<CreateCategoryData>
  ): Promise<Category> => {
    try {
      const response = await api.put(`/categories/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error: any) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};

export default categoryService;
