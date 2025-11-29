const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  verifyUserOtp,
  resendUserOtp
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verifyOtp', verifyUserOtp);
router.post('/resendOtp', resendUserOtp);

// Private routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
