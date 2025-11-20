import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import useProductStore from '../store/productStore';

const ProductForm = ({ product, onClose, onSuccess }) => {
  const { createProduct, updateProduct, isLoading, error, clearError } = useProductStore();
  const [formData, setFormData] = useState({
    name: '',
    category: 'leafy',
    price: '',
    image: '',
    description: '',
    rating: '',
    stock: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'leafy',
        price: product.price || '',
        image: product.image || '',
        description: product.description || '',
        rating: product.rating || '',
        stock: product.stock || '',
      });
      setImagePreview(product.image || null);
    }
    clearError();
  }, [product, clearError]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'imageFile' && files && files[0]) {
      const file = files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear URL if file is selected
      setFormData({ ...formData, image: '' });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      errors.price = 'Valid price is required';
    }

    if (!imageFile && !formData.image.trim()) {
      errors.image = 'Please upload an image file or provide an image URL';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (formData.rating && (parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)) {
      errors.rating = 'Rating must be between 0 and 5';
    }

    if (formData.stock && parseInt(formData.stock) < 0) {
      errors.stock = 'Stock cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    // Create FormData for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name.trim());
    formDataToSend.append('category', formData.category);
    formDataToSend.append('price', parseFloat(formData.price));
    formDataToSend.append('description', formData.description.trim());
    formDataToSend.append('rating', formData.rating ? parseFloat(formData.rating) : 0);
    formDataToSend.append('stock', formData.stock ? parseInt(formData.stock) : 0);

    // Add image file if uploaded, otherwise add URL
    if (imageFile) {
      formDataToSend.append('image', imageFile); // Field name must match multer's 'image'
    } else if (formData.image.trim()) {
      formDataToSend.append('image', formData.image.trim());
    }

    let result;
    if (product) {
      result = await updateProduct(product._id, formDataToSend);
    } else {
      result = await createProduct(formDataToSend);
    }

    if (result.success) {
      onSuccess();
    }
  };

  const categories = [
    { value: 'leafy', label: 'Leafy Greens' },
    { value: 'root', label: 'Root Veggies' },
    { value: 'organic', label: 'Organic' },
    { value: 'fruits', label: 'Fresh Fruits' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4 pb-10 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-none md:rounded-2xl shadow-2xl max-w-2xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 active:scale-95"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm md:text-base">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 rounded-xl focus:outline-none transition-colors ${
                formErrors.name
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:border-green-500'
              }`}
              placeholder="e.g., Fresh Spinach"
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 rounded-xl focus:outline-none transition-colors ${
                formErrors.category
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:border-green-500'
              }`}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
            )}
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 rounded-xl focus:outline-none transition-colors ${
                  formErrors.price
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:border-green-500'
                }`}
                placeholder="0.00"
              />
              {formErrors.price && (
                <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 rounded-xl focus:outline-none transition-colors ${
                  formErrors.stock
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:border-green-500'
                }`}
                placeholder="0"
              />
              {formErrors.stock && (
                <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.stock}</p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
              Product Image <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-2">Upload Image File</label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleChange}
                  className={`w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm border-2 rounded-xl focus:outline-none transition-colors ${
                    formErrors.image
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-green-500'
                  }`}
                />
              </div>
              <div className="text-center text-gray-500 text-xs md:text-sm">OR</div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-2">Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  disabled={!!imageFile}
                  className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 rounded-xl focus:outline-none transition-colors ${
                    formErrors.image
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-green-500'
                  } ${imageFile ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            {formErrors.image && (
              <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.image}</p>
            )}
            {imagePreview && (
              <div className="mt-3">
                <p className="text-xs md:text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
              Rating (0-5)
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="5"
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 rounded-xl focus:outline-none transition-colors ${
                formErrors.rating
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:border-green-500'
              }`}
              placeholder="0.0"
            />
            {formErrors.rating && (
              <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.rating}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 rounded-xl focus:outline-none transition-colors resize-none ${
                formErrors.description
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:border-green-500'
              }`}
              placeholder="Product description..."
            />
            {formErrors.description && (
              <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4 border-t border-gray-200 pb-4 md:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 md:px-6 py-3 text-sm md:text-base border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="flex-1 px-4 md:px-6 py-3 text-sm md:text-base bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoading
                ? product
                  ? 'Updating...'
                  : 'Creating...'
                : product
                ? 'Update Product'
                : 'Create Product'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductForm;
