import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Upload, CheckCircle, ArrowLeft, MapPin, Phone, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ordersAPI, paymentAPI } from '../utils/api';
import { profileAPI } from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: ''
  });
  const [qrCodeBase64, setQrCodeBase64] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Load user profile for shipping address
    loadProfile();
    
    // Load payment config (UPI ID) from backend
    loadPaymentConfig();
  }, [isAuthenticated, cartItems.length, navigate]);

  const loadPaymentConfig = async () => {
    try {
      const response = await paymentAPI.getPaymentConfig();
      if (response.success && response.data?.upiId) {
        setPaymentDetails({ upiId: response.data.upiId });
      }
    } catch (error) {
      console.error('Failed to load payment config:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      if (response.success && response.data) {
        const profile = response.data;
        setShippingAddress({
          name: profile.name || '',
          phone: profile.phone || '',
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          zipCode: profile.address?.zipCode || '',
          country: profile.address?.country || 'India'
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  // Calculate totals
  const totalAmount = getCartTotal();
  const tax = totalAmount * 0.1;
  const finalTotal = totalAmount + tax;

  // Generate QR code when manual payment is selected or UPI ID changes
  useEffect(() => {
    if (paymentMethod === 'manual_payment' && cartItems.length > 0) {
      generateQRCode();
    } else {
      setQrCodeBase64(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, totalAmount, cartItems.length, paymentDetails.upiId]);

  const generateQRCode = async () => {
    try {
      // Calculate current total
      const currentTotal = getCartTotal();
      const currentTax = currentTotal * 0.1;
      const currentFinalTotal = currentTotal + currentTax;
      
      // Get UPI ID from payment details
      const upiId = paymentDetails?.upiId?.trim();
      
      // Validate UPI ID format
      if (!upiId || !upiId.includes('@')) {
        console.warn('⚠️ Valid UPI ID required. Please enter your UPI ID (e.g., yourname@paytm)');
        setQrCodeBase64(null);
        return;
      }
      
      // Validate UPI ID format (should contain @ and be valid)
      const upiIdPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiIdPattern.test(upiId)) {
        console.warn('⚠️ Invalid UPI ID format. Please use format: yourname@paytm or yourname@ybl');
        setQrCodeBase64(null);
        return;
      }
      
      // Create UPI payment string with proper encoding
      // Format: upi://pay?pa=<UPI_ID>&am=<AMOUNT>&cu=INR&tn=<NOTE>
      const transactionNote = `VeggieStore-${Date.now()}`;
      const upiPaymentString = `upi://pay?pa=${encodeURIComponent(upiId)}&am=${currentFinalTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      
      console.log('🔍 Generating QR code:', {
        upiId,
        amount: currentFinalTotal,
        upiString: upiPaymentString
      });
      
      // Generate QR code on the frontend
      const QRCode = (await import('qrcode')).default;
      
      const qrDataUrl = await QRCode.toDataURL(upiPaymentString, {
        errorCorrectionLevel: 'M', // Changed from 'H' to 'M' for better compatibility
        type: 'image/png',
        width: 400, // Increased size for better scanning
        margin: 2, // Increased margin
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      if (qrDataUrl) {
        console.log('✅ QR code generated successfully');
        setQrCodeBase64(qrDataUrl);
      } else {
        console.error('❌ QR code generation returned null');
        setQrCodeBase64(null);
      }
    } catch (error) {
      console.error('❌ Failed to generate QR code:', error);
      setQrCodeBase64(null);
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateOrder = async () => {
    if (paymentMethod === 'cod' && (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.street)) {
      toast.error('Please fill in all required shipping address fields');
      return;
    }

    if (paymentMethod === 'manual_payment' && (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.street)) {
      toast.error('Please fill in all required shipping address fields');
      return;
    }

    setIsLoading(true);
    try {
      const orderPayload = {
        paymentMethod,
        shippingAddress,
        paymentDetails: paymentMethod === 'manual_payment' ? {
          ...paymentDetails,
          // Use the frontend-generated QR code if available, backend will generate its own
        } : {}
      };

      console.log('📦 Creating order...');
      const response = await ordersAPI.createOrder(orderPayload);
      
      if (response.success) {
        console.log('✅ Order created:', response.data);
        console.log('   Order ID:', response.data._id);
        console.log('   QR Code present:', !!response.data.qrCode);
        console.log('   QR Code length:', response.data.qrCode?.length);
        
        setOrderData(response.data);
        setOrderCreated(true);
        clearCart();
        
        // If screenshot was uploaded before order creation, upload it now
        if (paymentMethod === 'manual_payment' && screenshotFile && response.data._id) {
          console.log('📸 Screenshot file found, uploading automatically...');
          try {
            const uploadResponse = await ordersAPI.uploadPaymentScreenshot(response.data._id, screenshotFile);
            
            if (uploadResponse.success) {
              console.log('✅ Screenshot uploaded automatically after order creation');
              console.log('   Screenshot URL:', uploadResponse.data.paymentScreenshot);
              
              // Update order data with the uploaded screenshot
              setOrderData({
                ...response.data,
                paymentScreenshot: uploadResponse.data.paymentScreenshot
              });
              
              // Clear the file input
              setScreenshotFile(null);
              setScreenshotPreview(null);
              
              toast.success('Order created and payment screenshot uploaded successfully!');
            } else {
              console.warn('⚠️  Screenshot upload failed, but order was created');
              toast.success('Order created successfully! You can upload the screenshot later.');
            }
          } catch (uploadError) {
            console.error('❌ Error uploading screenshot automatically:', uploadError);
            // Don't fail the order creation if screenshot upload fails
            toast.success('Order created successfully! You can upload the screenshot below.');
          }
        } else {
          toast.success('Order created successfully!');
        }
      }
    } catch (error) {
      console.error('❌ Order creation error:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadScreenshot = async () => {
    if (!screenshotFile) {
      toast.error('Please select a payment screenshot');
      return;
    }

    if (!orderData || !orderData._id) {
      toast.error('Order ID is missing. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('📤 Uploading payment screenshot...');
      console.log('   Order ID:', orderData._id);
      console.log('   File name:', screenshotFile.name);
      console.log('   File size:', screenshotFile.size, 'bytes');
      console.log('   File type:', screenshotFile.type);

      const response = await ordersAPI.uploadPaymentScreenshot(orderData._id, screenshotFile);
      
      console.log('📥 Upload response:', response);
      
      if (response.success) {
        console.log('✅ Screenshot uploaded successfully');
        console.log('   Screenshot URL:', response.data.paymentScreenshot);
        
        toast.success('Payment screenshot uploaded successfully!');
        
        // Update local state with the new screenshot URL
        setOrderData({
          ...orderData,
          paymentScreenshot: response.data.paymentScreenshot
        });
        
        // Clear the file input
        setScreenshotFile(null);
        setScreenshotPreview(null);
      } else {
        console.error('❌ Upload failed:', response.message);
        toast.error(response.message || 'Failed to upload screenshot');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('   Error message:', error.message);
      toast.error(error.message || 'Failed to upload screenshot');
    } finally {
      setIsLoading(false);
    }
  };

  if (orderCreated && orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Order ID: <span className="font-semibold text-green-600">#{orderData._id.slice(-8).toUpperCase()}</span>
            </p>

            {orderData.paymentMethod === 'manual_payment' && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Complete Your Payment</h3>
                
                {orderData.qrCode ? (
                  <div className="mb-6">
                    <p className="text-gray-700 mb-4 text-center font-semibold">
                      Scan this QR code to pay ₹{finalTotal.toFixed(2)}
                    </p>
                    <div className="flex justify-center mb-4">
                      <img 
                        src={orderData.qrCode} 
                        alt="Payment QR Code" 
                        className="w-64 h-64 border-4 border-green-500 rounded-xl shadow-lg bg-white p-2"
                        onError={(e) => {
                          console.error('QR code image failed to load');
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Or send ₹{finalTotal.toFixed(2)} to your UPI ID manually
                    </p>
                  </div>
                ) : (
                  <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                    <p className="text-yellow-800 font-semibold mb-2">⚠️ QR Code Not Available</p>
                    <p className="text-sm text-yellow-700">
                      Please make a manual payment of ₹{finalTotal.toFixed(2)} to complete your order.
                      Upload the payment screenshot below.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {!orderData.paymentScreenshot ? (
                    <>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Upload Payment Screenshot
                        </label>
                        <div className="flex flex-col items-center space-y-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotChange}
                            className="hidden"
                            id="screenshot-upload"
                          />
                          <label
                            htmlFor="screenshot-upload"
                            className="cursor-pointer bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
                          >
                            <Upload className="w-5 h-5" />
                            <span>Choose Screenshot</span>
                          </label>
                          {screenshotPreview && (
                            <div className="mt-4">
                              <img
                                src={screenshotPreview}
                                alt="Screenshot preview"
                                className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
                              />
                            </div>
                          )}
                          {screenshotFile && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleUploadScreenshot}
                              disabled={isLoading}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                            >
                              {isLoading ? 'Uploading...' : 'Upload Screenshot'}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
                      <p className="text-green-700 font-semibold mb-2">✓ Payment Screenshot Uploaded</p>
                      <p className="text-sm text-gray-600">
                        Your order is pending payment confirmation. We'll verify and confirm your payment soon!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {orderData.paymentMethod === 'cod' && (
              <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6 mb-8">
                <p className="text-blue-700 font-semibold">
                  💵 Cash on Delivery
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Please keep ₹{finalTotal.toFixed(2)} ready for delivery
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/orders')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                View My Orders
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/shop')}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate('/cart')}
          className="flex items-center space-x-2 text-gray-700 hover:text-green-600 mb-8 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Cart</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-green-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-green-600" />
                      <span className="text-lg font-semibold text-gray-800">Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Pay when you receive your order</p>
                  </div>
                </label>

                <label className="flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="manual_payment"
                    checked={paymentMethod === 'manual_payment'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-green-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <QrCode className="w-6 h-6 text-green-600" />
                      <span className="text-lg font-semibold text-gray-800">Manual Payment (UPI/Bank Transfer)</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Scan QR code and upload payment screenshot</p>
                  </div>
                </label>
              </div>

              {/* Show QR Code when Manual Payment is selected */}
              {paymentMethod === 'manual_payment' && (
                <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Payment QR Code</h3>
                  
                  {/* UPI ID Input (Required) */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      UPI ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.upiId}
                      onChange={(e) => {
                        setPaymentDetails({ ...paymentDetails, upiId: e.target.value });
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-sm"
                      placeholder="yourname@paytm or yourname@ybl"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your UPI ID (e.g., yourname@paytm, yourname@ybl, yourname@phonepe)
                    </p>
                    {paymentDetails.upiId && !paymentDetails.upiId.includes('@') && (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ Invalid format. UPI ID must contain @ symbol
                      </p>
                    )}
                  </div>

                  {!paymentDetails.upiId || !paymentDetails.upiId.includes('@') ? (
                    <div className="text-center py-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                      <p className="text-yellow-800 font-semibold mb-2">⚠️ UPI ID Required</p>
                      <p className="text-sm text-yellow-700">
                        Please enter a valid UPI ID above to generate the payment QR code
                      </p>
                    </div>
                  ) : qrCodeBase64 ? (
                    <div className="space-y-4">
                      <p className="text-gray-700 text-center font-semibold">
                        Scan this QR code to pay ₹{finalTotal.toFixed(2)}
                      </p>
                      <div className="flex justify-center">
                        <img 
                          src={qrCodeBase64} 
                          alt="Payment QR Code" 
                          className="w-72 h-72 border-4 border-green-500 rounded-xl shadow-lg bg-white p-3"
                          onError={(e) => {
                            console.error('QR code image failed to load');
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                        <p className="text-sm text-blue-800 font-semibold mb-1">💡 How to pay:</p>
                        <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
                          <li>Open your UPI app (PhonePe, Paytm, Google Pay, etc.)</li>
                          <li>Scan this QR code</li>
                          <li>Enter the amount: ₹{finalTotal.toFixed(2)}</li>
                          <li>Complete the payment</li>
                          <li>Upload the payment screenshot below</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mb-2"></div>
                      <p className="text-sm text-gray-600">Generating QR code...</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Payment Screenshot Upload - Show when Manual Payment is selected */}
            {paymentMethod === 'manual_payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Upload className="w-6 h-6 text-green-600" />
                  <span>Payment Screenshot (Optional)</span>
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  You can upload the payment screenshot now or after placing the order
                </p>
                <div className="flex flex-col items-center space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="hidden"
                    id="screenshot-upload-checkout"
                  />
                  <label
                    htmlFor="screenshot-upload-checkout"
                    className="cursor-pointer bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choose Payment Screenshot</span>
                  </label>
                  {screenshotPreview && (
                    <div className="mt-4">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot preview"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-green-600" />
                <span>Shipping Address</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={shippingAddress.name}
                      onChange={handleAddressChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    placeholder="Maharashtra"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    placeholder="400001"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    placeholder="India"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span className="font-semibold">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="text-xl font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateOrder}
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

