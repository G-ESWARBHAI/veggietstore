import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Lock, Save, Edit2 } from 'lucide-react';
import { profileAPI } from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await profileAPI.getProfile();
      if (response.success && response.data) {
        const data = response.data;
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            zipCode: data.address?.zipCode || '',
            country: data.address?.country || ''
          }
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await profileAPI.updateProfile(profileData);
      if (response.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        await checkAuth(); // Refresh user data
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await profileAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      if (response.success) {
        toast.success('Password changed successfully!');
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profileData.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account information and preferences
          </p>
        </motion.div>

        {/* Profile Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <User className="w-6 h-6 text-green-600" />
              <span>Personal Information</span>
            </h2>
            {!isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </motion.button>
            )}
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    isEditing
                      ? 'border-gray-200 focus:border-green-500'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    isEditing
                      ? 'border-gray-200 focus:border-green-500'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                  placeholder="+1 234 567 8900"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Date of Birth</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profileData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    isEditing
                      ? 'border-gray-200 focus:border-green-500'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>Address</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    value={profileData.address.street}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      isEditing
                        ? 'border-gray-200 focus:border-green-500'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                    }`}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={profileData.address.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      isEditing
                        ? 'border-gray-200 focus:border-green-500'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                    }`}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={profileData.address.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      isEditing
                        ? 'border-gray-200 focus:border-green-500'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                    }`}
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Zip Code</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={profileData.address.zipCode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      isEditing
                        ? 'border-gray-200 focus:border-green-500'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={profileData.address.country}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      isEditing
                        ? 'border-gray-200 focus:border-green-500'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                    }`}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile(); // Reset form
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </motion.button>
              </div>
            )}
          </form>
        </motion.div>

        {/* Change Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <Lock className="w-6 h-6 text-green-600" />
              <span>Change Password</span>
            </h2>
            {!isChangingPassword && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Change</span>
              </motion.button>
            )}
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Lock className="w-5 h-5" />
                  <span>{isLoading ? 'Changing...' : 'Change Password'}</span>
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;

