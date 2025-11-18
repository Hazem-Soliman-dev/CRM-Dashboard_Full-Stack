import api from "./api";

export interface Item {
  id: string;
  item_id: string;
  name: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  price: number;
  cost?: number;
  stock_quantity: number;
  min_stock_level: number;
  status: "Active" | "Inactive" | "Discontinued";
  created_at: string;
  updated_at: string;
}

export interface CreateItemData {
  name: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  price: number;
  cost?: number;
  stock_quantity?: number;
  min_stock_level?: number;
}

const itemService = {
  getAllItems: async (filters?: {
    category_id?: string;
    supplier_id?: string;
    status?: string;
    search?: string;
    low_stock?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ items: Item[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    try {
      const params = {
        ...filters,
        limit: filters?.limit || 10,
        page: filters?.page || 1
      };
      const response = await api.get("/items", { params });
      // Backend returns { success: true, data: { items: [...], pagination: {...} } }
      const data = response.data?.data;
      
      if (data && data.items && data.pagination) {
        return {
          items: data.items,
          pagination: data.pagination
        };
      }
      
      // Fallback for old format
      if (Array.isArray(data)) {
        return {
          items: data,
          pagination: { page: 1, limit: data.length, total: data.length, totalPages: 1 }
        };
      }
      
      return { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    } catch (error: any) {
      console.error("Error fetching items:", error);
      throw error;
    }
  },

  getItemById: async (id: string): Promise<Item> => {
    try {
      const response = await api.get(`/items/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching item:", error);
      throw error;
    }
  },

  createItem: async (data: CreateItemData): Promise<Item> => {
    try {
      const response = await api.post("/items", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Error creating item:", error);
      throw error;
    }
  },

  updateItem: async (
    id: string,
    data: Partial<CreateItemData & { status?: "Active" | "Inactive" | "Discontinued" }>
  ): Promise<Item> => {
    try {
      const response = await api.put(`/items/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error("Error updating item:", error);
      throw error;
    }
  },

  deleteItem: async (id: string): Promise<void> => {
    try {
      await api.delete(`/items/${id}`);
    } catch (error: any) {
      console.error("Error deleting item:", error);
      throw error;
    }
  },

  updateItemStatus: async (
    id: string,
    status: "Active" | "Inactive" | "Discontinued"
  ): Promise<Item> => {
    try {
      const response = await api.patch(`/items/${id}/status`, { status });
      return response.data.data;
    } catch (error: any) {
      console.error("Error updating item status:", error);
      throw error;
    }
  },

  updateItemStock: async (id: string, quantity: number): Promise<Item> => {
    try {
      const response = await api.patch(`/items/${id}/stock`, { quantity });
      return response.data.data;
    } catch (error: any) {
      console.error("Error updating item stock:", error);
      throw error;
    }
  },
};

export default itemService;
