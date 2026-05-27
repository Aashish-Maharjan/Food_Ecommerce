const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const { validationResult } = require('express-validator');

// @desc    Create order from cart
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shippingAddress, paymentMethod, deliveryInstructions } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.userId })
      .populate('items.food', 'name price discount stock availability');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: 'Cart is empty'
      });
    }

    // Validate items availability and stock
    for (const item of cart.items) {
      if (!item.food.availability) {
        return res.status(400).json({
          message: `${item.food.name} is not available`
        });
      }
      if (item.food.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.food.name}`
        });
      }
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      food: item.food._id,
      name: item.food.name,
      quantity: item.quantity,
      price: item.price,
      discountedPrice: item.discountedPrice
    }));

    // Calculate shipping cost based on location
    const shippingCost = calculateShippingCost(shippingAddress.city);

    // Create order
    const order = new Order({
      user: req.user.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      deliveryInstructions,
      shippingCost,
      subtotal: cart.discountedTotal,
      tax: cart.tax,
      total: cart.discountedTotal + cart.tax + shippingCost
    });

    await order.save();

    // Clear cart
    cart.clearCart();
    await cart.save();

    // Update stock
    for (const item of cart.items) {
      await Food.findByIdAndUpdate(item.food._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // If COD, mark as pending payment
    if (paymentMethod === 'cod') {
      order.paymentStatus = 'pending';
      order.status = 'pending';
      await order.save();
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      message: 'Server error while creating order'
    });
  }
};

// @desc    Process eSewa payment
// @route   POST /api/payment/esewa
// @access  Private
exports.processEsewaPayment = async (req, res) => {
  try {
    const { orderId, transactionId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: 'Not authorized to access this order'
      });
    }

    if (status === 'success') {
      order.paymentStatus = 'completed';
      order.paymentResult = {
        id: transactionId,
        status: 'completed',
        update_time: new Date().toISOString()
      };
      order.status = 'processing';
    } else {
      order.paymentStatus = 'failed';
      order.paymentResult = {
        id: transactionId,
        status: 'failed',
        update_time: new Date().toISOString()
      };
    }

    await order.save();

    res.json({
      message: `Payment ${status}`,
      order
    });
  } catch (error) {
    console.error('eSewa payment error:', error);
    res.status(500).json({
      message: 'Server error while processing payment'
    });
  }
};

// @desc    Process Khalti payment
// @route   POST /api/payment/khalti
// @access  Private
exports.processKhaltiPayment = async (req, res) => {
  try {
    const { orderId, transactionId, status, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: 'Not authorized to access this order'
      });
    }

    // Verify amount
    if (amount !== order.total) {
      return res.status(400).json({
        message: 'Amount mismatch'
      });
    }

    if (status === 'success') {
      order.paymentStatus = 'completed';
      order.paymentResult = {
        id: transactionId,
        status: 'completed',
        update_time: new Date().toISOString()
      };
      order.status = 'processing';
    } else {
      order.paymentStatus = 'failed';
      order.paymentResult = {
        id: transactionId,
        status: 'failed',
        update_time: new Date().toISOString()
      };
    }

    await order.save();

    res.json({
      message: `Payment ${status}`,
      order
    });
  } catch (error) {
    console.error('Khalti payment error:', error);
    res.status(500).json({
      message: 'Server error while processing payment'
    });
  }
};

// @desc    Get payment gateway configuration
// @route   GET /api/payment/config
// @access  Public
exports.getPaymentConfig = async (req, res) => {
  try {
    const config = {
      esewa: {
        merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
        merchantKey: process.env.ESEWA_MERCHANT_KEY || '8gBm/:&EnhH.1/q',
        environment: process.env.NODE_ENV === 'production' ? 'live' : 'test',
        successUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
        failureUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failure`
      },
      khalti: {
        publicKey: process.env.KHALTI_PUBLIC_KEY || 'test_public_key',
        environment: process.env.NODE_ENV === 'production' ? 'live' : 'test',
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`
      },
      fonepay: {
        merchantId: process.env.FONEPAY_MERCHANT_ID || 'test_merchant',
        environment: process.env.NODE_ENV === 'production' ? 'live' : 'test'
      },
      nepalpay: {
        merchantId: process.env.NEPALPAY_MERCHANT_ID || 'test_merchant',
        environment: process.env.NODE_ENV === 'production' ? 'live' : 'test'
      }
    };

    res.json(config);
  } catch (error) {
    console.error('Get payment config error:', error);
    res.status(500).json({
      message: 'Server error while fetching payment configuration'
    });
  }
};

// @desc    Get user orders
// @route   GET /api/payment/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user: req.user.userId };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('items.food', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/payment/orders/:orderId
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('items.food', 'name image description')
      .populate('user', 'username firstName lastName email');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    if (order.user._id.toString() !== req.user.userId) {
      return res.status(403).json({
        message: 'Not authorized to access this order'
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      message: 'Server error while fetching order'
    });
  }
};

// Helper function to calculate shipping cost
function calculateShippingCost(city) {
  const cityShippingCosts = {
    'Kathmandu': 0,
    'Lalitpur': 0,
    'Bhaktapur': 0,
    'Pokhara': 100,
    'Biratnagar': 150,
    'Dharan': 120,
    'Bharatpur': 80,
    'Hetauda': 60,
    'Butwal': 120,
    'Nepalgunj': 200
  };

  return cityShippingCosts[city] || 100; // Default shipping cost
}
