const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const QRCode = require('qrcode');
const { uploadImage, extractPublicId, deleteImage } = require('../config/cloudinary');
const { createNotification } = require('./notificationController');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { paymentMethod, shippingAddress, paymentDetails } = req.body;

    // Validate payment method
    if (!paymentMethod || !['cod', 'manual_payment'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be "cod" or "manual_payment"'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name price image description category rating stock isActive'
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate cart items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      // Check if product exists and is active
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${product?.name || 'Unknown'}" is no longer available`
        });
      }

      // Check stock availability
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        price: product.price
      });
    }

    // Validate shipping address for COD
    if (paymentMethod === 'cod' && !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required for COD orders'
      });
    }

    // Generate QR code for manual payment
    let qrCodeBase64 = null;
    if (paymentMethod === 'manual_payment') {
      // Get UPI ID from payment details or environment variable
      const upiId = paymentDetails?.upiId || process.env.UPI_ID;
      
      if (!upiId) {
        console.warn('⚠️  UPI_ID not set in environment variables. QR code will not be generated.');
        console.warn('   Please set UPI_ID in your .env file (e.g., UPI_ID=your-upi@paytm)');
      } else {
        // Calculate final total with tax (10%)
        const tax = totalAmount * 0.1;
        const finalTotal = totalAmount + tax;
        
        // Create UPI payment string (UPI format: upi://pay?pa=UPI_ID&am=AMOUNT&cu=INR&tn=MESSAGE)
        // Round to 2 decimal places for UPI
        const transactionNote = `VeggieStore-${Date.now()}`;
        const upiPaymentString = `upi://pay?pa=${encodeURIComponent(upiId)}&am=${finalTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
        
        console.log('🔍 Generating QR code with UPI string:', upiPaymentString);
        
        try {
          qrCodeBase64 = await QRCode.toDataURL(upiPaymentString, {
            errorCorrectionLevel: 'M', // Changed to 'M' for better compatibility
            type: 'image/png',
            quality: 0.92,
            margin: 2, // Increased margin for better scanning
            width: 400, // Increased size for better scanning
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          if (qrCodeBase64) {
            console.log('✅ QR code generated successfully for amount:', finalTotal);
            console.log('   QR code length:', qrCodeBase64.length, 'characters');
          } else {
            console.error('❌ QR code generation returned null/undefined');
          }
        } catch (qrError) {
          console.error('❌ QR code generation error:', qrError);
          console.error('   Error details:', qrError.message);
          // Don't fail the order creation, just log the error
          // QR code will be null and frontend can handle it
        }
      }
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'pending',
      qrCode: qrCodeBase64,
      paymentDetails: paymentDetails || {},
      shippingAddress: shippingAddress || {}
    });

    // Update product stock (reserve items)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart after order creation
    cart.items = [];
    await cart.save();

    // Create notification for admin about new order
    try {
      // Populate user to get name
      await order.populate({
        path: 'user',
        select: 'name email'
      });
      
      const adminUsers = await User.find({ role: 'admin' });
      const customerName = order.user?.name || 'Customer';
      for (const admin of adminUsers) {
        await createNotification(
          admin._id,
          'new_order',
          'New Order Received',
          `${customerName} ordered #${order._id.toString().slice(-6)} for ₹${totalAmount.toFixed(2)}`,
          order._id
        );
      }
    } catch (notifError) {
      console.error('Failed to create notification for new order:', notifError);
      // Don't fail order creation if notification fails
    }

    // Populate order with product details
    await order.populate({
      path: 'items.product',
      select: 'name price image description category'
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload payment screenshot
// @route   POST /api/orders/:orderId/payment-screenshot
// @access  Private
const uploadPaymentScreenshot = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('📸 Payment screenshot upload request received');
    console.log('   Order ID:', orderId);
    console.log('   File received:', !!req.file);
    console.log('   File size:', req.file?.size, 'bytes');
    console.log('   File mimetype:', req.file?.mimetype);

    if (!req.file) {
      console.error('❌ No file received in request');
      return res.status(400).json({
        success: false,
        message: 'Please upload a payment screenshot'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      console.error('❌ Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Order found:', {
      orderId: order._id,
      paymentMethod: order.paymentMethod,
      currentScreenshot: !!order.paymentScreenshot
    });

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      console.error('❌ Unauthorized: Order does not belong to user');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Check if payment method is manual_payment
    if (order.paymentMethod !== 'manual_payment') {
      console.error('❌ Invalid payment method:', order.paymentMethod);
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is only required for manual payment orders'
      });
    }

    // Delete old screenshot if exists
    if (order.paymentScreenshot) {
      console.log('🗑️  Deleting old screenshot:', order.paymentScreenshot);
      const oldPublicId = extractPublicId(order.paymentScreenshot);
      if (oldPublicId) {
        try {
          await deleteImage(oldPublicId);
          console.log('✅ Old screenshot deleted successfully');
        } catch (deleteError) {
          console.error('⚠️  Error deleting old screenshot (non-critical):', deleteError.message);
        }
      }
    }

    // Upload new screenshot
    try {
      console.log('☁️  Uploading to Cloudinary...');
      console.log('   Cloudinary config check:', {
        cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: !!process.env.CLOUDINARY_API_KEY,
        apiSecret: !!process.env.CLOUDINARY_API_SECRET
      });

      const uploadResult = await uploadImage(req.file.buffer, 'veggie-store/payment-screenshots');
      
      if (!uploadResult || !uploadResult.secure_url) {
        console.error('❌ Cloudinary upload failed: No secure_url in response');
        console.error('   Upload result:', uploadResult);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload payment screenshot: Invalid response from Cloudinary'
        });
      }

      console.log('✅ Cloudinary upload successful');
      console.log('   Secure URL:', uploadResult.secure_url);
      console.log('   Public ID:', uploadResult.public_id);

      // Update order with screenshot URL
      order.paymentScreenshot = uploadResult.secure_url;
      
      console.log('💾 Saving order to database...');
      const savedOrder = await order.save();
      
      // Verify the order was saved correctly
      const verifiedOrder = await Order.findById(orderId);
      if (!verifiedOrder) {
        console.error('❌ CRITICAL: Order not found after save!');
        return res.status(500).json({
          success: false,
          message: 'Failed to save order: Order not found after update'
        });
      }
      
      if (!verifiedOrder.paymentScreenshot || verifiedOrder.paymentScreenshot !== uploadResult.secure_url) {
        console.error('❌ CRITICAL: Payment screenshot not saved correctly!');
        console.error('   Expected URL:', uploadResult.secure_url);
        console.error('   Actual URL:', verifiedOrder.paymentScreenshot);
        return res.status(500).json({
          success: false,
          message: 'Failed to save payment screenshot to order'
        });
      }

      console.log('✅ Order updated with payment screenshot URL');
      console.log('   Saved URL:', verifiedOrder.paymentScreenshot);
      console.log('   Order ID:', verifiedOrder._id);
      console.log('   Payment Method:', verifiedOrder.paymentMethod);

      res.status(200).json({
        success: true,
        message: 'Payment screenshot uploaded successfully',
        data: {
          paymentScreenshot: verifiedOrder.paymentScreenshot,
          orderId: verifiedOrder._id
        }
      });
    } catch (uploadError) {
      console.error('❌ Cloudinary upload error:', uploadError);
      console.error('   Error name:', uploadError.name);
      console.error('   Error message:', uploadError.message);
      console.error('   Error stack:', uploadError.stack);
      
      // Check if it's a Cloudinary configuration error
      if (uploadError.message && uploadError.message.includes('Invalid cloud_name')) {
        return res.status(500).json({
          success: false,
          message: 'Cloudinary configuration error. Please check your environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)'
        });
      }

      return res.status(500).json({
        success: false,
        message: `Failed to upload payment screenshot: ${uploadError.message || 'Unknown error'}`
      });
    }
  } catch (error) {
    console.error('❌ Upload payment screenshot error:', error);
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: `Failed to upload payment screenshot: ${error.message || 'Unknown error'}`
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price image description category'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:orderId
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate({
      path: 'items.product',
      select: 'name price image description category'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user or user is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, refundStatus } = req.query;

    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (refundStatus) {
      if (refundStatus === 'pending') {
        query.refundStatus = 'pending';
      } else if (refundStatus === 'processed') {
        query.refundStatus = 'processed';
      } else if (refundStatus === 'no-refund') {
        query.refundRequested = false;
      }
    }

    console.log('📋 Fetching all orders for admin');
    console.log('   Query filters:', query);

    const orders = await Order.find(query)
      .populate({
        path: 'items.product',
        select: 'name price image description category'
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .sort({ createdAt: -1 });

    // Log payment screenshot status for manual_payment orders
    const manualPaymentOrders = orders.filter(o => o.paymentMethod === 'manual_payment');
    console.log(`   Found ${orders.length} total orders`);
    console.log(`   Found ${manualPaymentOrders.length} manual payment orders`);
    manualPaymentOrders.forEach(order => {
      console.log(`   Order ${order._id}: paymentScreenshot = ${order.paymentScreenshot ? 'SET' : 'NULL'}`);
      if (order.paymentScreenshot) {
        console.log(`     URL: ${order.paymentScreenshot}`);
      }
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// @desc    Confirm payment (Admin only)
// @route   PUT /api/orders/:orderId/confirm-payment
// @access  Private/Admin
const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { adminNotes } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already confirmed'
      });
    }

    // Update payment status and order status
    order.paymentStatus = 'confirmed';
    order.orderStatus = 'confirmed';
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    await order.save();

    await order.populate({
      path: 'items.product',
      select: 'name price image description category'
    });

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: order
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:orderId/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, adminNotes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If cancelling order, restore stock
    if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.orderStatus = orderStatus;
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    await order.save();

    await order.populate({
      path: 'items.product',
      select: 'name price image description category'
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// @desc    Cancel order (Customer only)
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, phone, upiId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order is already cancelled
    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Restriction: Can only cancel if order is pending or confirmed
    // Cannot cancel if processing, shipped, or delivered
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order. Order is already ${order.orderStatus}. You can only cancel orders that are pending or confirmed.`
      });
    }

    // If payment was confirmed, require refund details
    if (order.paymentStatus === 'confirmed') {
      if (!phone && !upiId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide either phone number or UPI ID for refund'
        });
      }
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // Update order status
    order.orderStatus = 'cancelled';
    
    // If payment was confirmed, set up refund request with details
    if (order.paymentStatus === 'confirmed') {
      order.refundRequested = true;
      order.refundStatus = 'pending';
      order.refundDetails = {
        phone: phone || null,
        upiId: upiId || null,
        requestedAt: new Date()
      };
      if (reason) {
        order.adminNotes = `Cancellation reason: ${reason}`;
      }

      // Create notification for admin about refund request
      try {
        // Populate user to get name
        await order.populate({
          path: 'user',
          select: 'name email'
        });
        
        const adminUsers = await User.find({ role: 'admin' });
        const customerName = order.user?.name || 'Customer';
        for (const admin of adminUsers) {
          await createNotification(
            admin._id,
            'refund_request',
            'Refund Request Received',
            `${customerName} cancelled order #${order._id.toString().slice(-6)}. Refund requested for ₹${order.totalAmount.toFixed(2)}`,
            order._id
          );
        }
      } catch (notifError) {
        console.error('Failed to create notification for refund request:', notifError);
        // Don't fail cancellation if notification fails
      }
    }

    await order.save();

    await order.populate({
      path: 'items.product',
      select: 'name price image description category'
    });

    res.status(200).json({
      success: true,
      message: order.paymentStatus === 'confirmed' 
        ? 'Order cancelled. Refund request submitted with your details. Admin will process your refund and send the screenshot.'
        : 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

// @desc    Request refund details (Customer only)
// @route   POST /api/orders/:orderId/request-refund
// @access  Private
const requestRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { phone, upiId } = req.body;

    if (!phone && !upiId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either phone number or UPI ID for refund'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to request refund for this order'
      });
    }

    // Check if order is cancelled
    if (order.orderStatus !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order must be cancelled before requesting refund'
      });
    }

    // Check if payment was confirmed
    if (order.paymentStatus !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Refund can only be requested for orders with confirmed payment'
      });
    }

    // Update refund details
    order.refundRequested = true;
    order.refundStatus = 'pending';
    order.refundDetails = {
      phone: phone || null,
      upiId: upiId || null,
      requestedAt: new Date()
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund request submitted successfully. Admin will process your refund and send the screenshot.',
      data: order
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request refund'
    });
  }
};

// @desc    Update refund details (Admin only)
// @route   PUT /api/orders/:orderId/refund-details
// @access  Private/Admin
const updateRefundDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { phone, upiId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order must be cancelled to update refund details'
      });
    }

    if (phone) order.refundDetails.phone = phone;
    if (upiId) order.refundDetails.upiId = upiId;

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund details updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update refund details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update refund details'
    });
  }
};

// @desc    Upload refund screenshot (Admin only)
// @route   POST /api/orders/:orderId/refund-screenshot
// @access  Private/Admin
const uploadRefundScreenshot = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('📸 Refund screenshot upload request received');
    console.log('   Order ID:', orderId);
    console.log('   File received:', !!req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a refund screenshot'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order must be cancelled to upload refund screenshot'
      });
    }

    if (!order.refundRequested) {
      return res.status(400).json({
        success: false,
        message: 'Refund must be requested before uploading screenshot'
      });
    }

    // Delete old screenshot if exists
    if (order.refundScreenshot) {
      const oldPublicId = extractPublicId(order.refundScreenshot);
      if (oldPublicId) {
        try {
          await deleteImage(oldPublicId);
        } catch (deleteError) {
          console.error('Error deleting old refund screenshot:', deleteError);
        }
      }
    }

    // Upload new screenshot
    try {
      console.log('☁️  Uploading refund screenshot to Cloudinary...');
      const uploadResult = await uploadImage(req.file.buffer, 'veggie-store/refund-screenshots');
      
      if (!uploadResult || !uploadResult.secure_url) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload refund screenshot: Invalid response from Cloudinary'
        });
      }

      order.refundScreenshot = uploadResult.secure_url;
      order.refundStatus = 'processed';
      await order.save();

      // Create notification for customer about refund processed
      try {
        await createNotification(
          order.user,
          'refund_processed',
          'Refund Processed',
          `Your refund for order #${order._id.toString().slice(-6)} has been processed. Check your refund screenshot.`,
          order._id
        );
      } catch (notifError) {
        console.error('Failed to create notification for refund processed:', notifError);
        // Don't fail upload if notification fails
      }

      console.log('✅ Refund screenshot uploaded successfully');
      console.log('   URL:', order.refundScreenshot);

      res.status(200).json({
        success: true,
        message: 'Refund screenshot uploaded successfully',
        data: {
          refundScreenshot: order.refundScreenshot,
          refundStatus: order.refundStatus
        }
      });
    } catch (uploadError) {
      console.error('❌ Cloudinary upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: `Failed to upload refund screenshot: ${uploadError.message || 'Unknown error'}`
      });
    }
  } catch (error) {
    console.error('❌ Upload refund screenshot error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to upload refund screenshot: ${error.message || 'Unknown error'}`
    });
  }
};

module.exports = {
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
};

