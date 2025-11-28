const express = require('express');
const router = express.Router();

const { getAllCategoriesPublic } = require('../controllers/categoryController');
const {
  getAllAdsPublic,
  getDayAds,
  getWeekAds,
  getMonthAds,
  getYearAds
} = require('../controllers/adController');

router.get('/categories', getAllCategoriesPublic);
router.get('/allAds', getAllAdsPublic);
router.get('/dayAds', getDayAds);
router.get('/weekAds', getWeekAds);
router.get('/monthAds', getMonthAds);
router.get('/yearAds', getYearAds);

module.exports = router;
