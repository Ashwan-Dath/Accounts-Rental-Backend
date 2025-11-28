const Ad = require('../models/Ad');

// @desc    Post a new ad
// @route   POST /users/postAd
// @access  Private (User)
exports.postAd = async (req, res) => {
  try {
    const { title, description, platform, price, duration, contactEmail } =
      req.body || {};

    if (
      !title ||
      !description ||
      !platform ||
      price === undefined ||
      !duration ||
      duration.value === undefined ||
      !duration.unit ||
      !contactEmail
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide title, description, platform, price, duration (value & unit), and contactEmail'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is invalid'
      });
    }

    const userId = req.user.id;

    const ad = await Ad.create({
      title,
      description,
      platform,
      price,
      duration: {
        value: duration.value,
        unit: duration.unit
      },
      contactEmail,
      user: userId,
      createdBy: userId,
      updatedBy: userId
    });

    res.status(201).json({
      success: true,
      message: 'Ad posted successfully',
      data: ad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to post ad'
    });
  }
};

// @desc    Public endpoint to fetch all ads
// @route   GET /public/allAds
// @access  Public
exports.getAllAdsPublic = async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('platform')
      .populate('user', '-password');

    res.status(200).json({
      success: true,
      data: ads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch ads'
    });
  }
};

const fetchLatestAdsByDuration = async (unit) => {
  return Ad.find({
    isActive: true,
    'duration.unit': unit
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .populate('platform')
    .populate('user', '-password');
};

const createDurationHandler = (unit) => async (req, res) => {
  try {
    const ads = await fetchLatestAdsByDuration(unit);
    res.status(200).json({
      success: true,
      data: ads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || `Failed to fetch ${unit} ads`
    });
  }
};

exports.getDayAds = createDurationHandler('day');
exports.getWeekAds = createDurationHandler('week');
exports.getMonthAds = createDurationHandler('month');
exports.getYearAds = createDurationHandler('year');

// @desc    Get ad by ID
// @route   POST /ads/getAdbyId
// @access  Public
exports.getAdById = async (req, res) => {
  try {
    const { adId } = req.body || {};

    if (!adId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide adId'
      });
    }

    const ad = await Ad.findById(adId)
      .populate('platform')
      .populate('user', '-password');

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch ad'
    });
  }
};

// @desc    Get ad poster details by ad ID
// @route   POST /ads/getDetailsById
// @access  Public
exports.getAdDetailsById = async (req, res) => {
  try {
    const { adId } = req.body || {};

    if (!adId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide adId'
      });
    }

    const ad = await Ad.findById(adId)
      .populate('platform')
      .populate('user', '-password');

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    if (!ad.user) {
      return res.status(404).json({
        success: false,
        message: 'Ad owner not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ad,
        poster: {
          firstName: ad.user.firstName,
          lastName: ad.user.lastName,
          email: ad.user.email,
          phone: ad.user.phone,
          address: ad.user.address,
          city: ad.user.city,
          state: ad.user.state,
          zipCode: ad.user.zipCode
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch ad details'
    });
  }
};
