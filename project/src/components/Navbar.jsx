import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Leaf, User, LogOut, Settings, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import useAuthStore from '../store/authStore';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: t('common.home') },
    { path: '/shop', label: t('common.shop') },
    { path: '/about', label: t('common.about') },
    { path: '/contact', label: t('common.contact') },
  ];

  const cartCount = getCartCount();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md md:shadow-lg py-2 md:py-3'
          : 'bg-white/95 md:bg-white/90 backdrop-blur-md md:backdrop-blur-sm py-2.5 md:py-4'
      }`}
    >
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex justify-between items-center">
          <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/'} className="flex items-center space-x-1.5 md:space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-green-400 to-emerald-600 p-1.5 md:p-2 rounded-full"
            >
              <Leaf className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </motion.div>
            <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t('navbar.title')}
            </span>
          </Link>

          {/* Hide regular nav links for admins */}
          {user?.role !== 'admin' && (
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-gray-700 hover:text-green-600 transition-colors font-medium ${
                    location.pathname === link.path ? 'text-green-600' : ''
                  }`}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-600"
                    />
                  )}
                </Link>
              ))}
            </div>
          )}
          
          {/* Admin Navigation Links */}
          {user?.role === 'admin' && (
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/admin/dashboard"
                className={`relative text-gray-700 hover:text-green-600 transition-colors font-medium ${
                  location.pathname.startsWith('/admin') ? 'text-green-600' : ''
                }`}
              >
                {t('admin.dashboard')}
                {location.pathname.startsWith('/admin') && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-600"
                  />
                )}
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Hide some icons on mobile since we have bottom nav */}
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="hidden md:block">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs md:text-sm font-semibold hover:shadow-lg transition-shadow"
                    >
                      {t('navbar.admin')}
                    </motion.button>
                  </Link>
                )}
                {/* Hide regular user features for admins */}
                {user?.role !== 'admin' && (
                  <>
                    <div className="hidden md:block">
                      <NotificationBell />
                    </div>
                    {/* Hide orders/profile on mobile - available in bottom nav */}
                    <Link to="/orders" className="hidden md:block">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-full transition-colors relative ${
                          location.pathname === '/orders'
                            ? 'bg-green-100 text-green-600'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="My Orders"
                      >
                        <Package className="w-5 h-5 md:w-6 md:h-6" />
                        {location.pathname === '/orders' && (
                          <motion.div
                            layoutId="orders-indicator"
                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"
                          />
                        )}
                      </motion.button>
                    </Link>
                    <Link to="/profile" className="hidden md:block">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-full transition-colors relative ${
                          location.pathname === '/profile'
                            ? 'bg-green-100 text-green-600'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Profile"
                      >
                        <User className="w-5 h-5 md:w-6 md:h-6" />
                        {location.pathname === '/profile' && (
                          <motion.div
                            layoutId="profile-indicator"
                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"
                          />
                        )}
                      </motion.button>
                    </Link>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="hidden md:block p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                </motion.button>
              </>
            ) : (
              <Link to="/login" className="hidden md:block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Login"
                >
                  <User className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                </motion.button>
              </Link>
            )}

            {/* Cart - hide for admins */}
            {user?.role !== 'admin' && (
              <Link to="/cart" className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] md:text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center border-2 border-white"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </motion.button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                style={{ top: '56px' }}
              />
              
              {/* Mobile Menu */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="md:hidden mt-3 pb-4 border-t border-gray-100 relative z-50 bg-white"
              >
                <div className="flex flex-col space-y-1 pt-2">
                  {/* Show regular nav links only for non-admins */}
                  {user?.role !== 'admin' && navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`py-3 px-4 rounded-xl transition-all duration-200 flex items-center ${
                        location.pathname === link.path
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 font-semibold shadow-sm'
                          : 'text-gray-700 active:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm">{link.label}</span>
                      {location.pathname === link.path && (
                        <motion.div
                          layoutId="mobile-nav-indicator"
                          className="ml-auto w-2 h-2 bg-green-600 rounded-full"
                        />
                      )}
                    </Link>
                  ))}
                  
                  {/* Admin Navigation Links */}
                  {isAuthenticated && user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`py-3 px-4 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                          location.pathname === '/admin/dashboard'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 font-semibold shadow-sm'
                            : 'text-gray-700 active:bg-gray-50'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Admin Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`py-3 px-4 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                          location.pathname === '/admin/orders'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 font-semibold shadow-sm'
                            : 'text-gray-700 active:bg-gray-50'
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        <span className="text-sm">Admin Orders</span>
                      </Link>
                    </>
                  )}
                  
                  {isAuthenticated && user?.role !== 'admin' && (
                    <>
                      <Link
                        to="/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`py-3 px-4 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                          location.pathname === '/orders'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 font-semibold shadow-sm'
                            : 'text-gray-700 active:bg-gray-50'
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        <span className="text-sm">{t('navbar.myOrders')}</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`py-3 px-4 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                          location.pathname === '/profile'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 font-semibold shadow-sm'
                            : 'text-gray-700 active:bg-gray-50'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">{t('navbar.profile')}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="py-3 px-4 rounded-xl transition-all duration-200 text-gray-700 active:bg-gray-50 flex items-center space-x-3 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">{t('common.logout')}</span>
                      </button>
                    </>
                  )}
                  
                  {isAuthenticated && user?.role === 'admin' && (
                    <button
                      onClick={handleLogout}
                      className="py-3 px-4 rounded-xl transition-all duration-200 text-gray-700 active:bg-gray-50 flex items-center space-x-3 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  )}
                  
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3 px-4 rounded-xl transition-all duration-200 text-gray-700 active:bg-gray-50 flex items-center space-x-3"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">{t('common.login')}</span>
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
