import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Minus, Plus, Heart, Share2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import useProductStore from '../store/productStore';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { product, products, isLoading, getProduct, getProducts } = useProductStore();

  useEffect(() => {
    if (id) {
      getProduct(id);
    }
  }, [id, getProduct]);

  useEffect(() => {
    // Fetch all products for related products
    getProducts({ category: product?.category });
  }, [product?.category, getProducts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-20 md:pb-0 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-20 md:pb-0 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Product not found</h2>
          <Link to="/shop">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold">
              Back to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  const handleAddToCart = () => {
    // addToCart now handles quantity internally
    addToCart({ ...product, quantity });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-20 md:pb-16">
      <div className="container mx-auto px-4">
        <Link to="/shop">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center space-x-2 text-gray-700 hover:text-green-600 mb-8 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Shop</span>
          </motion.button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 lg:h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-semibold">
                  {product.rating} / 5.0
                </span>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {product.description}
            </p>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl">
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-5xl font-bold text-green-600">
                  ${product.price}
                </span>
                <span className="text-gray-600">per unit</span>
              </div>
              <p className="text-sm text-gray-600">
                {product.stock > 0 ? (
                  <span className="text-green-600 font-semibold">
                    ✓ In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">Out of Stock</span>
                )}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-semibold">Quantity:</span>
                <div className="flex items-center space-x-3 bg-white rounded-full shadow-md px-2 py-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>Add to Cart</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white border-2 border-gray-300 p-4 rounded-full hover:border-red-500 hover:text-red-500 transition-colors"
                >
                  <Heart className="w-6 h-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white border-2 border-gray-300 p-4 rounded-full hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <Share2 className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <span className="text-2xl">🚚</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Free Delivery</p>
                  <p className="text-sm text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">100% Organic</p>
                  <p className="text-sm text-gray-600">Certified fresh produce</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Related Products
              </h2>
              <p className="text-gray-600 text-lg">
                You might also like these items
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
