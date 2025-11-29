const Ad = require('../models/Ad');

// Escape regex special chars so the search query is treated as a plain string
const escapeRegex = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
      !duration.unit
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide title, description, platform, price, and duration (value & unit)'
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
    const { query = '' } = req.query || {};
    const filters = { isActive: true };

    if (query.trim()) {
      filters.title = {
        $regex: escapeRegex(query.trim()),
        $options: 'i'
      };
    }

    const ads = await Ad.find(filters)
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

exports.getDayAds = createDurationHandler('hour');
exports.getWeekAds = createDurationHandler('week');
exports.getMonthAds = createDurationHandler('month');
exports.getYearAds = createDurationHandler('year');

// @desc    Get ads for the current user
// @route   GET /users/ads/mine
// @access  Private
exports.getMyAds = async (req, res) => {
  try {
    const userId = req.user.id;
    const ads = await Ad.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('platform');

    res.status(200).json({
      success: true,
      data: ads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch your ads'
    });
  }
};

// @desc    Get a single ad owned by current user
// @route   GET /users/ads/:id
// @access  Private
exports.getMyAdById = async (req, res) => {
  try {
    const adId = req.params.id;
    const userId = req.user.id;

    const ad = await Ad.findOne({ _id: adId, user: userId }).populate('platform');

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

// @desc    Update an ad owned by current user
// @route   PUT /users/ads/:id
// @access  Private
exports.updateMyAd = async (req, res) => {
  try {
    const adId = req.params.id;
    const userId = req.user.id;
    const {
      title,
      description,
      platform,
      price,
      duration,
      contactEmail
    } = req.body || {};

    const ad = await Ad.findOne({ _id: adId, user: userId });
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    if (title !== undefined) ad.title = title;
    if (description !== undefined) ad.description = description;
    if (platform !== undefined) ad.platform = platform;
    if (price !== undefined) ad.price = price;

    if (duration) {
      if (duration.value === undefined || !duration.unit) {
        return res.status(400).json({
          success: false,
          message: 'Duration value and unit are required'
        });
      }
      ad.duration = {
        value: duration.value,
        unit: duration.unit
      };
    }

    if (contactEmail !== undefined) ad.contactEmail = contactEmail;

    ad.updatedBy = userId;
    await ad.save();

    res.status(200).json({
      success: true,
      message: 'Ad updated successfully',
      data: ad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update ad'
    });
  }
};

// @desc    Soft delete (deactivate) an ad owned by current user
// @route   DELETE /users/ads/:id
// @access  Private
exports.deactivateMyAd = async (req, res) => {
  try {
    const adId = req.params.id;
    const userId = req.user.id;

    const ad = await Ad.findOne({ _id: adId, user: userId });
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    ad.isActive = false;
    ad.updatedBy = userId;
    await ad.save();

    res.status(200).json({
      success: true,
      message: 'Ad deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to deactivate ad'
    });
  }
};

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
