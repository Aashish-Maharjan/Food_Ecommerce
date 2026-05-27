const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number between 1 and 5'
    }
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['active', 'hidden', 'flagged', 'deleted'],
    default: 'active'
  },
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'other'],
      required: true
    },
    description: String,
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
reviewSchema.index({ food: 1, createdAt: -1 });
reviewSchema.index({ user: 1, food: 1 }, { unique: true });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ helpful: -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ review: 'text' });

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for time ago
reviewSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
});

// Pre-save middleware to update edited status
reviewSchema.pre('save', function(next) {
  if (this.isModified('review') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Pre-save middleware to update food rating
reviewSchema.post('save', async function() {
  try {
    const Food = mongoose.model('Food');
    const food = await Food.findById(this.food);
    
    if (food) {
      const reviews = await this.constructor.find({ 
        food: this.food, 
        status: 'active' 
      });
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      await Food.findByIdAndUpdate(this.food, {
        rating: Math.round(averageRating * 10) / 10,
        numReviews: reviews.length
      });
    }
  } catch (error) {
    console.error('Error updating food rating:', error);
  }
});

// Pre-remove middleware to update food rating
reviewSchema.pre('remove', async function() {
  try {
    const Food = mongoose.model('Food');
    const food = await Food.findById(this.food);
    
    if (food) {
      const reviews = await this.constructor.find({ 
        food: this.food, 
        status: 'active' 
      }).where('_id').ne(this._id);
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      await Food.findByIdAndUpdate(this.food, {
        rating: Math.round(averageRating * 10) / 10,
        numReviews: reviews.length
      });
    }
  } catch (error) {
    console.error('Error updating food rating after removal:', error);
  }
});

// Instance method to mark review as helpful
reviewSchema.methods.markHelpful = async function(userId) {
  // Check if user already marked as helpful
  const hasMarked = this.helpfulUsers.some(id => id.toString() === userId.toString());
  
  if (hasMarked) {
    // Remove helpful vote
    this.helpfulUsers = this.helpfulUsers.filter(id => id.toString() !== userId.toString());
    this.helpful = Math.max(0, this.helpful - 1);
  } else {
    // Add helpful vote
    this.helpfulUsers.push(userId);
    this.helpful += 1;
  }
  
  return await this.save();
};

// Instance method to flag review
reviewSchema.methods.flagReview = async function(userId, reason, description) {
  const existingFlag = this.flags.find(flag => flag.user.equals(userId));
  
  if (existingFlag) {
    // Update existing flag
    existingFlag.reason = reason;
    existingFlag.description = description;
    existingFlag.flaggedAt = new Date();
  } else {
    // Add new flag
    this.flags.push({
      user: userId,
      reason,
      description
    });
  }
  
  // Check if review should be hidden due to multiple flags
  if (this.flags.length >= 3) {
    this.status = 'flagged';
  }
  
  return await this.save();
};

// Static method to get review statistics for a food item
reviewSchema.statics.getFoodReviewStats = async function(foodId) {
  const stats = await this.aggregate([
    { $match: { food: mongoose.Types.ObjectId(foodId), status: 'active' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        totalHelpful: { $sum: '$helpful' }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      totalHelpful: 0
    };
  }
  
  const stat = stats[0];
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  stat.ratingDistribution.forEach(rating => {
    ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
  });
  
  return {
    totalReviews: stat.totalReviews,
    averageRating: Math.round(stat.averageRating * 10) / 10,
    ratingDistribution,
    totalHelpful: stat.totalHelpful
  };
};

// Static method to get reviews with pagination and filtering
reviewSchema.statics.getFoodReviews = async function(foodId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'newest',
    rating = null,
    verified = null
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Build match criteria
  const matchCriteria = { food: foodId, status: 'active' };
  if (rating) matchCriteria.rating = rating;
  if (verified !== null) matchCriteria.isVerified = verified;
  
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
  
  const reviews = await this.find(matchCriteria)
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstName lastName avatar')
    .populate('food', 'name category image');
  
  const total = await this.countDocuments(matchCriteria);
  
  return {
    reviews,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
};

module.exports = mongoose.model('Review', reviewSchema);
