const Review = require('../models/Review');
const Food = require('../models/Food');
const { validationResult } = require('express-validator');

// Get reviews for a specific food item
exports.getFoodReviews = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { page = 1, limit = 10, sortBy = 'newest', rating, verified } = req.query;

    // Validate food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      rating: rating ? parseInt(rating) : null,
      verified: verified === 'true' ? true : verified === 'false' ? false : null
    };

    const result = await Review.getFoodReviews(foodId, options);

    res.json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
      food: {
        _id: food._id,
        name: food.name,
        category: food.category,
        image: food.image
      }
    });
  } catch (error) {
    console.error('Error fetching food reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
};

// Get review statistics for a food item
exports.getFoodReviewStats = async (req, res) => {
  try {
    const { foodId } = req.params;

    // Validate food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const stats = await Review.getFoodReviewStats(foodId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch review statistics',
      error: error.message 
    });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { foodId, rating, review, tags } = req.body;
    const userId = req.user._id;

    // Check if food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ 
        success: false,
        message: 'Food item not found' 
      });
    }

    // Check if user already reviewed this food
    const existingReview = await Review.findOne({ user: userId, food: foodId });
    if (existingReview) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already reviewed this food item' 
      });
    }

    // Create new review
    const newReview = new Review({
      user: userId,
      food: foodId,
      rating: parseInt(rating),
      review: review.trim(),
      tags: tags || [],
      isVerified: req.user.role === 'admin' // Auto-verify admin reviews
    });

    await newReview.save();

    // Populate user and food details
    await newReview.populate('user', 'firstName lastName avatar');
    await newReview.populate('food', 'name category image');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already reviewed this food item' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to create review',
      error: error.message 
    });
  }
};

// Update an existing review
exports.updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { reviewId } = req.params;
    const { rating, review, tags } = req.body;
    const userId = req.user._id;

    // Find the review
    const existingReview = await Review.findById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found' 
      });
    }

    // Check if user owns the review or is admin
    if (!existingReview.user.equals(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'You can only edit your own reviews' 
      });
    }

    // Update review fields
    if (rating !== undefined) existingReview.rating = parseInt(rating);
    if (review !== undefined) existingReview.review = review.trim();
    if (tags !== undefined) existingReview.tags = tags;

    await existingReview.save();

    // Populate user and food details
    await existingReview.populate('user', 'firstName lastName avatar');
    await existingReview.populate('food', 'name category image');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: existingReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update review',
      error: error.message 
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found' 
      });
    }

    // Check if user owns the review or is admin
    if (!review.user.equals(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'You can only delete your own reviews' 
      });
    }

    // Soft delete for regular users, hard delete for admins
    if (req.user.role === 'admin') {
      await review.remove();
    } else {
      review.status = 'deleted';
      await review.save();
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete review',
      error: error.message 
    });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found' 
      });
    }

    // Check if review is active
    if (review.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot mark inactive review as helpful' 
      });
    }

    // Toggle helpful status
    await review.markHelpful(userId);

    // Check if user marked as helpful
    const isHelpful = review.helpfulUsers.some(id => id.toString() === userId.toString());
    
    res.json({
      success: true,
      message: 'Review helpful status updated',
      data: {
        helpful: review.helpful,
        isHelpful
      }
    });
  } catch (error) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update helpful status',
      error: error.message 
    });
  }
};

// Flag a review
exports.flagReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { reviewId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user._id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found' 
      });
    }

    // Check if review is active
    if (review.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot flag inactive review' 
      });
    }

    // Check if user already flagged this review
    const existingFlag = review.flags.find(flag => flag.user.equals(userId));
    if (existingFlag) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already flagged this review' 
      });
    }

    // Flag the review
    await review.flagReview(userId, reason, description);

    res.json({
      success: true,
      message: 'Review flagged successfully',
      data: {
        status: review.status,
        flagCount: review.flags.length
      }
    });
  } catch (error) {
    console.error('Error flagging review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to flag review',
      error: error.message 
    });
  }
};

// Get all public reviews (for Reviews page)
exports.getPublicReviews = async (req, res) => {
  try {
    console.log('=== getPublicReviews CALLED ===');
    console.log('Query params:', req.query);
    console.log('Request path:', req.path);
    console.log('Request originalUrl:', req.originalUrl);
    const { page = 1, limit = 20, sortBy = 'newest', rating, verified } = req.query;

    // Build match criteria - only active reviews
    const matchCriteria = { status: 'active' };
    if (rating) matchCriteria.rating = parseInt(rating);
    if (verified === 'true') matchCriteria.isVerified = true;

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'highest-rating':
        sortCriteria = { rating: -1, createdAt: -1 };
        break;
      case 'lowest-rating':
        sortCriteria = { rating: 1, createdAt: -1 };
        break;
      case 'most-helpful':
        sortCriteria = { helpful: -1, createdAt: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(matchCriteria)
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName avatar')
      .populate('food', 'name category image');

    const total = await Review.countDocuments(matchCriteria);

    console.log(`Found ${reviews.length} reviews out of ${total} total`);
    
    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReviews: total,
        hasNextPage: parseInt(page) * parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
};

// Get all reviews (admin only)
exports.getAllReviews = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    const { page = 1, limit = 20, status, sortBy = 'newest' } = req.query;

    // Build match criteria
    const matchCriteria = {};
    if (status) matchCriteria.status = status;

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'highest-rating':
        sortCriteria = { rating: -1, createdAt: -1 };
        break;
      case 'lowest-rating':
        sortCriteria = { rating: 1, createdAt: -1 };
        break;
      case 'most-helpful':
        sortCriteria = { helpful: -1, createdAt: -1 };
        break;
      case 'most-flagged':
        sortCriteria = { 'flags.length': -1, createdAt: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(matchCriteria)
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName email')
      .populate('food', 'name category');

    const total = await Review.countDocuments(matchCriteria);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReviews: total,
        hasNextPage: parseInt(page) * parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
};

// Update review status (admin only)
exports.updateReviewStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    const { reviewId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'hidden', 'flagged', 'deleted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status value' 
      });
    }

    // Find and update review
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    ).populate('user', 'firstName lastName email')
     .populate('food', 'name category');

    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found' 
      });
    }

    res.json({
      success: true,
      message: 'Review status updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update review status',
      error: error.message 
    });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('food', 'name category image');

    const total = await Review.countDocuments({ user: userId });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReviews: total,
        hasNextPage: parseInt(page) * parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user reviews',
      error: error.message 
    });
  }
};
