const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  name: {
    type: String,
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

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'Nepal'
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['esewa', 'khalti', 'fonepay', 'nepalpay', 'cod'],
    default: 'cod'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  deliveryInstructions: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
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
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  this.calculateTotals();
  next();
});

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => {
    const itemPrice = item.discountedPrice || item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  // Apply tax (13% VAT for Nepal)
  this.tax = this.subtotal * 0.13;
  
  // Add shipping cost
  this.total = this.subtotal + this.tax + this.shippingCost;
};

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  }
  return this;
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = function(newStatus, paymentResult = {}) {
  this.paymentStatus = newStatus;
  if (paymentResult.id) {
    this.paymentResult = paymentResult;
  }
  return this;
};

module.exports = mongoose.model('Order', orderSchema);
