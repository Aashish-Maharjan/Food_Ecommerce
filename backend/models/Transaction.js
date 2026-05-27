const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true
    // Note: NOT unique - multiple transactions can use the same product code
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest transactions
  },
  type: {
    type: String,
    default: 'order',
    enum: ['order', 'tax', 'service', 'delivery']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['esewa', 'khalti', 'cash', 'other'],
    default: 'esewa'
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETE', 'FULL_REFUND', 'PARTIAL_REFUND', 'AMBIGUOUS', 'NOT_FOUND', 'CANCELED', 'FAILED'],
    default: 'PENDING'
  },
  ref_id: {
    type: String,
    default: null
  },
  transaction_uuid: {
    type: String,
    required: true,
    unique: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
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
transactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for better query performance
transactionSchema.index({ product_id: 1 });
transactionSchema.index({ transaction_uuid: 1 });
transactionSchema.index({ user: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);

