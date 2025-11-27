const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const { postAd } = require('../controllers/adController');
const { protect } = require('../middleware/auth');

// User-specific routes mounted at /users/*
router.post('/register', register);
router.post('/login', login);
router.post('/postAd', protect, postAd);

module.exports = router;

