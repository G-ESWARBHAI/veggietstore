import { create } from 'zustand';
import { authAPI } from '../utils/api';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      if (response.success && response.data.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true, user: response.data.user };
      }
      throw new Error('Login failed');
    } catch (error) {
      set({
        error: error.message || 'Login failed. Please try again.',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({ name, email, password });
      if (response.success && response.data.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true, user: response.data.user };
      }
      throw new Error('Registration failed');
    } catch (error) {
      set({
        error: error.message || 'Registration failed. Please try again.',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await authAPI.getMe();
      if (response.success && response.data.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }
      return false;
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return false;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.forgotPassword(email);
      set({ isLoading: false });
      return { success: response.success, message: response.message };
    } catch (error) {
      set({
        error: error.message || 'Failed to send reset email.',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.resetPassword(token, password);
      if (response.success && response.data.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true, user: response.data.user };
      }
      throw new Error('Password reset failed');
    } catch (error) {
      set({
        error: error.message || 'Password reset failed. Please try again.',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;

