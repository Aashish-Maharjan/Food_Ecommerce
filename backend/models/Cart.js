const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  discountedPrice: {
    type: Number
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0
  },
  discountedTotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
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
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.calculateTotals();
  next();
});

// Method to calculate totals
cartSchema.methods.calculateTotals = function() {
  this.total = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  this.discountedTotal = this.items.reduce((sum, item) => {
    const itemTotal = (item.discountedPrice || item.price) * item.quantity;
    return sum + itemTotal;
  }, 0);

  // Apply tax (13% VAT for Nepal)
  this.tax = this.discountedTotal * 0.13;
  this.grandTotal = this.discountedTotal + this.tax;
};

// Method to add item to cart
cartSchema.methods.addItem = function(foodId, quantity, price, discountedPrice) {
  const existingItem = this.items.find(item => 
    item.food.toString() === foodId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      food: foodId,
      quantity,
      price,
      discountedPrice
    });
  }

  this.calculateTotals();
  return this;
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(foodId, quantity) {
  const item = this.items.find(item => 
    item.food.toString() === foodId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      this.items = this.items.filter(item => 
        item.food.toString() !== foodId.toString()
      );
    } else {
      item.quantity = quantity;
    }
    this.calculateTotals();
  }

  return this;
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(foodId) {
  this.items = this.items.filter(item => 
    item.food.toString() !== foodId.toString()
  );
  this.calculateTotals();
  return this;
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.calculateTotals();
  return this;
};

module.exports = mongoose.model('Cart', cartSchema);
