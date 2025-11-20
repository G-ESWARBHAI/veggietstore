import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Leaf, CheckCircle, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/forgot-password');
    }
  }, [token, clearError, navigate]);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await resetPassword(token, password);
    if (result.success) {
      setIsSubmitted(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      toast.error(result.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20 md:pt-24 pb-16 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-400/30 to-green-500/30 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center space-x-2 mb-6">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-3 rounded-full">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                VeggieShop
              </span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Enter your new password
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full mb-4"
                >
                  <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold text-green-600 mb-2">
                  Password Reset!
                </h3>
                <p className="text-gray-700 text-sm md:text-base">Redirecting to login...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-5 md:space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      required
                      className={`w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.password
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs md:text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                      }}
                      required
                      className={`w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.confirmPassword
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs md:text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-full font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </motion.button>
              </form>
            )}

            {!isSubmitted && (
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors text-sm md:text-base"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;

