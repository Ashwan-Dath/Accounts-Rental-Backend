const express = require('express');
const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
  verifyAdminOtp,
  resendAdminOtp,
  getAllUsers
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// POST /admin/register
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/verifyOtp', verifyAdminOtp);
router.post('/resendOtp', resendAdminOtp);
router.get('/users/all', protect, authorize('admin'), getAllUsers);

module.exports = router;
