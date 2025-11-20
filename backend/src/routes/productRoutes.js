const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllProductsAdmin);
router.post('/', protect, authorize('admin'), upload.single('image'), createProduct);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
