import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, index = 0, listView = false }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  // Calculate discount percentage if mrp exists
  const mrp = product.mrp || product.originalPrice;
  const price = product.price || product.discountedPrice || 0;
  const discount = mrp && price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  
  // Get quantity/weight info
  const quantity = product.quantity || product.weight || product.unit || '1 unit';
  const localName = product.localName || product.nameLocal;
  const deliveryTime = product.deliveryTime; // Only show if exists in product data
  const hasOptions = product.variants && product.variants.length > 0;

  if (listView) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03, type: "spring" }}
        whileHover={{ x: 4 }}
      >
        <Link to={`/product/${product._id || product.id}`}>
          <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100/50 overflow-hidden group">
            <div className="flex gap-4 p-4">
              <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
                <motion.img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {discount > 0 && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
                    {discount}% OFF
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {product.name}
                    {localName && (
                      <span className="text-gray-500 font-normal text-xs block mt-0.5">
                        ({localName})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mb-2">{quantity}</p>
                  {deliveryTime && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-green-50 rounded-full p-1">
                        <Clock className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-xs text-green-600 font-semibold">{deliveryTime}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg md:text-xl font-extrabold text-gray-900">₹{price.toFixed(0)}</span>
                      {mrp && mrp > price && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400 font-medium">MRP</span>
                          <span className="text-sm text-gray-400 line-through font-semibold">₹{mrp.toFixed(0)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleAddToCart}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 active:shadow-sm"
                  >
                    ADD
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 100 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/product/${product._id || product.id}`}>
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100/50 group">
          {/* Product Image */}
          <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              whileHover={{ scale: 1.1 }}
            />
            {discount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2.5 right-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-0.5"
              >
                <span>{discount}%</span>
                <span className="text-[9px]">OFF</span>
              </motion.div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-2.5 flex flex-col gap-1.5">
            {/* ADD Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg text-xs font-bold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg active:shadow-sm"
            >
              <span className="flex items-center justify-center gap-1">
                ADD
              </span>
              {hasOptions && (
                <span className="block text-[9px] font-normal mt-0.5 opacity-90">2 options</span>
              )}
            </motion.button>

            {/* Quantity/Weight */}
            <p className="text-[10px] text-gray-500 font-medium leading-tight">{quantity}</p>

            {/* Product Name */}
            <h3 className="text-xs font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-green-600 transition-colors">
              {product.name}
              {localName && (
                <span className="text-gray-500 font-normal text-[10px] block leading-tight">
                  ({localName})
                </span>
              )}
            </h3>

            {/* Delivery Time */}
            {deliveryTime && (
              <div className="flex items-center gap-1">
                <div className="bg-green-50 rounded-full p-0.5">
                  <Clock className="w-2.5 h-2.5 text-green-600" />
                </div>
                <span className="text-[10px] text-green-600 font-semibold">{deliveryTime}</span>
              </div>
            )}

            {/* Price */}
            <div className="pt-0.5">
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-sm font-extrabold text-gray-900">₹{price.toFixed(0)}</span>
                {mrp && mrp > price && (
                  <div className="flex items-center gap-0.5">
                    <span className="text-[9px] text-gray-400 font-medium">MRP</span>
                    <span className="text-[10px] text-gray-400 line-through font-semibold">₹{mrp.toFixed(0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
