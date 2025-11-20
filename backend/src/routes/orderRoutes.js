const express = require('express');
const router = express.Router();
const {
  createOrder,
  uploadPaymentScreenshot,
  getMyOrders,
  getOrder,
  getAllOrders,
  confirmPayment,
  updateOrderStatus,
  cancelOrder,
  requestRefund,
  updateRefundDetails,
  uploadRefundScreenshot
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:orderId', getOrder);
router.post('/:orderId/payment-screenshot', upload.single('screenshot'), uploadPaymentScreenshot);
router.put('/:orderId/cancel', cancelOrder);
router.post('/:orderId/request-refund', requestRefund);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllOrders);
router.put('/:orderId/confirm-payment', authorize('admin'), confirmPayment);
router.put('/:orderId/status', authorize('admin'), updateOrderStatus);
router.put('/:orderId/refund-details', authorize('admin'), updateRefundDetails);
router.post('/:orderId/refund-screenshot', authorize('admin'), upload.single('screenshot'), uploadRefundScreenshot);

module.exports = router;

