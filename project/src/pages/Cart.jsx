import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import useAuthStore from '../store/authStore';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuthStore();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-20 md:pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <ShoppingBag className="w-32 h-32 mx-auto text-gray-300 mb-6" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Looks like you haven't added any items yet
            </p>
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-20 md:pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Shopping Cart
          </h1>
          <p className="text-gray-600 text-lg">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row gap-6"
              >
                <Link to={`/product/${item._id || item.id}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full sm:w-32 h-32 object-cover rounded-xl hover:scale-105 transition-transform"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${item._id || item.id}`}>
                      <h3 className="text-xl font-bold text-gray-800 hover:text-green-600 transition-colors mb-2">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-white hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm"
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      <span className="text-lg font-bold w-8 text-center">
                        {item.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="bg-white hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-green-600">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearCart}
              className="w-full bg-red-50 text-red-600 border-2 border-red-200 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors"
            >
              Clear Cart
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>

              <div className="space-y-3 border-t border-b border-gray-200 py-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span className="font-semibold">₹{(getCartTotal() * 0.1).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-800">Total</span>
                <span className="text-3xl font-bold text-green-600">
                  ₹{(getCartTotal() * 1.1).toFixed(2)}
                </span>
              </div>

              {isAuthenticated ? (
                <Link to="/checkout">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              ) : (
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <span>Login to Checkout</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              )}

              <Link to="/shop">
                <button className="w-full border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors">
                  Continue Shopping
                </button>
              </Link>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                <p className="text-sm text-gray-700 text-center">
                  🎉 <span className="font-semibold">Free delivery</span> on orders over $50
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
