const express = require('express');
const router = express.Router();

const { getAllCategoriesPublic } = require('../controllers/categoryController');
const { getAllAdsPublic } = require('../controllers/adController');

router.get('/categories', getAllCategoriesPublic);
router.get('/allAds', getAllAdsPublic);

module.exports = router;
