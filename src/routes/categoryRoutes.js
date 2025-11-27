const express = require('express');
const router = express.Router();

const { addCategory, getCategories } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

router.post('/add', protect, addCategory);
router.get('/all', protect, getCategories);

module.exports = router;
