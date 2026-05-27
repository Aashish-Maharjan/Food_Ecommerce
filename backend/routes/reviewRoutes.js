const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

const router = express.Router();

// Debug middleware to log all review route requests
router.use((req, res, next) => {
  console.log(`[Review Routes] ${req.method} ${req.path} - Original: ${req.originalUrl}`);
  next();
});

// Validation middleware
const reviewValidation = [
  body('foodId')
    .notEmpty()
    .withMessage('Food ID is required')
    .isMongoId()
    .withMessage('Invalid food ID format'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .isLength({ min: 10, max: 500 })
    .withMessage('Review must be between 10 and 500 characters')
];

// Public routes - IMPORTANT: These must come before protected routes
// GET /api/reviews - Get all public reviews
router.get('/', reviewController.getPublicReviews);
// GET /api/reviews/food/:foodId - Get reviews for a specific food
router.get('/food/:foodId', reviewController.getFoodReviews);
// GET /api/reviews/food/:foodId/stats - Get review statistics for a food
router.get('/food/:foodId/stats', reviewController.getFoodReviewStats);

// Protected routes
router.post('/', auth, reviewValidation, reviewController.createReview);
router.put('/:reviewId', auth, reviewValidation, reviewController.updateReview);
router.delete('/:reviewId', auth, reviewController.deleteReview);
router.post('/:reviewId/helpful', auth, reviewController.markHelpful);

// Admin routes
router.get('/admin/all', auth, reviewController.getAllReviews);
router.put('/admin/:reviewId/status', auth, reviewController.updateReviewStatus);

module.exports = router;
