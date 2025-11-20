const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'manual_payment'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // For manual payment
  paymentScreenshot: {
    type: String, // URL to uploaded screenshot
    default: null
  },
  qrCode: {
    type: String, // Base64 QR code image
    default: null
  },
  paymentDetails: {
    upiId: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  // Shipping address
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  // Admin notes
  adminNotes: {
    type: String,
    default: ''
  },
  // Refund information
  refundRequested: {
    type: Boolean,
    default: false
  },
  refundDetails: {
    phone: String,
    upiId: String,
    requestedAt: Date
  },
  refundScreenshot: {
    type: String, // URL to refund screenshot uploaded by admin
    default: null
  },
  refundStatus: {
    type: String,
    enum: ['pending', 'processed'],
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ user: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

