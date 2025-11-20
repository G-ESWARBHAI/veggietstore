const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('\n📋 To fix this issue:');
    console.error('   1. Start MongoDB locally: mongod');
    console.error('   2. OR use MongoDB Atlas: Update MONGODB_URI in .env');
    console.error('   3. Make sure your .env file has the correct MONGODB_URI\n');
    
    // In development, allow server to continue (but APIs won't work)
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Server running without MongoDB (APIs will fail)');
      return;
    }
    // In production, exit on connection failure
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Veggie Store Backend API is running',
    version: '1.0.0'
  });
});

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler (must be after all routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxSizeMB = process.env.MAX_FILE_SIZE 
        ? (parseInt(process.env.MAX_FILE_SIZE) / (1024 * 1024)).toFixed(0)
        : '10';
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum size is ${maxSizeMB}MB.`
      });
    }
  }
  
  // Handle file type errors
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`🛍️  Products API: http://localhost:${PORT}/api/products`);
    console.log(`🛒 Cart API: http://localhost:${PORT}/api/cart`);
    console.log(`👤 Profile API: http://localhost:${PORT}/api/profile`);
    console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;

