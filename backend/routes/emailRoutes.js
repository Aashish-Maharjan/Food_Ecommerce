const express = require('express');
const { body, validationResult } = require('express-validator');
const emailController = require('../controllers/emailController');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Validation middleware
const promotionalEmailValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long'),
  body('campaignType')
    .isIn(['promotional', 'newsletter', 'special-offer', 'event'])
    .withMessage('Invalid campaign type')
];

const bulkEmailValidation = [
  body('userSegment')
    .isIn(['all', 'high-value', 'inactive', 'new-users'])
    .withMessage('Invalid user segment'),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long'),
  body('campaignType')
    .isIn(['promotional', 'newsletter', 'special-offer', 'event'])
    .withMessage('Invalid campaign type')
];

const cartAbandonmentValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('cartItems')
    .isArray({ min: 1 })
    .withMessage('Cart items are required')
];

// Public routes (must be before auth middleware)
// Unsubscribe from marketing emails (Public)
router.post('/unsubscribe', emailController.unsubscribe);

// Test route to verify marketing routes are working (before auth)
router.get('/test', (req, res) => {
  console.log('✅ Marketing test route hit!');
  res.json({ 
    message: 'Marketing routes are working!', 
    path: '/api/marketing/test',
    timestamp: new Date().toISOString()
  });
});

// All routes below require authentication
router.use(auth);

// Send promotional email to single user
router.post('/send-promotional', promotionalEmailValidation, emailController.sendPromotionalEmail);

// Send bulk promotional emails
router.post('/send-bulk', bulkEmailValidation, emailController.sendBulkEmails);

// Send cart abandonment email
router.post('/cart-abandonment', cartAbandonmentValidation, emailController.sendCartAbandonmentEmail);

// Send birthday email
router.post('/birthday', emailController.sendBirthdayEmail);

// Get email campaign statistics (Admin only)
router.get('/stats', requireAdmin, emailController.getEmailStats);

// Get list of users for email campaign (Admin only)
router.get('/users', requireAdmin, emailController.getUsers);

// Send marketing email to all subscribed users (Admin only)
router.post('/send-marketing', requireAdmin, [
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long')
], emailController.sendMarketingEmail);

// Toggle email subscription (Private - for logged in users)
router.put('/subscription', emailController.toggleSubscription);

// Send promotional offer to all subscribed users (Admin only - Quick Launch)
// IMPORTANT: This route must be defined to handle /api/marketing/send-offer
router.post('/send-offer', (req, res, next) => {
  console.log('🔍 /send-offer route middleware - BEFORE requireAdmin');
  console.log('Request path:', req.path);
  console.log('Request method:', req.method);
  console.log('Request originalUrl:', req.originalUrl);
  next();
}, requireAdmin, [
  body('subject')
    .optional()
    .custom((value) => {
      if (value && value.trim().length > 0) {
        if (value.length < 5 || value.length > 200) {
          throw new Error('Subject must be between 5 and 200 characters');
        }
      }
      return true;
    }),
  body('content')
    .optional()
    .custom((value) => {
      if (value && value.trim().length > 0) {
        if (value.length < 50) {
          throw new Error('Content must be at least 50 characters long');
        }
      }
      return true;
    })
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}, (req, res, next) => {
  console.log('✅ /send-offer route hit!');
  console.log('Request body:', req.body);
  console.log('User:', req.user);
  next();
}, emailController.sendOffer);

module.exports = router;
