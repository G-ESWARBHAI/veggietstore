import { LayoutDashboard, ShoppingBag, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const AdminBottomNavigation = ({ onAddProductClick }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/admin/dashboard',
      label: t('admin.dashboard'),
      icon: LayoutDashboard,
    },
    {
      path: '/admin/orders',
      label: t('admin.orders'),
      icon: ShoppingBag,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden safe-area-inset-bottom">
      <div className="grid grid-cols-3 h-16 max-w-screen-sm mx-auto">
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
        
        {/* Add Product Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAddProductClick}
          className="flex flex-col items-center justify-center relative transition-all duration-200 text-green-600 active:scale-95"
        >
          <div className="relative">
            <div className="bg-green-500 rounded-full p-2.5">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-[10px] font-semibold mt-0.5 leading-tight text-green-600 font-bold">
            {t('admin.addProduct')}
          </span>
        </motion.button>
      </div>
    </nav>
  );
};

export default AdminBottomNavigation;

