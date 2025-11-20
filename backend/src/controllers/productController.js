const Product = require('../models/Product');
const { uploadImage, deleteImage, extractPublicId } = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sortBy, search } = req.query;

    // Build query
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sort = {};
    if (sortBy === 'price-low') {
      sort = { price: 1 };
    } else if (sortBy === 'price-high') {
      sort = { price: -1 };
    } else if (sortBy === 'rating') {
      sort = { rating: -1 };
    } else {
      sort = { createdAt: -1 }; // Default: newest first
    }

    const products = await Product.find(query).sort(sort);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, category, price, description, rating, stock } = req.body;
    let imageUrl = req.body.image; // Fallback to URL if no file uploaded

    // Handle file upload if present
    if (req.file) {
      try {
        const uploadResult = await uploadImage(req.file.buffer);
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        
        // Provide specific error messages
        if (uploadError.message && uploadError.message.includes('File size too large')) {
          return res.status(400).json({
            success: false,
            message: uploadError.message || 'Image file is too large. Maximum size is 10MB for Cloudinary free tier. Please compress your image before uploading.'
          });
        }
        
        if (uploadError.message && uploadError.message.includes('exceeds Cloudinary free tier limit')) {
          return res.status(400).json({
            success: false,
            message: uploadError.message
          });
        }
        
        return res.status(500).json({
          success: false,
          message: uploadError.message || 'Failed to upload image to Cloudinary'
        });
      }
    }

    // Validate required fields
    if (!name || !category || !price || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category, price, and description'
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image (upload file or URL)'
      });
    }

    // Validate category
    const validCategories = ['leafy', 'root', 'organic', 'fruits'];
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: leafy, root, organic, fruits'
      });
    }

    // Validate price
    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    const product = await Product.create({
      name,
      category: category.toLowerCase(),
      price: parseFloat(price),
      image: imageUrl,
      description,
      rating: rating ? parseFloat(rating) : 0,
      stock: stock ? parseInt(stock) : 0
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, category, price, description, rating, stock, isActive } = req.body;
    let imageUrl = req.body.image; // Fallback to URL if no file uploaded

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Handle file upload if present
    if (req.file) {
      try {
        // Delete old image from Cloudinary if it exists
        if (product.image) {
          const oldPublicId = extractPublicId(product.image);
          if (oldPublicId) {
            try {
              await deleteImage(oldPublicId);
            } catch (deleteError) {
              console.error('Error deleting old image:', deleteError);
              // Continue even if deletion fails
            }
          }
        }

        // Upload new image
        const uploadResult = await uploadImage(req.file.buffer);
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        
        // Provide specific error messages
        if (uploadError.message && uploadError.message.includes('File size too large')) {
          return res.status(400).json({
            success: false,
            message: uploadError.message || 'Image file is too large. Maximum size is 10MB for Cloudinary free tier. Please compress your image before uploading.'
          });
        }
        
        if (uploadError.message && uploadError.message.includes('exceeds Cloudinary free tier limit')) {
          return res.status(400).json({
            success: false,
            message: uploadError.message
          });
        }
        
        return res.status(500).json({
          success: false,
          message: uploadError.message || 'Failed to upload image to Cloudinary'
        });
      }
    }

    // Update fields
    if (name) product.name = name;
    if (category) {
      const validCategories = ['leafy', 'root', 'organic', 'fruits'];
      if (!validCategories.includes(category.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be one of: leafy, root, organic, fruits'
        });
      }
      product.category = category.toLowerCase();
    }
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price cannot be negative'
        });
      }
      product.price = parseFloat(price);
    }
    if (imageUrl) product.image = imageUrl;
    if (description) product.description = description;
    if (rating !== undefined) {
      if (rating < 0 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 0 and 5'
        });
      }
      product.rating = parseFloat(rating);
    }
    if (stock !== undefined) {
      if (stock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock cannot be negative'
        });
      }
      product.stock = parseInt(stock);
    }
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete image from Cloudinary if it exists
    if (product.image) {
      try {
        const publicId = extractPublicId(product.image);
        if (publicId) {
          console.log(`🗑️  Deleting image from Cloudinary: ${publicId}`);
          await deleteImage(publicId);
          console.log(`✅ Successfully deleted image from Cloudinary: ${publicId}`);
        } else {
          console.log('⚠️  Could not extract public ID from image URL, skipping Cloudinary deletion');
        }
      } catch (deleteError) {
        console.error('❌ Error deleting image from Cloudinary:', deleteError);
        // Continue with product deletion even if image deletion fails
        // This ensures the product is still deleted from database
      }
    }

    // Hard delete - permanently remove from database
    await Product.findByIdAndDelete(req.params.id);

    console.log(`✅ Product deleted successfully: ${product.name} (ID: ${req.params.id})`);

    res.status(200).json({
      success: true,
      message: 'Product and image deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// @desc    Get all products (including inactive) - Admin only
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get all products admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin
};

