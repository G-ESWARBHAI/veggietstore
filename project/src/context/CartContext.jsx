import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  // Fetch cart from backend when user is authenticated
  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await cartAPI.getCart();
      if (response.success && response.data) {
        // Transform cart items to match frontend format
        const items = response.data.items.map(item => ({
          id: item._id,
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          description: item.product.description,
          category: item.product.category,
          rating: item.product.rating,
          stock: item.product.stock,
          quantity: item.quantity
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // If error, keep empty cart
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addToCart = async (product) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please login first to use cart', {
        icon: '🔒',
        duration: 3000,
      });
      return;
    }

    try {
      const productId = product._id || product.id;
      const quantity = product.quantity || 1;
      const response = await cartAPI.addToCart(productId, quantity);
      
      if (response.success) {
        // Update local state
        await fetchCart();
        toast.success(quantity > 1 ? `${quantity} items added to cart!` : 'Item added to cart!', {
          icon: '✅',
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add item to cart', {
        icon: '❌',
        duration: 3000,
      });
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      toast.error('Please login first to use cart', {
        icon: '🔒',
        duration: 3000,
      });
      return;
    }

    try {
      const response = await cartAPI.removeFromCart(itemId);
      
      if (response.success) {
        await fetchCart();
        toast.success('Item removed from cart', {
          icon: '🗑️',
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to remove item from cart', {
        icon: '❌',
        duration: 3000,
      });
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) {
      toast.error('Please login first to use cart', {
        icon: '🔒',
        duration: 3000,
      });
      return;
    }

    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    try {
      const response = await cartAPI.updateCartItem(itemId, quantity);
      
      if (response.success) {
        await fetchCart();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update quantity', {
        icon: '❌',
        duration: 3000,
      });
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    try {
      const response = await cartAPI.clearCart();
      
      if (response.success) {
        await fetchCart();
        toast.success('Cart cleared', {
          icon: '🗑️',
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to clear cart', {
        icon: '❌',
        duration: 3000,
      });
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isLoading,
        fetchCart, // Expose fetchCart for manual refresh
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
