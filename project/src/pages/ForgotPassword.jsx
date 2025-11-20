import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Leaf, CheckCircle, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [step, setStep] = useState(token ? 'reset' : 'request'); // 'request' or 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { forgotPassword, resetPassword, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
    if (token) {
      setStep('reset');
    }
  }, [token, clearError]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setErrors({});

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Email is invalid' });
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      setIsSubmitted(true);
    }
  };

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
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-24 pb-16 flex items-center justify-center relative overflow-hidden">
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {step === 'request' ? 'Forgot Password?' : 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {step === 'request'
                ? 'Enter your email to receive a password reset link'
                : 'Enter your new password'}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-10"
          >
            {step === 'request' ? (
              <>
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
                      className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                    >
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">
                      Email Sent!
                    </h3>
                    <p className="text-gray-700 mb-4">
                      If that email exists, a password reset link has been sent to your inbox.
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Link>
                  </motion.div>
                ) : (
                  <form onSubmit={handleRequestSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: '' });
                          }}
                          required
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                            errors.email
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="john@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </motion.button>
                  </form>
                )}
              </>
            ) : (
              <>
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
                      className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                    >
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">
                      Password Reset!
                    </h3>
                    <p className="text-gray-700">Redirecting to login...</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: '' });
                          }}
                          required
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                            errors.password
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                          }}
                          required
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                            errors.confirmPassword
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </motion.button>
                  </form>
                )}
              </>
            )}

            {!isSubmitted && (
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors"
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

export default ForgotPassword;

