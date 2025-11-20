import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, CheckCircle, XCircle, Eye, Download, Filter, User, MapPin, Phone, Mail, Calendar, CreditCard, Truck, RefreshCw, DollarSign, Upload, Image, ZoomIn } from 'lucide-react';
import { ordersAPI } from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import AdminBottomNavigation from '../components/AdminBottomNavigation';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterRefundStatus, setFilterRefundStatus] = useState('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [refundPhone, setRefundPhone] = useState('');
  const [refundUpiId, setRefundUpiId] = useState('');
  const [refundScreenshotFile, setRefundScreenshotFile] = useState(null);
  const [refundScreenshotPreview, setRefundScreenshotPreview] = useState(null);
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }
    fetchOrders();
  }, [isAuthenticated, user, filterStatus, filterPaymentStatus, filterRefundStatus]);

  // Handle order ID from URL (from notification click)
  useEffect(() => {
    const orderIdFromUrl = searchParams.get('orderId');
    if (orderIdFromUrl && orders.length > 0) {
      const order = orders.find(o => o._id === orderIdFromUrl);
      if (order) {
        // Open the order details modal
        handleViewOrderDetails(order);
        // Scroll to the order after a short delay
        setTimeout(() => {
          const element = document.getElementById(`order-row-${orderIdFromUrl}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
        // Remove orderId from URL after modal opens
        setTimeout(() => {
          setSearchParams({});
        }, 2000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, orders]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPaymentStatus !== 'all') params.paymentStatus = filterPaymentStatus;
      if (filterRefundStatus !== 'all') params.refundStatus = filterRefundStatus;
      
      const response = await ordersAPI.getAllOrders(params);
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async (orderId) => {
    if (!window.confirm('Have you verified the payment in your account? Confirm payment?')) {
      return;
    }

    try {
      const response = await ordersAPI.confirmPayment(orderId, adminNotes);
      if (response.success) {
        toast.success('Payment confirmed successfully!');
        setSelectedOrder(null);
        setAdminNotes('');
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to confirm payment');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await ordersAPI.updateOrderStatus(orderId, newStatus, adminNotes);
      if (response.success) {
        toast.success('Order status updated successfully!');
        setSelectedOrder(null);
        setShowOrderDetails(false);
        setAdminNotes('');
        setNewOrderStatus('');
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleViewOrderDetails = async (order) => {
    // Fetch the latest order data to ensure we have the most up-to-date information
    try {
      const response = await ordersAPI.getOrder(order._id);
      if (response.success) {
        setSelectedOrder(response.data);
        setNewOrderStatus(response.data.orderStatus);
        setAdminNotes(response.data.adminNotes || '');
        setRefundPhone(response.data.refundDetails?.phone || '');
        setRefundUpiId(response.data.refundDetails?.upiId || '');
      } else {
        // Fallback to the order from the list if fetch fails
        setSelectedOrder(order);
        setNewOrderStatus(order.orderStatus);
        setAdminNotes(order.adminNotes || '');
        setRefundPhone(order.refundDetails?.phone || '');
        setRefundUpiId(order.refundDetails?.upiId || '');
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      // Fallback to the order from the list if fetch fails
      setSelectedOrder(order);
      setNewOrderStatus(order.orderStatus);
      setAdminNotes(order.adminNotes || '');
      setRefundPhone(order.refundDetails?.phone || '');
      setRefundUpiId(order.refundDetails?.upiId || '');
    }
    setShowOrderDetails(true);
  };

  const handleRefundScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setRefundScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefundScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateRefundDetails = async () => {
    if (!selectedOrder) return;
    if (!refundPhone && !refundUpiId) {
      toast.error('Please provide either phone number or UPI ID');
      return;
    }

    try {
      const response = await ordersAPI.updateRefundDetails(selectedOrder._id, refundPhone, refundUpiId);
      if (response.success) {
        toast.success('Refund details updated successfully');
        fetchOrders();
        const updatedOrder = await ordersAPI.getOrder(selectedOrder._id);
        if (updatedOrder.success) {
          setSelectedOrder(updatedOrder.data);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update refund details');
    }
  };

  const handleUploadRefundScreenshot = async () => {
    if (!selectedOrder || !refundScreenshotFile) {
      toast.error('Please select a refund screenshot');
      return;
    }

    try {
      const response = await ordersAPI.uploadRefundScreenshot(selectedOrder._id, refundScreenshotFile);
      if (response.success) {
        toast.success('Refund screenshot uploaded successfully');
        setRefundScreenshotFile(null);
        setRefundScreenshotPreview(null);
        fetchOrders();
        const updatedOrder = await ordersAPI.getOrder(selectedOrder._id);
        if (updatedOrder.success) {
          setSelectedOrder(updatedOrder.data);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload refund screenshot');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-16">
      <div className="container mx-auto px-4 max-w-7xl md:pt-20 pt-20">
        {/* Mobile Header */}
        <div className="md:hidden mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Orders</h1>
          <p className="text-sm text-gray-600">Manage and track all orders</p>
        </div>

        {/* Desktop Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:block mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Order Management</h1>
          <p className="text-gray-600 text-sm">Manage orders and confirm payments</p>
        </motion.div>

        {/* Mobile Filters - Compact */}
        <div className="md:hidden mb-4 space-y-3">
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-700">Filters</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none bg-white"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none bg-white"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchOrders}
            disabled={isLoading}
            className="w-full bg-green-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </div>

        {/* Desktop Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:block bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100"
        >
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-700 text-sm">Filters:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Order Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={filterRefundStatus}
                onChange={(e) => setFilterRefundStatus(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Refund Status</option>
                <option value="pending">Refund Pending</option>
                <option value="processed">Refund Processed</option>
                <option value="no-refund">No Refund</option>
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchOrders}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-8 md:p-12 text-center border border-gray-100"
          >
            <Package className="w-16 h-16 md:w-24 md:h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
            <p className="text-sm md:text-base text-gray-600">No orders match the current filters</p>
          </motion.div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {orders.map((order, index) => {
              const orderIdFromUrl = searchParams.get('orderId');
              const isHighlighted = orderIdFromUrl === order._id;
              return (
              <motion.div
                key={order._id}
                id={`order-row-${order._id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.01 }}
                className={`bg-white rounded-xl shadow-md overflow-hidden border transition-all cursor-pointer ${
                  isHighlighted 
                    ? 'border-green-500 shadow-lg ring-2 ring-green-200' 
                    : 'border-gray-100 hover:border-green-200'
                }`}
                onClick={() => handleViewOrderDetails(order)}
              >
                <div className="p-4 md:p-6">
                  {/* Mobile Header */}
                  <div className="md:hidden mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-800 mb-1">
                          #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.paymentStatus === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Header */}
                  <div className="hidden md:flex md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {order.user?.name || 'N/A'} • {order.user?.email || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        order.paymentStatus === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items - Mobile */}
                  <div className="md:hidden mb-3">
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item._id} className="flex items-center gap-2">
                          <img
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{item.product?.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-gray-500 text-center pt-1">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items - Desktop */}
                  <div className="hidden md:block border-t border-gray-200 pt-4 mb-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item._id} className="flex items-center space-x-4">
                          <img
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{item.product?.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                          <p className="font-bold text-green-600">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Footer */}
                  <div className="md:hidden flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    {order.paymentStatus === 'pending' && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmPayment(order._id);
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </motion.button>
                    )}
                  </div>

                  {/* Desktop Footer */}
                  <div className="hidden md:flex md:items-center md:justify-between border-t border-gray-200 pt-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Payment: <span className="font-semibold capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                      </p>
                      {order.paymentMethod === 'manual_payment' && order.paymentScreenshot && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            setShowScreenshot(true);
                          }}
                          className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold text-sm mt-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Screenshot</span>
                        </motion.button>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Action Buttons */}
                  <div className="hidden md:flex md:flex-wrap md:gap-3 mt-4 pt-4 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOrderDetails(order);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </motion.button>
                    {order.paymentStatus === 'pending' && order.paymentMethod === 'manual_payment' && order.paymentScreenshot && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                          setShowScreenshot(true);
                        }}
                        className="bg-purple-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-purple-600 transition-colors flex items-center space-x-2 shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Screenshot</span>
                      </motion.button>
                    )}
                    {order.paymentStatus === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmPayment(order._id);
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors flex items-center space-x-2 shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Payment</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4 overflow-y-auto pb-20 md:pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-none md:rounded-2xl shadow-2xl max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
                <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                  Order #{selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
                <button
                  onClick={() => {
                    setShowOrderDetails(false);
                    setSelectedOrder(null);
                    setAdminNotes('');
                    setNewOrderStatus('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 active:scale-95"
                >
                  <XCircle className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Customer Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border-2 border-blue-200">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    <span>Customer Information</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold text-gray-800">{selectedOrder.user?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-800">{selectedOrder.user?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-800">{selectedOrder.user?.phone || selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 md:p-6 border-2 border-green-200">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                      <span>Shipping Address</span>
                    </h3>
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-800 text-lg">{selectedOrder.shippingAddress.name}</p>
                      <p className="text-gray-700">{selectedOrder.shippingAddress.street}</p>
                      <p className="text-gray-700">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                        {selectedOrder.shippingAddress.zipCode && ` - ${selectedOrder.shippingAddress.zipCode}`}
                      </p>
                      {selectedOrder.shippingAddress.country && (
                        <p className="text-gray-700">{selectedOrder.shippingAddress.country}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700 font-semibold">{selectedOrder.shippingAddress.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-gray-200">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center space-x-2">
                    <Package className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                    <span>Order Items</span>
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item._id} className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm md:text-lg truncate">{item.product?.name}</p>
                          <p className="text-xs md:text-sm text-gray-600">
                            {item.quantity} × ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-bold text-green-600 text-base md:text-lg">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 md:mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-base md:text-xl font-bold text-gray-800">Total:</span>
                      <span className="text-2xl md:text-3xl font-bold text-green-600">
                        ₹{selectedOrder.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 md:p-6 border-2 border-purple-200">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                    <span>Payment Details</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold text-gray-800 capitalize text-lg">
                        {selectedOrder.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedOrder.paymentStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus}
                      </span>
                    </div>
                  </div>
                  
                  {/* Payment Screenshot - Important for verification */}
                  {selectedOrder.paymentMethod === 'manual_payment' && selectedOrder.paymentScreenshot && (
                    <div className="mt-4 md:mt-6 p-3 md:p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
                        <div>
                          <p className="font-semibold text-yellow-800 text-sm md:text-lg">Payment Screenshot</p>
                          <p className="text-xs md:text-sm text-yellow-700">Customer uploaded payment proof</p>
                        </div>
                        {selectedOrder.paymentStatus === 'pending' && (
                          <span className="px-2.5 md:px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-[10px] md:text-xs font-semibold self-start md:self-auto">
                            Needs Verification
                          </span>
                        )}
                      </div>
                      <div className="flex justify-center">
                        <img
                          src={selectedOrder.paymentScreenshot}
                          alt="Payment Screenshot"
                          className="max-w-full h-auto max-h-48 md:max-h-64 rounded-lg border-2 border-yellow-400 cursor-pointer active:opacity-90 transition-opacity shadow-lg"
                          onClick={() => {
                            setSelectedScreenshotUrl(selectedOrder.paymentScreenshot);
                            setShowScreenshot(true);
                          }}
                        />
                      </div>
                      <p className="text-[10px] md:text-xs text-yellow-700 mt-2 text-center">
                        Tap image to view full size • Verify payment before confirming
                      </p>
                    </div>
                  )}
                  
                  {selectedOrder.paymentMethod === 'manual_payment' && !selectedOrder.paymentScreenshot && (
                    <div className="mt-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                      <p className="font-semibold text-red-800">⚠️ Payment Screenshot Not Uploaded</p>
                      <p className="text-sm text-red-700 mt-1">
                        Customer has not uploaded payment screenshot yet. Order is waiting for payment proof.
                      </p>
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:p-6 border-2 border-gray-200">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center space-x-2">
                    <Truck className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                    <span>Admin Actions</span>
                  </h3>
                  
                  {selectedOrder.paymentStatus === 'pending' && selectedOrder.paymentMethod === 'manual_payment' && (
                    <div className="mb-4 md:mb-6 p-3 md:p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                      <p className="font-semibold text-yellow-800 mb-2 md:mb-3 text-sm md:text-base">Confirm Payment</p>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows="3"
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none mb-3"
                        placeholder="Add notes (optional)..."
                      />
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleConfirmPayment(selectedOrder._id)}
                        className="w-full bg-green-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 shadow-md"
                      >
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                        <span>Confirm Payment</span>
                      </motion.button>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Update Order Status</label>
                    <select
                      value={newOrderStatus}
                      onChange={(e) => setNewOrderStatus(e.target.value)}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none mb-3"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows="3"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none mb-3"
                      placeholder="Add notes (optional)..."
                    />
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpdateStatus(selectedOrder._id, newOrderStatus)}
                      className="w-full bg-blue-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 shadow-md"
                    >
                      <Truck className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Update Status</span>
                    </motion.button>
                  </div>

                  {/* Refund Management */}
                  {selectedOrder.orderStatus === 'cancelled' && selectedOrder.paymentStatus === 'confirmed' && (
                    <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-300 rounded-xl">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        Refund Management
                      </h4>

                      {/* Refund Details */}
                      {selectedOrder.refundRequested ? (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Refund Status</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              selectedOrder.refundStatus === 'processed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedOrder.refundStatus === 'processed' ? 'Processed' : 'Pending'}
                            </span>
                          </div>

                          {selectedOrder.refundDetails && (
                            <div className="bg-white rounded-lg p-3 border border-purple-200">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Customer Refund Details</p>
                              {selectedOrder.refundDetails.phone && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">Phone:</span> {selectedOrder.refundDetails.phone}
                                </p>
                              )}
                              {selectedOrder.refundDetails.upiId && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">UPI ID:</span> {selectedOrder.refundDetails.upiId}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Update Refund Details */}
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Update Refund Details</p>
                            <div className="space-y-3">
                              <input
                                type="tel"
                                value={refundPhone}
                                onChange={(e) => setRefundPhone(e.target.value)}
                                placeholder="Customer phone number"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                              />
                              <div className="text-center text-gray-500 text-sm">OR</div>
                              <input
                                type="text"
                                value={refundUpiId}
                                onChange={(e) => setRefundUpiId(e.target.value)}
                                placeholder="Customer UPI ID"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                              />
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleUpdateRefundDetails}
                                className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                              >
                                Update Refund Details
                              </motion.button>
                            </div>
                          </div>

                          {/* Upload Refund Screenshot */}
                          {!selectedOrder.refundScreenshot ? (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Upload Refund Screenshot</p>
                              <div className="space-y-3">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleRefundScreenshotChange}
                                  className="hidden"
                                  id="refund-screenshot-upload"
                                />
                                <label
                                  htmlFor="refund-screenshot-upload"
                                  className="cursor-pointer bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Upload className="w-5 h-5" />
                                  <span>Choose Refund Screenshot</span>
                                </label>
                                {refundScreenshotPreview && (
                                  <div className="mt-2">
                                    <img
                                      src={refundScreenshotPreview}
                                      alt="Refund screenshot preview"
                                      className="w-full max-w-xs mx-auto rounded-lg border-2 border-purple-300"
                                    />
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={handleUploadRefundScreenshot}
                                      className="w-full mt-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                                    >
                                      Upload Screenshot
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Refund Screenshot</p>
                              <div className="relative group">
                                <img
                                  src={selectedOrder.refundScreenshot}
                                  alt="Refund Screenshot"
                                  className="w-full max-w-md mx-auto rounded-lg border-2 border-purple-300 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => {
                                    setSelectedScreenshotUrl(selectedOrder.refundScreenshot);
                                    setShowScreenshot(true);
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg cursor-pointer">
                                  <div className="bg-white/90 rounded-full p-2">
                                    <ZoomIn className="w-6 h-6 text-gray-800" />
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mt-2 text-center">
                                Click image to view full size
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          <p>Customer has not requested refund yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Screenshot Modal */}
        {showScreenshot && selectedScreenshotUrl && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4 overflow-y-auto pb-20 md:pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-none md:rounded-2xl shadow-2xl max-w-2xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-base md:text-2xl font-bold text-gray-800 flex-1 pr-2">
                    {selectedOrder.refundScreenshot === selectedScreenshotUrl 
                      ? 'Refund Screenshot' 
                      : 'Payment Screenshot'} - #{selectedOrder._id.slice(-8).toUpperCase()}
                  </h3>
                  <button
                    onClick={() => {
                      setShowScreenshot(false);
                      setSelectedScreenshotUrl(null);
                      if (!showOrderDetails) {
                        setSelectedOrder(null);
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 active:scale-95"
                  >
                    <XCircle className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>

                <div className="mb-4 md:mb-6">
                  <img
                    src={selectedScreenshotUrl}
                    alt="Screenshot"
                    className="w-full rounded-lg border-2 border-gray-200"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Admin Notes (Optional)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows="3"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    placeholder="Add any notes about this payment..."
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowScreenshot(false);
                      if (!showOrderDetails) {
                        setSelectedOrder(null);
                        setAdminNotes('');
                      }
                    }}
                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </motion.button>
                  {selectedOrder.paymentStatus === 'pending' && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleConfirmPayment(selectedOrder._id)}
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
                    >
                      Confirm Payment
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Admin Bottom Navigation - Mobile Only */}
      <AdminBottomNavigation onAddProductClick={() => navigate('/admin/dashboard')} />
    </div>
  );
};

export default AdminOrders;

