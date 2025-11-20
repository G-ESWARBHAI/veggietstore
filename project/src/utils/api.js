// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important for cookies
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Logout user
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Get current user
  getMe: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return apiRequest(`/auth/reset-password/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    return apiRequest('/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Products API functions
export const productsAPI = {
  // Get all products
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single product
  getProduct: async (id) => {
    return apiRequest(`/products/${id}`, {
      method: 'GET',
    });
  },

  // Create product (Admin only) - supports FormData for file uploads
  createProduct: async (productData) => {
    const isFormData = productData instanceof FormData;
    const url = `${API_BASE_URL}/products`;
    
    const config = {
      method: 'POST',
      credentials: 'include',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? productData : JSON.stringify(productData),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Update product (Admin only) - supports FormData for file uploads
  updateProduct: async (id, productData) => {
    const isFormData = productData instanceof FormData;
    const url = `${API_BASE_URL}/products/${id}`;
    
    const config = {
      method: 'PUT',
      credentials: 'include',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? productData : JSON.stringify(productData),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Delete product (Admin only)
  deleteProduct: async (id) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Get all products including inactive (Admin only)
  getAllProductsAdmin: async () => {
    return apiRequest('/products/admin/all', {
      method: 'GET',
    });
  },
};

// Cart API functions
export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    return apiRequest('/cart', {
      method: 'GET',
    });
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    return apiRequest('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    return apiRequest(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    return apiRequest(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Clear cart
  clearCart: async () => {
    return apiRequest('/cart', {
      method: 'DELETE',
    });
  },
};

// Profile API functions
export const profileAPI = {
  // Get user profile
  getProfile: async () => {
    return apiRequest('/profile', {
      method: 'GET',
    });
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/profile/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Orders API functions
export const ordersAPI = {
  // Create new order
  createOrder: async (orderData) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Upload payment screenshot
  uploadPaymentScreenshot: async (orderId, screenshotFile) => {
    const url = `${API_BASE_URL}/orders/${orderId}/payment-screenshot`;
    const formData = new FormData();
    formData.append('screenshot', screenshotFile);

    const config = {
      method: 'POST',
      credentials: 'include',
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's orders
  getMyOrders: async () => {
    return apiRequest('/orders', {
      method: 'GET',
    });
  },

  // Get single order
  getOrder: async (orderId) => {
    return apiRequest(`/orders/${orderId}`, {
      method: 'GET',
    });
  },

  // Get all orders (Admin only)
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders/admin/all${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Confirm payment (Admin only)
  confirmPayment: async (orderId, adminNotes) => {
    return apiRequest(`/orders/${orderId}/confirm-payment`, {
      method: 'PUT',
      body: JSON.stringify({ adminNotes }),
    });
  },

  // Update order status (Admin only)
  updateOrderStatus: async (orderId, orderStatus, adminNotes) => {
    return apiRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ orderStatus, adminNotes }),
    });
  },

  // Cancel order (Customer only)
  cancelOrder: async (orderId, reason, phone, upiId) => {
    return apiRequest(`/orders/${orderId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason, phone, upiId }),
    });
  },

  // Request refund (Customer only)
  requestRefund: async (orderId, phone, upiId) => {
    return apiRequest(`/orders/${orderId}/request-refund`, {
      method: 'POST',
      body: JSON.stringify({ phone, upiId }),
    });
  },

  // Update refund details (Admin only)
  updateRefundDetails: async (orderId, phone, upiId) => {
    return apiRequest(`/orders/${orderId}/refund-details`, {
      method: 'PUT',
      body: JSON.stringify({ phone, upiId }),
    });
  },

  // Upload refund screenshot (Admin only)
  uploadRefundScreenshot: async (orderId, screenshotFile) => {
    const url = `${API_BASE_URL}/orders/${orderId}/refund-screenshot`;
    const formData = new FormData();
    formData.append('screenshot', screenshotFile);

    const config = {
      method: 'POST',
      credentials: 'include',
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};

// Payment API functions
export const paymentAPI = {
  // Get payment configuration (UPI ID, etc.)
  getPaymentConfig: async () => {
    return apiRequest('/payment/config', {
      method: 'GET',
    });
  },
};

// Notification API
export const notificationsAPI = {
  // Get notifications
  getNotifications: async (unreadOnly = false) => {
    return apiRequest(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`, {
      method: 'GET',
    });
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

export default apiRequest;

