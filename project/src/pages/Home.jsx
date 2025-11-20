import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Leaf as LeafIcon, Sparkles, ChevronRight, MapPin, Search, Filter, ShoppingCart, User, ChevronDown, Percent, ChevronLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { categories, testimonials } from '../utils/products';
import useProductStore from '../store/productStore';
import { useCart } from '../context/CartContext';
import useAuthStore from '../store/authStore';

const Home = () => {
  const { products, getProducts } = useProductStore();
  const { getCartCount } = useCart();
  const { user, isAuthenticated } = useAuthStore();
  const featuredProducts = products.slice(0, 4);
  const heroRef = useRef(null);
  const featuresScrollRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const cartCount = getCartCount();
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // Hero carousel slides with images
  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'FRESH VEGETABLES',
      subtitle: 'For the Greatest Health Benefits!',
      tag: '🌱 DAILY FRESH ORGANIC FOOD',
      gradient: 'from-green-600/80 via-green-700/70 to-emerald-800/80'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'ORGANIC PRODUCE',
      subtitle: 'Farm Fresh & Delicious!',
      tag: '🥬 100% ORGANIC CERTIFIED',
      gradient: 'from-emerald-600/80 via-green-700/70 to-teal-800/80'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'PREMIUM QUALITY',
      subtitle: 'Handpicked Just For You!',
      tag: '✨ PREMIUM SELECTION',
      gradient: 'from-teal-600/80 via-emerald-700/70 to-green-800/80'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'NUTRITIOUS & TASTY',
      subtitle: 'Your Health, Our Priority!',
      tag: '💚 HEALTHY LIVING',
      gradient: 'from-green-500/80 via-emerald-600/70 to-teal-700/80'
    }
  ];
  
  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000); // Change slide every 6 seconds for smoother experience
    
    return () => clearInterval(interval);
  }, [heroSlides.length]);
  
  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }
  };
  
  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    // Fetch products on component mount
    getProducts();
  }, [getProducts]);

  // Auto-scroll for features section on mobile - Infinite Loop
  useEffect(() => {
    const scrollContainer = featuresScrollRef.current;
    if (!scrollContainer) return;

    const scrollSpeed = 1; // pixels per frame
    let isPaused = false;
    let animationFrameId;

    // Get the width of one item (including gap)
    const getItemWidth = () => {
      const firstChild = scrollContainer.querySelector('.feature-item');
      if (firstChild) {
        const itemWidth = firstChild.offsetWidth;
        const gap = 16; // gap-4 = 1rem = 16px
        return itemWidth + gap;
      }
      return 0;
    };

    const autoScroll = () => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(autoScroll);
        return;
      }

      const itemWidth = getItemWidth();
      if (itemWidth === 0) {
        animationFrameId = requestAnimationFrame(autoScroll);
        return;
      }

      scrollContainer.scrollLeft += scrollSpeed;

      // When we've scrolled past the first set of items, reset to start seamlessly
      // We duplicate items, so when we reach halfway, reset to 0
      const scrollWidth = scrollContainer.scrollWidth;
      const clientWidth = scrollContainer.clientWidth;
      const maxScroll = scrollWidth / 2; // Since we duplicate items

      if (scrollContainer.scrollLeft >= maxScroll) {
        scrollContainer.scrollLeft = scrollContainer.scrollLeft - maxScroll;
      }

      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Pause on user interaction
    const handleInteractionStart = () => {
      isPaused = true;
    };
    
    const handleInteractionEnd = () => {
      setTimeout(() => {
        isPaused = false;
      }, 3000); // Resume after 3 seconds
    };

    // Touch events
    scrollContainer.addEventListener('touchstart', handleInteractionStart);
    scrollContainer.addEventListener('touchend', handleInteractionEnd);
    scrollContainer.addEventListener('touchmove', handleInteractionStart);
    
    // Mouse events (for testing on desktop)
    scrollContainer.addEventListener('mousedown', handleInteractionStart);
    scrollContainer.addEventListener('mouseup', handleInteractionEnd);
    scrollContainer.addEventListener('wheel', handleInteractionStart);

    // Start auto-scroll
    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      scrollContainer.removeEventListener('touchstart', handleInteractionStart);
      scrollContainer.removeEventListener('touchend', handleInteractionEnd);
      scrollContainer.removeEventListener('touchmove', handleInteractionStart);
      scrollContainer.removeEventListener('mousedown', handleInteractionStart);
      scrollContainer.removeEventListener('mouseup', handleInteractionEnd);
      scrollContainer.removeEventListener('wheel', handleInteractionStart);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Hero Section - Carousel with Native Mobile Feel */}
      <section 
        ref={heroRef} 
        className="relative w-full overflow-hidden bg-white"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile-First Hero Carousel */}
        <div className="md:hidden">
          {/* Top Bar - Native Mobile Style */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
          >
            <div className="px-4 py-3">
              {/* Delivery Address Bar - Only show when logged in */}
              {isAuthenticated && user && (
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 flex-1"
                  >
                    <MapPin className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Delivery Address</p>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {user.address || user.city 
                            ? `${user.address ? user.address + ', ' : ''}${user.city || ''}${user.country ? ', ' + user.country : ''}`.trim() || 'Add Address'
                            : 'Add Address'}
                        </p>
                        <ChevronDown className="w-3 h-3 text-gray-500" />
                      </div>
        </div>
                  </motion.div>
                  
                  {/* Right Icons */}
                  <div className="flex items-center gap-3">
                    <Link to="/cart">
            <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="relative"
                      >
                        <ShoppingCart className="w-6 h-6 text-gray-700" />
                        {cartCount > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                          >
                            {cartCount > 9 ? '9+' : cartCount}
                          </motion.span>
                        )}
                      </motion.div>
                    </Link>
                    <Link to="/profile">
              <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden"
                      >
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
              </motion.div>
                    </Link>
                  </div>
                </div>
              )}

              {/* Top Bar for Non-Logged In Users */}
              {!isAuthenticated && (
                <div className="flex items-center justify-end mb-3">
                  <Link to="/login">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Login</span>
                    </motion.button>
                  </Link>
                  <Link to="/cart" className="ml-3">
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="relative"
                    >
                      <ShoppingCart className="w-6 h-6 text-gray-700" />
                      {cartCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {cartCount > 9 ? '9+' : cartCount}
                        </motion.span>
                      )}
                    </motion.div>
                  </Link>
                </div>
              )}

              {/* Enhanced Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <Link to="/shop">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border-2 border-gray-100 shadow-sm hover:border-green-200 hover:shadow-md transition-all"
                  >
                    <Search className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500 flex-1 font-medium">Search Products...</span>
                    <div className="bg-green-50 rounded-lg p-1.5">
                      <Filter className="w-4 h-4 text-green-600" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Hero Carousel Container */}
          <div className="relative h-[70vh] overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-black/20 z-30">
              <motion.div
                key={currentSlide}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
                className="h-full bg-white"
              />
            </div>

            <AnimatePresence mode="wait">
              {heroSlides.map((slide, index) => {
                if (index !== currentSlide) return null;
                return (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url('${slide.image}')` }}
                      />
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 h-full flex flex-col justify-end px-4 pb-12">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="text-white"
                      >
                        {/* Tag with Enhanced Design */}
                    <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="mb-4"
                        >
                          <span className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-md text-white px-5 py-2 rounded-full text-xs font-bold border-2 border-white/40 shadow-xl">
                            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                            {slide.tag}
                          </span>
                    </motion.div>

                        {/* Title with Enhanced Typography */}
                        <h1 className="text-5xl font-black mb-3 leading-tight drop-shadow-2xl" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.6)' }}>
                          {slide.title}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg text-white/95 mb-8 font-semibold drop-shadow-lg" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                          {slide.subtitle}
                        </p>

                        {/* Enhanced CTA Button with Gradient */}
                        <div>
                          <Link to="/shop" className="block">
                            <motion.button
                              whileHover={{ scale: 1.03, y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              className="relative bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white px-8 py-4.5 rounded-2xl font-bold text-base shadow-2xl flex items-center justify-center gap-2 w-full transition-all overflow-hidden group"
                            >
                              <span className="relative z-10">SHOP NOW</span>
                              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-green-500"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.3 }}
                              />
                  </motion.button>
                </Link>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Enhanced Carousel Navigation Dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2.5 items-center bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-8 h-2 bg-white shadow-lg' 
                      : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Enhanced Promotional Banner Below Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="relative mx-4 mt-6 mb-6 overflow-hidden rounded-3xl shadow-2xl"
          >
            <div className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 p-6 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                      <Percent className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white text-2xl font-black">30% OFF</span>
                    <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-bold">LIMITED TIME</span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-1">Massive Savings Inside!</h3>
                  <p className="text-white/95 text-sm font-medium">Everything You Need. Right Here.</p>
                </div>
                <Link to="/shop" className="ml-4">
                  <motion.button
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-green-600 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center gap-2 group"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </div>
            </div>
            </motion.div>
        </div>

        {/* Desktop Hero Carousel */}
        <div className="hidden md:block relative w-full h-[85vh] lg:h-[90vh] overflow-hidden pt-16">
          <div className="relative h-full">
            <AnimatePresence mode="wait">
              {heroSlides.map((slide, index) => {
                if (index !== currentSlide) return null;
                return (
        <motion.div
                    key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <div className="absolute inset-0">
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url('${slide.image}')` }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-center px-6 lg:px-8">
                      <div className="container mx-auto max-w-6xl">
          <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="text-white max-w-2xl md:max-w-3xl"
                        >
                          <div className="mb-6">
                            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-7 py-2.5 rounded-full text-sm font-bold border-2 border-white/40 shadow-lg">
                              {slide.tag}
                            </span>
                          </div>

                          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-tight drop-shadow-2xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                            {slide.title}
                          </h1>

                          <p className="text-xl lg:text-2xl xl:text-3xl text-white mb-8 font-semibold leading-relaxed drop-shadow-lg" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                            {slide.subtitle}
                          </p>

                          <div className="flex gap-4">
                            <Link to="/shop">
                              <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-green-500 hover:bg-green-600 text-white px-10 py-5 lg:px-12 lg:py-6 rounded-xl font-semibold text-lg lg:text-xl shadow-2xl flex items-center justify-center gap-3 transition-all"
                              >
                                <span>SHOP NOW</span>
                                <ArrowRight className="w-6 h-6" />
                              </motion.button>
                            </Link>
                            <Link to="/shop">
                              <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/50 px-10 py-5 lg:px-12 lg:py-6 rounded-xl font-semibold text-lg lg:text-xl shadow-xl flex items-center justify-center gap-3 transition-all"
                              >
                                <span>EXPLORE</span>
                                <Sparkles className="w-6 h-6" />
                              </motion.button>
                            </Link>
                          </div>
            </motion.div>
                      </div>
                    </div>
          </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Desktop Carousel Dots */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'w-12 bg-white' : 'w-3 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories - Responsive: Horizontal Scroll on Mobile, Grid on Desktop */}
      <section className="py-4 md:py-8 bg-white">
        <div className="px-4 mb-3 md:mb-6">
          <h2 className="text-xl md:text-3xl font-bold text-gray-800">Shop by Category</h2>
        </div>
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-3 px-4" style={{ width: 'max-content' }}>
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <Link to="/shop">
                  <motion.div
                    className={`bg-gradient-to-br ${category.color} w-28 h-32 rounded-2xl shadow-md flex flex-col items-center justify-center relative overflow-hidden`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="text-4xl mb-2"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {category.icon}
                    </motion.div>
                    <h3 className="text-white text-sm font-bold text-center px-2">
                      {category.name}
                    </h3>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 px-4 max-w-7xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/shop">
                <motion.div
                  className={`bg-gradient-to-br ${category.color} p-6 lg:p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center relative overflow-hidden min-h-[200px]`}
                  whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                >
                  <motion.div
                    className="text-5xl lg:text-6xl mb-3"
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    {category.icon}
                  </motion.div>
                  <h3 className="text-white text-lg lg:text-xl font-bold text-center">
                    {category.name}
                  </h3>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Products - Responsive: Horizontal Scroll on Mobile, Grid on Desktop */}
      <section className="py-4 md:py-8 bg-gray-50">
        <div className="px-4 mb-3 md:mb-6 flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-800">Popular Products</h2>
            <p className="text-sm md:text-base text-gray-600">Fresh picks daily</p>
          </div>
          <Link to="/shop">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className="text-green-600 font-semibold text-sm md:text-base flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </Link>
        </div>
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-4 px-4" style={{ width: 'max-content' }}>
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 w-48"
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))
            ) : (
              <div className="px-4 py-8 text-gray-500 text-sm">
                No products available yet. Check back soon!
              </div>
            )}
          </div>
        </div>
        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 px-4 max-w-7xl mx-auto">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-4 text-center py-12 text-gray-500">
              No products available yet. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* Features - Responsive: Horizontal Scroll on Mobile, Grid on Desktop */}
      <section className="py-4 md:py-8 bg-white">
        {/* Mobile: Horizontal Scroll with Auto-Scroll */}
        <div 
          ref={featuresScrollRef}
          className="md:hidden overflow-x-auto scrollbar-hide pb-4"
          style={{ 
            scrollBehavior: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex gap-4 px-4" style={{ width: 'max-content' }}>
            {/* Duplicate items for infinite loop effect */}
            {[...Array(2)].map((_, duplicateIndex) => (
              <React.Fragment key={duplicateIndex}>
                {[
                  {
                    icon: Truck,
                    title: 'Free Delivery',
                    description: 'Over ₹500',
                    color: 'from-blue-500 to-blue-600',
                  },
                  {
                    icon: Shield,
                    title: '100% Secure',
                    description: 'Safe payments',
                    color: 'from-purple-500 to-purple-600',
                  },
                  {
                    icon: LeafIcon,
                    title: 'Organic',
                    description: 'Farm fresh',
                    color: 'from-green-500 to-emerald-600',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={`${duplicateIndex}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 w-32 feature-item"
                  >
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <motion.div
                        className={`bg-gradient-to-br ${feature.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <h3 className="text-sm font-bold text-gray-800 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 px-4 max-w-7xl mx-auto">
          {[
            {
              icon: Truck,
              title: 'Free Delivery',
              description: 'On orders over ₹500',
              color: 'from-blue-500 to-blue-600',
            },
            {
              icon: Shield,
              title: '100% Secure',
              description: 'Safe payment methods',
              color: 'from-purple-500 to-purple-600',
            },
            {
              icon: LeafIcon,
              title: 'Organic Certified',
              description: 'Farm fresh guarantee',
              color: 'from-green-500 to-emerald-600',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gray-50 rounded-xl p-6 lg:p-8 text-center"
            >
              <motion.div
                className={`bg-gradient-to-br ${feature.color} w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </motion.div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm lg:text-base text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Customer Reviews - Responsive: Horizontal Scroll on Mobile, Grid on Desktop */}
      <section className="py-4 md:py-8 bg-gray-50">
        <div className="px-4 mb-3 md:mb-6 max-w-7xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold text-gray-800">Customer Reviews</h2>
        </div>
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-4 px-4" style={{ width: 'max-content' }}>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 w-72 bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-3">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center space-x-2">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-800">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">Verified</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 px-4 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl p-6 lg:p-8 shadow-md hover:shadow-xl"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-base lg:text-lg text-gray-700 mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="flex items-center space-x-3">
                <motion.img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring" }}
                />
                <div>
                  <p className="font-bold text-base lg:text-lg text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">Verified Customer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
