import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, SlidersHorizontal, Grid3x3, List } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { categories } from '../utils/products';
import useProductStore from '../store/productStore';
import { getTeluguName } from '../utils/teluguTranslations';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const { products, isLoading, getProducts } = useProductStore();

  // Enhance products with Telugu names
  const productsWithTelugu = useMemo(() => {
    return products.map(product => {
      // If product already has a localName, keep it; otherwise add Telugu translation
      if (!product.localName && !product.nameLocal && product.name) {
        const teluguName = getTeluguName(product.name);
        if (teluguName) {
          return {
            ...product,
            localName: teluguName,
            nameLocal: teluguName
          };
        }
      }
      return product;
    });
  }, [products]);

  useEffect(() => {
    // Build query params
    const params = {};
    
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    
    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }

    if (priceRange !== 'all') {
      if (priceRange === 'under5') {
        params.maxPrice = '5';
      } else if (priceRange === '5to10') {
        params.minPrice = '5';
        params.maxPrice = '10';
      } else if (priceRange === 'over10') {
        params.minPrice = '10';
      }
    }

    if (sortBy !== 'featured') {
      params.sortBy = sortBy;
    }

    getProducts(params);
  }, [selectedCategory, priceRange, sortBy, searchQuery, getProducts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-16 md:pt-24 pb-20 md:pb-16">
      <div className="container mx-auto px-3 md:px-4">
        {/* Header - Native Mobile Style */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-8"
        >
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-2 md:mb-4 text-gray-900 tracking-tight">
            Shop Fresh Vegetables
          </h1>
          <p className="text-sm md:text-lg text-gray-600 hidden md:block font-medium">
            Discover farm-fresh organic produce
          </p>
        </motion.div>

        {/* Search Bar - Native Style */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 md:mb-6"
        >
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for atta, dal, coke and m..."
              className="w-full bg-white rounded-2xl md:rounded-2xl pl-11 md:pl-14 pr-11 md:pr-14 py-3 md:py-4 text-sm md:text-base border-2 border-gray-200 focus:border-green-500 focus:outline-none shadow-md hover:shadow-lg transition-all duration-200 placeholder:text-gray-400"
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Action Bar - Native Mobile Style */}
        <div className="flex items-center justify-between gap-2.5 md:gap-4 mb-4 md:mb-6">
          {/* Filter Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 ${
              showFilters
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 shadow-md hover:shadow-lg hover:border-green-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Filters</span>
          </motion.button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white rounded-xl p-1 border-2 border-gray-200 shadow-md">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3x3 className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border-2 border-gray-200 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-bold text-gray-700 focus:border-green-500 focus:outline-none shadow-md hover:shadow-lg transition-all duration-200 flex-1 max-w-[110px] md:max-w-none cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low</option>
            <option value="price-high">Price: High</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">

          {/* Filters Sidebar - Native Mobile Modal Style */}
          <AnimatePresence>
            {showFilters && (
              <>
                {/* Mobile Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                />
                
                {/* Filters Panel */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className={`fixed lg:relative inset-y-0 left-0 lg:inset-auto z-50 lg:z-auto w-80 lg:w-64 bg-white shadow-2xl lg:shadow-xl rounded-r-3xl lg:rounded-2xl overflow-y-auto border-r border-gray-100 ${
                    showFilters ? 'block' : 'hidden lg:block'
                  }`}
                >
                  <div className="p-5 md:p-6 bg-gradient-to-b from-white to-gray-50/50">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                      <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">Filters</h3>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-6">
                      <h4 className="font-extrabold text-gray-900 mb-4 text-base md:text-lg">Category</h4>
                      <div className="space-y-2.5">
                        <motion.label
                          whileTap={{ scale: 0.97 }}
                          className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedCategory === 'all'
                              ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-2 border-green-500 shadow-md'
                              : 'bg-white border-2 border-gray-200 hover:border-green-300 hover:bg-gray-50 shadow-sm'
                          }`}
                        >
                          <span className={`font-bold ${selectedCategory === 'all' ? 'text-green-700' : 'text-gray-700'}`}>
                            All Products
                          </span>
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === 'all'}
                            onChange={() => setSelectedCategory('all')}
                            className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer"
                          />
                        </motion.label>
                        {categories.map((cat) => (
                          <motion.label
                            key={cat.id}
                            whileTap={{ scale: 0.97 }}
                            className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                              selectedCategory === cat.id
                                ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-2 border-green-500 shadow-md'
                                : 'bg-white border-2 border-gray-200 hover:border-green-300 hover:bg-gray-50 shadow-sm'
                            }`}
                          >
                            <span className={`font-bold ${selectedCategory === cat.id ? 'text-green-700' : 'text-gray-700'}`}>
                              {cat.name}
                            </span>
                            <input
                              type="radio"
                              name="category"
                              checked={selectedCategory === cat.id}
                              onChange={() => setSelectedCategory(cat.id)}
                              className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                          </motion.label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-6">
                      <h4 className="font-extrabold text-gray-900 mb-4 text-base md:text-lg">Price Range</h4>
                      <div className="space-y-2.5">
                        {[
                          { value: 'all', label: 'All Prices' },
                          { value: 'under5', label: 'Under ₹50' },
                          { value: '5to10', label: '₹50 - ₹100' },
                          { value: 'over10', label: 'Over ₹100' },
                        ].map((price) => (
                          <motion.label
                            key={price.value}
                            whileTap={{ scale: 0.97 }}
                            className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                              priceRange === price.value
                                ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-2 border-green-500 shadow-md'
                                : 'bg-white border-2 border-gray-200 hover:border-green-300 hover:bg-gray-50 shadow-sm'
                            }`}
                          >
                            <span className={`font-bold ${priceRange === price.value ? 'text-green-700' : 'text-gray-700'}`}>
                              {price.label}
                            </span>
                            <input
                              type="radio"
                              name="price"
                              checked={priceRange === price.value}
                              onChange={() => setPriceRange(price.value)}
                              className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                          </motion.label>
                        ))}
                      </div>
                    </div>

                    {/* Clear All Button */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCategory('all');
                        setPriceRange('all');
                      }}
                      className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border-2 border-gray-300"
                    >
                      Clear All Filters
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Section */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 md:mb-6">
              <p className="text-sm md:text-base text-gray-600 font-semibold">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></span>
                    Loading...
                  </span>
                ) : (
                  <span className="font-extrabold text-gray-900 text-base">{productsWithTelugu.length}</span>
                )}{' '}
                {productsWithTelugu.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 md:py-32">
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-green-100 rounded-full"></div>
                  <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="mt-6 text-gray-600 font-medium">Loading fresh products...</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                    {productsWithTelugu.map((product, index) => (
                      <ProductCard key={product._id || product.id} product={product} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-5">
                    {productsWithTelugu.map((product, index) => (
                      <ProductCard key={product._id || product.id} product={product} index={index} listView={true} />
                    ))}
                  </div>
                )}

                {productsWithTelugu.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 md:py-32"
                  >
                    <div className="text-7xl md:text-8xl mb-6">🥬</div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600 text-center max-w-md px-4">
                      Try adjusting your filters or search query to see more results
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCategory('all');
                        setPriceRange('all');
                        setSearchQuery('');
                      }}
                      className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
                    >
                      Clear All Filters
                    </motion.button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
