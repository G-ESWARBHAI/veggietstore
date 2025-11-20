import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  X, 
  ShoppingBag,
  ArrowLeft,
  Search,
  Filter,
  Grid3x3,
  List,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useProductStore from '../store/productStore';
import ProductForm from '../components/ProductForm';
import AdminBottomNavigation from '../components/AdminBottomNavigation';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { products, isLoading, getAllProductsAdmin, deleteProduct, clearError } = useProductStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      getAllProductsAdmin();
    }
  }, [isAuthenticated, user, getAllProductsAdmin]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin access to view this page.</p>
          <Link to="/">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold"
            >
              Go Home
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await deleteProduct(id);
    if (result.success) {
      setDeleteConfirm(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.isActive).length,
    totalStock: products.reduce((sum, p) => sum + (p.stock || 0), 0),
    totalValue: products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toFixed(2)
  };

  // Filter and search products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.isActive) ||
                         (filterStatus === 'inactive' && !product.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-16">
        {/* Desktop Header */}
      <div className="hidden md:block container mx-auto px-4 max-w-7xl pt-20 pb-6 lg:pt-20">
        <div className="flex items-center justify-between mb-6">
            <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">{t('admin.dashboard')}</h1>
            <p className="text-gray-600 text-sm">{t('admin.manageOrders')}</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/orders">
                <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('admin.orders')}</span>
                </motion.button>
              </Link>
              <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(true)}
              className="bg-green-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md"
              >
              <Plus className="w-4 h-4" />
                <span>{t('admin.addProduct')}</span>
              </motion.button>
            </div>
          </div>

        {/* Desktop Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl md:pt-0 pt-20">
        {/* Compact Stats Cards - Mobile First */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-3 md:p-4 rounded-2xl shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">{t('admin.totalProducts')}</p>
                <p className="text-xl md:text-2xl font-black text-gray-800">{stats.totalProducts}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-3 md:p-4 rounded-2xl shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">{t('admin.activeProducts')}</p>
                <p className="text-xl md:text-2xl font-black text-gray-800">{stats.activeProducts}</p>
              </div>
              <div className="bg-emerald-100 p-2 rounded-full">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-3 md:p-4 rounded-2xl shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">{t('admin.totalStock')}</p>
                <p className="text-xl md:text-2xl font-black text-gray-800">{stats.totalStock}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-3 md:p-4 rounded-2xl shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">{t('admin.totalValue')}</p>
                <p className="text-xl md:text-2xl font-black text-gray-800">₹{stats.totalValue}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter and View Toggle - Mobile */}
        <div className="md:hidden mb-4 flex items-center justify-between gap-3">
          <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide">
            {[
              { key: 'all', label: t('admin.allProducts'), count: products.length },
              { key: 'active', label: t('admin.active'), count: stats.activeProducts },
              { key: 'inactive', label: t('admin.inactive'), count: products.length - stats.activeProducts }
            ].map((filter) => (
              <motion.button
                key={filter.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus(filter.key)}
                className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap ${
                  filterStatus === filter.key
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 shadow-sm'
                }`}
              >
                {filter.label} ({filter.count})
              </motion.button>
            ))}
          </div>
          <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'text-gray-600'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-500 text-white' : 'text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Desktop Filter and View Toggle */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex gap-3">
            {[
              { key: 'all', label: 'All Products', count: products.length },
              { key: 'active', label: 'Active', count: stats.activeProducts },
              { key: 'inactive', label: 'Inactive', count: products.length - stats.activeProducts }
            ].map((filter) => (
              <motion.button
                key={filter.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus(filter.key)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm ${
                  filterStatus === filter.key
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50'
                }`}
              >
                {filter.label} ({filter.count})
              </motion.button>
            ))}
          </div>
          <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'text-gray-600'}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-500 text-white' : 'text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Products Display */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600 text-lg mb-4">
              {searchQuery ? 'No products found matching your search' : 'No products found. Add your first product!'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold"
              >
                Add Product
              </motion.button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View - Mobile Native Style */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((product, index) => (
        <motion.div
                key={product._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      product.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-lg font-black text-green-600">₹{product.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className={`text-lg font-black ${product.stock > 0 ? 'text-gray-800' : 'text-red-600'}`}>
                        {product.stock || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold capitalize">
                      {product.category}
                    </span>
          </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(product._id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </motion.button>
                  </div>
            </div>
              </motion.div>
            ))}
            </div>
          ) : (
          /* List View - Compact Table */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase">Image</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase">Category</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase">Price</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase">Stock</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm font-bold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-1 text-xs font-bold rounded-lg bg-green-100 text-green-700 capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm font-bold text-green-600">
                        ₹{product.price}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-sm font-bold ${product.stock > 0 ? 'text-gray-800' : 'text-red-600'}`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                          product.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteConfirm(product._id)}
                            className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseForm}
          onSuccess={() => {
            handleCloseForm();
            getAllProductsAdmin();
          }}
        />
      )}
      </AnimatePresence>

      {/* Delete Confirmation Modal - Simple & Clear */}
      <AnimatePresence>
      {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
          <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">⚠️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Product?</h3>
                <p className="text-gray-600 text-sm">
                  This cannot be undone. Are you sure?
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50"
              >
                Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg"
              >
                Delete
                </motion.button>
            </div>
          </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
      
      {/* Admin Bottom Navigation - Mobile Only */}
      <AdminBottomNavigation onAddProductClick={() => setShowForm(true)} />
    </div>
  );
};

export default AdminDashboard;
