import { create } from 'zustand';
import { productsAPI } from '../utils/api';

const useProductStore = create((set, get) => ({
  // State
  products: [],
  product: null,
  isLoading: false,
  error: null,
  filters: {
    category: 'all',
    minPrice: null,
    maxPrice: null,
    sortBy: 'featured',
    search: ''
  },

  // Actions
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  getProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsAPI.getProducts(params);
      if (response.success) {
        set({
          products: response.data,
          isLoading: false,
          error: null,
        });
        return { success: true, products: response.data };
      }
      throw new Error('Failed to fetch products');
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch products',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  getProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsAPI.getProduct(id);
      if (response.success) {
        set({
          product: response.data,
          isLoading: false,
          error: null,
        });
        return { success: true, product: response.data };
      }
      throw new Error('Failed to fetch product');
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch product',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsAPI.createProduct(productData);
      if (response.success) {
        set((state) => ({
          products: [response.data, ...state.products],
          isLoading: false,
          error: null,
        }));
        return { success: true, product: response.data };
      }
      throw new Error('Failed to create product');
    } catch (error) {
      set({
        error: error.message || 'Failed to create product',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsAPI.updateProduct(id, productData);
      if (response.success) {
        set((state) => ({
          products: state.products.map((p) =>
            p._id === id ? response.data : p
          ),
          product: state.product?._id === id ? response.data : state.product,
          isLoading: false,
          error: null,
        }));
        return { success: true, product: response.data };
      }
      throw new Error('Failed to update product');
    } catch (error) {
      set({
        error: error.message || 'Failed to update product',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsAPI.deleteProduct(id);
      if (response.success) {
        set((state) => ({
          products: state.products.filter((p) => p._id !== id),
          product: state.product?._id === id ? null : state.product,
          isLoading: false,
          error: null,
        }));
        return { success: true };
      }
      throw new Error('Failed to delete product');
    } catch (error) {
      set({
        error: error.message || 'Failed to delete product',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  getAllProductsAdmin: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsAPI.getAllProductsAdmin();
      if (response.success) {
        set({
          products: response.data,
          isLoading: false,
          error: null,
        });
        return { success: true, products: response.data };
      }
      throw new Error('Failed to fetch products');
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch products',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),
  clearProduct: () => set({ product: null }),
}));

export default useProductStore;
