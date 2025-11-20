const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');

// All profile routes require authentication
router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;

