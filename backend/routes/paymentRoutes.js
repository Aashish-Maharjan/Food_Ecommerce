const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { EsewaInitiatePayment, paymentStatus, verifyPayment } = require('../controllers/esewaController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const orderValidation = [
  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .notEmpty()
    .withMessage('ZIP code is required'),
  body('paymentMethod')
    .isIn(['esewa', 'khalti', 'fonepay', 'nepalpay', 'cod'])
    .withMessage('Invalid payment method')
];

const paymentValidation = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID format'),
  body('transactionId')
    .notEmpty()
    .withMessage('Transaction ID is required'),
  body('status')
    .isIn(['success', 'failure'])
    .withMessage('Invalid status')
];

// Public routes
router.get('/config', paymentController.getPaymentConfig);
router.post('/verify-payment', verifyPayment); // eSewa callback (no auth required)

// Protected routes
router.post('/create-order', auth, orderValidation, paymentController.createOrder);
router.post('/esewa', auth, paymentValidation, paymentController.processEsewaPayment);
router.post('/khalti', auth, paymentValidation, paymentController.processKhaltiPayment);
router.get('/orders', auth, paymentController.getUserOrders);
router.get('/orders/:orderId', auth, paymentController.getOrderById);

// eSewa payment routes
router.post('/initiate-payment', EsewaInitiatePayment); // Can be public or protected
router.post('/payment-status', paymentStatus); // Can be public or protected

module.exports = router;
