const Category = require('../models/Category');

// @desc    Add a new category
// @route   POST /category/add
// @access  Private
exports.addCategory = async (req, res) => {
  try {
    const { category, platform } = req.body;

    if (!category || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both category and platform'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is invalid'
      });
    }

    const userId = req.user.id;

    const newCategory = await Category.create({
      category,
      platform,
      user: userId,
      createdBy: userId,
      updatedBy: userId
    });

    res.status(201).json({
      success: true,
      message: 'Category added successfully',
      data: newCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add category'
    });
  }
};

// @desc    Get paginated categories
// @route   GET /category/all
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    console.log('Fetching categories - Page:', page);
    

    const [categories, total] = await Promise.all([
      Category.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Category.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        pageSize: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories'
    });
  }
};

// @desc    Public endpoint to fetch all categories
// @route   GET /public/categories
// @access  Public
exports.getAllCategoriesPublic = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    console.log('Fetching all categories for public endpoint',categories);
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories'
    });
  }
};
