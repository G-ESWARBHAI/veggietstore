// @desc    Get payment configuration (UPI ID, etc.)
// @route   GET /api/payment/config
// @access  Public
const getPaymentConfig = async (req, res) => {
  try {
    const upiId = process.env.UPI_ID || null;
    
    res.status(200).json({
      success: true,
      data: {
        upiId: upiId,
        hasUpiId: !!upiId
      }
    });
  } catch (error) {
    console.error('Get payment config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment configuration'
    });
  }
};

module.exports = {
  getPaymentConfig
};



