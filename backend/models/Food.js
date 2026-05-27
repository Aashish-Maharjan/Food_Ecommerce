const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Snacks', 'Breakfast', 'Lunch', 'Dinner'],
    default: 'Main Course'
  },
  cuisine: { 
    type: String, 
    required: true,
    trim: true
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  description: { 
    type: String,
    required: true,
    trim: true
  },
  ingredients: [String],
  spiceLevel: { 
    type: String, 
    enum: ['Mild', 'Medium', 'Spicy'], 
    default: 'Medium' 
  },
  prepTime: { 
    type: Number,
    min: 0
  },
  availability: { 
    type: Boolean, 
    default: true 
  },
  image: { 
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Food+Image'
  },
  stock: {
    type: Number,
    default: 100,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
foodSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create text index for search functionality
foodSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  cuisine: 'text'
});

// Virtual for discounted price
foodSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Ensure virtual fields are serialized
foodSchema.set('toJSON', { virtuals: true });
foodSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Food', foodSchema);
