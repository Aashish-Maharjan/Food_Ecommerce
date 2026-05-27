const express = require('express');
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(auth);

// Get user's cart
router.get('/', cartController.getCart);

// Get cart summary
router.get('/summary', cartController.getCartSummary);

// Add item to cart
router.post('/add', cartController.addToCart);

// Update item quantity
router.put('/update', cartController.updateCartItem);

// Remove item from cart
router.delete('/remove/:foodId', cartController.removeFromCart);

// Clear cart
router.delete('/clear', cartController.clearCart);

module.exports = router;
