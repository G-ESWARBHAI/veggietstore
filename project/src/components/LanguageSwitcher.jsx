import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-1.5 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Change Language"
      >
        <Globe className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        <span className="text-xs md:text-sm font-semibold text-gray-700 hidden md:inline">
          {currentLanguage.nativeName}
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl ${
              i18n.language === lang.code
                ? 'bg-green-50 text-green-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{lang.nativeName}</span>
              {i18n.language === lang.code && (
                <span className="text-green-600">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;

