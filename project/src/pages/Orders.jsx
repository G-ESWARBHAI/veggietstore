import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  MapPin, 
  CreditCard,
  ShoppingBag,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Calendar,
  Phone,
  AlertCircle,
  Image,
  ZoomIn,
  X,
  Ban,
  DollarSign,
  ArrowLeft,
  User,
  Store,
  Timer,
  Navigation
} from 'lucide-react';
import { ordersAPI } from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelOrderData, setCancelOrderData] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelRefundPhone, setCancelRefundPhone] = useState('');
  const [cancelRefundUpiId, setCancelRefundUpiId] = useState('');
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const orderIdFromUrl = searchParams.get('orderId');
    if (orderIdFromUrl && orders.length > 0) {
      const order = orders.find(o => o._id === orderIdFromUrl);
      if (order) {
        setExpandedOrders(prev => new Set([...prev, orderIdFromUrl]));
        setHighlightedOrderId(orderIdFromUrl);
        setTimeout(() => {
          const element = document.getElementById(`order-${orderIdFromUrl}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
        setTimeout(() => {
          setHighlightedOrderId(null);
          setSearchParams({});
        }, 3000);
      }
    }
  }, [searchParams, orders, setSearchParams]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.getMyOrders();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const canCancelOrder = (order) => {
    const cancellableStatuses = ['pending', 'confirmed'];
    return cancellableStatuses.includes(order.orderStatus);
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;

    if (cancelOrderData?.paymentStatus === 'confirmed') {
      if (!cancelRefundPhone && !cancelRefundUpiId) {
        toast.error('Please provide either phone number or UPI ID for refund');
        return;
      }
    }

    try {
      const response = await ordersAPI.cancelOrder(
        cancelOrderId, 
        cancelReason,
        cancelRefundPhone,
        cancelRefundUpiId
      );
      if (response.success) {
        toast.success(response.message);
        setCancelOrderId(null);
        setCancelOrderData(null);
        setCancelReason('');
        setCancelRefundPhone('');
        setCancelRefundUpiId('');
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Get status info with delivery app style
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { 
        label: 'Order Placed', 
        emoji: '📦', 
        color: 'orange',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-300',
        icon: Package,
        message: 'Your order has been placed successfully!'
      },
      confirmed: { 
        label: 'Order Confirmed', 
        emoji: '✅', 
        color: 'blue',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        icon: CheckCircle,
        message: 'Order confirmed! We are preparing your items.'
      },
      processing: { 
        label: 'Preparing Your Order', 
        emoji: '👨‍🍳', 
        color: 'purple',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-300',
        icon: Store,
        message: 'Your fresh vegetables are being packed!'
      },
      shipped: { 
        label: 'Out for Delivery', 
        emoji: '🚚', 
        color: 'indigo',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-700',
        borderColor: 'border-indigo-300',
        icon: Truck,
        message: 'Your order is on the way!'
      },
      delivered: { 
        label: 'Delivered', 
        emoji: '🎉', 
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        icon: CheckCircle,
        message: 'Order delivered successfully!'
      },
      cancelled: { 
        label: 'Cancelled', 
        emoji: '❌', 
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
        icon: XCircle,
        message: 'This order has been cancelled.'
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  // Get estimated delivery time
  const getEstimatedTime = (order) => {
    if (order.orderStatus === 'delivered') return 'Delivered';
    if (order.orderStatus === 'cancelled') return 'Cancelled';
    
    const statusTime = {
      pending: '30-40 min',
      confirmed: '25-35 min',
      processing: '20-30 min',
      shipped: '10-20 min',
      delivered: 'Delivered'
    };
    return statusTime[order.orderStatus] || '30-40 min';
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'confirmed', 'processing', 'shipped'].includes(order.orderStatus);
    if (filter === 'delivered') return order.orderStatus === 'delivered';
    if (filter === 'cancelled') return order.orderStatus === 'cancelled';
    return true;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    active: orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.orderStatus)).length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'cancelled').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-16">
      {/* Mobile Header - Food Delivery App Style */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center">
              <motion.div whileTap={{ scale: 0.9 }} className="p-2">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </motion.div>
            </Link>
            <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">My Orders</h1>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={fetchOrders}
              className="p-2.5 bg-green-50 rounded-full"
            >
              <RefreshCw className="w-5 h-5 text-green-600" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block container mx-auto px-4 max-w-7xl pt-8 pb-6">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Orders</h1>
            <p className="text-gray-600">Track all your orders</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchOrders}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </motion.button>
        </div>
          </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Quick Stats - Food Delivery Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 mt-4">
            <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-4 shadow-md border-2 border-gray-100"
          >
            <p className="text-xs text-gray-500 mb-1 font-medium">Total Orders</p>
            <p className="text-2xl font-black text-gray-800">{stats.total}</p>
            </motion.div>
            <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-orange-50 rounded-2xl p-4 shadow-md border-2 border-orange-200"
          >
            <p className="text-xs text-orange-600 mb-1 font-medium">Active</p>
            <p className="text-2xl font-black text-orange-700">{stats.active}</p>
            </motion.div>
            <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-green-50 rounded-2xl p-4 shadow-md border-2 border-green-200"
          >
            <p className="text-xs text-green-600 mb-1 font-medium">Delivered</p>
            <p className="text-2xl font-black text-green-700">{stats.delivered}</p>
            </motion.div>
            <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-red-50 rounded-2xl p-4 shadow-md border-2 border-red-200"
          >
            <p className="text-xs text-red-600 mb-1 font-medium">Cancelled</p>
            <p className="text-2xl font-black text-red-700">{stats.cancelled}</p>
            </motion.div>
          </div>

        {/* Filter Tabs - Modern Style */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:justify-center px-1">
            {[
              { key: 'all', label: 'All Orders', emoji: '📋', count: stats.total },
              { key: 'active', label: 'Active', emoji: '🔄', count: stats.active },
              { key: 'delivered', label: 'Delivered', emoji: '✅', count: stats.delivered },
              { key: 'cancelled', label: 'Cancelled', emoji: '❌', count: stats.cancelled }
                ].map((tab) => (
              <motion.button
                    key={tab.key}
                whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                      filter === tab.key
                        ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 shadow-md hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.emoji}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    filter === tab.key ? 'bg-white/30' : 'bg-gray-100'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
                ))}
              </div>
            </div>

        {/* No Orders State */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8 md:p-12 text-center mt-8"
          >
            <div className="text-7xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6 text-lg">Start shopping to see your orders here</p>
            <Link to="/shop">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
                className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl"
            >
              Start Shopping
            </motion.button>
            </Link>
          </motion.div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8 md:p-12 text-center mt-8"
          >
            <div className="text-7xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
            <p className="text-gray-600 text-lg">Try selecting a different filter</p>
          </motion.div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {filteredOrders.map((order, index) => {
              const isExpanded = expandedOrders.has(order._id);
              const isHighlighted = highlightedOrderId === order._id;
              const statusInfo = getStatusInfo(order.orderStatus);
              const StatusIcon = statusInfo.icon;
              const isCancelled = order.orderStatus === 'cancelled';
              const isActive = ['pending', 'confirmed', 'processing', 'shipped'].includes(order.orderStatus);

              return (
              <motion.div
                key={order._id}
                id={`order-${order._id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-3xl shadow-lg overflow-hidden border-2 transition-all ${
                  isHighlighted 
                      ? 'border-green-500 shadow-2xl ring-4 ring-green-200' 
                      : isActive
                      ? 'border-orange-200'
                      : 'border-gray-100'
                  }`}
                >
                  {/* Order Header - Food Delivery App Style */}
                  <div className={`p-5 md:p-6 ${statusInfo.bgColor} border-b-2 ${statusInfo.borderColor}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* Order Number */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`${statusInfo.bgColor} border-2 ${statusInfo.borderColor} rounded-full p-3`}>
                            <StatusIcon className={`w-6 h-6 ${statusInfo.textColor}`} />
                        </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Order ID</p>
                            <p className="text-lg font-black text-gray-800">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                          </div>
                          </div>

                        {/* Status Badge - Large & Prominent */}
                        <div className="mb-4">
                          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} ${statusInfo.textColor} font-black text-base`}>
                            <span className="text-2xl">{statusInfo.emoji}</span>
                            <span>{statusInfo.label}</span>
                        </div>
                      </div>

                        {/* Status Message */}
                        <p className={`text-sm font-semibold ${statusInfo.textColor} mb-3`}>
                          {statusInfo.message}
                        </p>

                        {/* Estimated Time - Food Delivery Style */}
                    {!isCancelled && (
                          <div className="flex items-center gap-2 bg-white/60 rounded-xl px-4 py-2.5 inline-flex">
                            <Timer className={`w-5 h-5 ${statusInfo.textColor}`} />
                            <span className={`font-bold ${statusInfo.textColor} text-sm`}>
                              Estimated: {getEstimatedTime(order)}
                            </span>
                      </div>
                    )}
                                  </div>

                      {/* Total Amount - Large & Clear */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Total</p>
                        <p className="text-3xl font-black text-green-600">
                          ₹{order.totalAmount.toFixed(0)}
                        </p>
                        <div className="mt-2 flex items-center justify-end gap-2">
                          {order.paymentStatus === 'confirmed' ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Paid
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              Pending
                            </span>
                                )}
                              </div>
                        </div>
                      </div>

                    {/* Order Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview - Food Delivery Style */}
                  <div className="p-5 md:p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="font-bold text-gray-800 text-lg flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-green-600" />
                        Items ({order.items.length})
                      </h4>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="flex items-center gap-2.5 text-green-600 font-bold text-sm bg-green-50 px-5 py-2.5 rounded-xl"
                      >
                        {isExpanded ? (
                          <>
                            <span>Show Less</span>
                            <ChevronUp className="w-5 h-5" />
                          </>
                        ) : (
                          <>
                            <span>View Details</span>
                            <ChevronDown className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Items Grid - Food Delivery Style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {order.items.slice(0, isExpanded ? order.items.length : 2).map((item) => (
                        <div key={item._id} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                          <img
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-base mb-1.5 truncate">{item.product?.name}</p>
                            <p className="text-sm text-gray-600 mb-2">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                            <p className="font-black text-green-600 text-lg">
                              ₹{(item.price * item.quantity).toFixed(0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.items.length > 2 && !isExpanded && (
                      <p className="text-center text-gray-500 mt-4 font-medium">
                        +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                      </p>
                    )}

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mt-6 pt-6 border-t-2 border-gray-200 space-y-4"
                        >
                            {/* All Items */}
                            <div>
                            <h5 className="font-bold text-gray-800 mb-4 text-lg">All Items</h5>
                              <div className="space-y-3">
                                {order.items.map((item) => (
                                <div key={item._id} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                    <img
                                      src={item.product?.image}
                                      alt={item.product?.name}
                                    className="w-20 h-20 object-cover rounded-xl"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 text-base mb-1.5">{item.product?.name}</p>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Quantity: {item.quantity} × ₹{item.price}
                            </p>
                                    <p className="font-black text-green-600 text-lg">
                                      ₹{(item.price * item.quantity).toFixed(0)}
                          </p>
                                  </div>
                        </div>
                      ))}
                    </div>
                  </div>

                          {/* Delivery Address - Food Delivery Style */}
                      {order.shippingAddress && (
                            <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200">
                              <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-3 text-lg">
                                <MapPin className="w-6 h-6 text-blue-600" />
                                Delivery Address
                                </h5>
                              <div className="space-y-3 text-base text-gray-700">
                                <p className="font-bold text-lg">{order.shippingAddress.name}</p>
                                <div className="flex items-center gap-3">
                                  <Phone className="w-5 h-5 text-blue-600" />
                                  <span className="font-semibold">{order.shippingAddress.phone}</span>
                                  </div>
                                  <p>{order.shippingAddress.street}</p>
                                  <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                                  </p>
                                  <p>{order.shippingAddress.country}</p>
                                </div>
                              </div>
                            )}

                            {/* Payment Info */}
                            {order.paymentMethod === 'manual_payment' && (
                            <div className="bg-yellow-50 rounded-2xl p-5 border-2 border-yellow-200">
                              <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-3 text-lg">
                                <CreditCard className="w-6 h-6 text-yellow-600" />
                                Payment Details
                                </h5>
                                
                                {order.paymentStatus === 'pending' && (
                                <div className="flex items-start gap-3 text-base text-yellow-800 mb-5 bg-yellow-100 rounded-xl p-4">
                                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                  <p className="font-semibold">
                                    We are checking your payment. We will update you soon.
                                    </p>
                                  </div>
                                )}
                                
                              {order.paymentScreenshot && (
                                <div className="mt-5">
                                  <h6 className="font-bold text-gray-800 mb-4 flex items-center gap-3">
                                    <Image className="w-6 h-6 text-yellow-600" />
                                    Payment Screenshot
                                  </h6>
                                  <div className="relative">
                                      <img
                                        src={order.paymentScreenshot}
                                      alt="Payment"
                                      className="w-full rounded-xl border-2 border-yellow-300 shadow-lg cursor-pointer"
                                        onClick={() => setSelectedScreenshot(order.paymentScreenshot)}
                                      />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 rounded-xl transition-colors cursor-pointer"
                                      onClick={() => setSelectedScreenshot(order.paymentScreenshot)}>
                                      <ZoomIn className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                        </div>
                                      </div>
                                  <p className="text-sm text-gray-600 mt-2 text-center">
                                    Tap photo to see bigger
                                  </p>
                        </div>
                      )}
                    </div>
                            )}

                            {/* Order Summary */}
                          <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-200">
                            <h5 className="font-bold text-gray-800 mb-5 text-lg">Order Summary</h5>
                            <div className="space-y-4 text-base">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Items Total</span>
                                <span className="font-bold">₹{order.totalAmount.toFixed(0)}</span>
                                </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Tax (10%)</span>
                                <span className="font-bold">₹{(order.totalAmount * 0.1).toFixed(0)}</span>
                                </div>
                              <div className="border-t-2 border-green-300 pt-4 flex justify-between items-center">
                                <span className="font-black text-lg text-gray-800">Total Amount</span>
                                <span className="font-black text-2xl text-green-600">
                                  ₹{(order.totalAmount * 1.1).toFixed(0)}
                                  </span>
                                </div>
                    </div>
                  </div>

                            {/* Cancel Order Button */}
                            {canCancelOrder(order) && (
                              <div className="mt-4">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    setCancelOrderId(order._id);
                                    setCancelOrderData(order);
                                  }}
                                className="w-full bg-red-500 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3"
                                >
                                <Ban className="w-6 h-6" />
                                Cancel This Order
                                </motion.button>
                              <p className="text-sm text-gray-500 mt-3 text-center">
                                You can cancel new orders only
                                </p>
                              </div>
                            )}

                          {/* Refund Info */}
                            {order.orderStatus === 'cancelled' && order.paymentStatus === 'confirmed' && (
                            <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-200">
                              <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-3 text-lg">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                                  Refund Information
                                </h5>
                                
                                {order.refundRequested ? (
                                  <div>
                                    {order.refundStatus === 'pending' ? (
                                    <div className="flex items-start gap-3 text-base text-purple-800 mb-4 bg-purple-100 rounded-xl p-4">
                                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                      <p className="font-semibold">
                                        Your refund request is being processed. We will send you money soon.
                                        </p>
                                      </div>
                                    ) : (
                                    <div className="mb-4 bg-green-100 rounded-xl p-4">
                                      <div className="flex items-center gap-2 text-green-700 mb-2 font-bold">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Refund Sent</span>
                                        </div>
                                        {order.refundDetails?.phone && (
                                        <p className="text-base text-gray-700">
                                          <span className="font-bold">Phone:</span> {order.refundDetails.phone}
                                          </p>
                                        )}
                                        {order.refundDetails?.upiId && (
                                        <p className="text-base text-gray-700">
                                          <span className="font-bold">UPI ID:</span> {order.refundDetails.upiId}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                    
                                    {order.refundScreenshot && (
                                    <div className="mt-4">
                                      <h6 className="font-bold text-gray-800 mb-3 flex items-center gap-3">
                                        <Image className="w-6 h-6 text-purple-600" />
                                        Refund Screenshot
                                      </h6>
                                          <img
                                            src={order.refundScreenshot}
                                        alt="Refund"
                                        className="w-full rounded-xl border-2 border-purple-300 shadow-lg cursor-pointer"
                                            onClick={() => setSelectedScreenshot(order.refundScreenshot)}
                                          />
                                      <p className="text-sm text-gray-600 mt-2 text-center">
                                        Tap photo to see bigger
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                <p className="text-base text-gray-600">
                                  Refund details will be collected when you cancel the order.
                                </p>
                                )}
                              </div>
                            )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {cancelOrderId && cancelOrderData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => {
              setCancelOrderId(null);
              setCancelOrderData(null);
              setCancelReason('');
              setCancelRefundPhone('');
              setCancelRefundUpiId('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">⚠️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Cancel Order?</h3>
                <p className="text-gray-600 text-base">
                  Are you sure? This cannot be undone.
                </p>
              </div>

              {cancelOrderData.paymentStatus === 'confirmed' && (
                <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                    <p className="font-bold text-gray-800 text-lg">Refund Details Required</p>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    We need your details to send money back:
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={cancelRefundPhone}
                        onChange={(e) => setCancelRefundPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-base"
                      />
                    </div>
                    <div className="text-center text-gray-500 font-bold">OR</div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        UPI ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cancelRefundUpiId}
                        onChange={(e) => setCancelRefundUpiId(e.target.value)}
                        placeholder="yourname@paytm"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-base"
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      We will send money and share photo with you.
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Why cancel? (Optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us why..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none resize-none text-base"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCancelOrderId(null);
                    setCancelOrderData(null);
                    setCancelReason('');
                    setCancelRefundPhone('');
                    setCancelRefundUpiId('');
                  }}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-base hover:bg-gray-50"
                >
                  Keep Order
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelOrder}
                  className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl font-bold text-base shadow-lg"
                >
                  Cancel Order
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screenshot Modal */}
      <AnimatePresence>
        {selectedScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedScreenshot(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={selectedScreenshot}
                alt="Full Size"
                className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
              />
              <p className="text-white text-center mt-4">
                Tap outside to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
