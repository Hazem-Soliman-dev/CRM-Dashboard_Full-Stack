import api from './api';

const productService = {
  // Fetch all products/services
  getAllProducts: async (params = {}) => {
    const response = await api.get('/items', { params });
    // Backend returns { success: true, data: { items: [...], pagination: {...} } }
    const data = response.data?.data || {};
    return {
      products: data.items || [],
      pagination: data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
      }
    };
  },

  // Fetch a single product by ID
  getProductById: async (id: string) => {
    const response = await api.get(`/items/${id}`);
    return response.data.data;
  },

  // Create a new product
  createProduct: async (productData: any) => {
    const response = await api.post('/items', productData);
    return response.data.data;
  },

  // Update an existing product
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/items/${id}`, productData);
    return response.data.data;
  },

  // Delete a product
  deleteProduct: async (id: string) => {
    await api.delete(`/items/${id}`);
  },
};

export default productService;
