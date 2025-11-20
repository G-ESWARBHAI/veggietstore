import { Home, ShoppingBag, ShoppingCart, User, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import useAuthStore from '../store/authStore';

const BottomNavigation = () => {
  const location = useLocation();
  const { getCartCount } = useCart();
  const { isAuthenticated, user } = useAuthStore();
  const cartCount = getCartCount();

  // Hide bottom nav on auth pages, admin pages, checkout, and for admin users
  const hideNavPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/admin',
    '/checkout',
  ];

  const shouldHide = hideNavPaths.some((path) => location.pathname.startsWith(path)) || user?.role === 'admin';

  if (shouldHide) {
    return null;
  }

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
    },
    {
      path: '/shop',
      label: 'Shop',
      icon: ShoppingBag,
    },
    {
      path: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      path: isAuthenticated ? '/orders' : '/login',
      label: isAuthenticated ? 'Orders' : 'Login',
      icon: isAuthenticated ? Package : User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden safe-area-inset-bottom">
      <div className="grid grid-cols-4 h-16 max-w-screen-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center relative transition-all duration-200 active:scale-95 ${
                active
                  ? 'text-green-600'
                  : 'text-gray-500 active:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-all duration-200 ${
                    active 
                      ? 'scale-110' 
                      : ''
                  }`} 
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md border-2 border-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 leading-tight ${
                active 
                  ? 'text-green-600 font-bold' 
                  : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;

