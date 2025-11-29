const express = require('express');
const router = express.Router();

const { register, login, getMe, updateProfile } = require('../controllers/authController');
const {
  postAd,
  getMyAds,
  getMyAdById,
  updateMyAd,
  deactivateMyAd
} = require('../controllers/adController');
const { protect } = require('../middleware/auth');

// User-specific routes mounted at /users/*
router.post('/register', register);
router.post('/login', login);
router.post('/postAd', protect, postAd);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.get('/ads/mine', protect, getMyAds);
router.get('/ads/:id', protect, getMyAdById);
router.put('/ads/:id', protect, updateMyAd);
router.delete('/ads/:id', protect, deactivateMyAd);

module.exports = router;
