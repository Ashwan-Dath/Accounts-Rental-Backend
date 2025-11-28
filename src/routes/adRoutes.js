const express = require('express');
const router = express.Router();

const { getAdById, getAdDetailsById } = require('../controllers/adController');
const { protect } = require('../middleware/auth');

router.post('/getAdbyId', getAdById);
router.post('/getDetailsById', protect, getAdDetailsById);

module.exports = router;
