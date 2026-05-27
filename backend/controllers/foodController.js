const Food = require('../models/Food');

// @desc    Get all foods with search, filtering, and pagination
// @route   GET /api/foods
// @access  Public
exports.getFoods = async (req, res) => {
  try {
    const {
      search,
      category,
      cuisine,
      minPrice,
      maxPrice,
      spiceLevel,
      featured,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = { availability: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (cuisine) {
      filter.cuisine = cuisine;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (spiceLevel) {
      filter.spiceLevel = spiceLevel;
    }

    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const foods = await Food.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Food.countDocuments(filter);

    // Get unique categories and cuisines for filters
    const categories = await Food.distinct('category');
    const cuisines = await Food.distinct('cuisine');

    res.json({
      foods,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        categories,
        cuisines
      }
    });
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({
      message: 'Server error while fetching foods'
    });
  }
};

// @desc    Get single food by ID
// @route   GET /api/foods/:id
// @access  Public
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    console.error('Get food by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching food'
    });
  }
};

// @desc    Create new food item
// @route   POST /api/foods
// @access  Private (Admin only)
exports.createFood = async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();

    res.status(201).json({
      message: 'Food item created successfully',
      food
    });
  } catch (error) {
    console.error('Create food error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      message: 'Server error while creating food'
    });
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private (Admin only)
exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!food) {
      return res.status(404).json({
        message: 'Food item not found'
      });
    }

    res.json({
      message: 'Food item updated successfully',
      food
    });
  } catch (error) {
    console.error('Update food error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      message: 'Server error while updating food'
    });
  }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private (Admin only)
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: 'Food item not found'
      });
    }

    res.json({
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({
      message: 'Server error while deleting food'
    });
  }
};

// @desc    Get featured foods
// @route   GET /api/foods/featured
// @access  Public
exports.getFeaturedFoods = async (req, res) => {
  try {
    const foods = await Food.find({ featured: true, availability: true })
      .limit(6)
      .select('-__v');

    res.json(foods);
  } catch (error) {
    console.error('Get featured foods error:', error);
    res.status(500).json({
      message: 'Server error while fetching featured foods'
    });
  }
};

// @desc    Get foods by category
// @route   GET /api/foods/category/:category
// @access  Public
exports.getFoodsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const foods = await Food.find({ 
      category, 
      availability: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Food.countDocuments({ category, availability: true });

    res.json({
      foods,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get foods by category error:', error);
    res.status(500).json({
      message: 'Server error while fetching foods by category'
    });
  }
};
