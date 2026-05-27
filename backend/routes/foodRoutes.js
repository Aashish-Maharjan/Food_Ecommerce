const express = require('express');
const foodController = require('../controllers/foodController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', foodController.getFoods);
router.get('/featured', foodController.getFeaturedFoods);
router.get('/category/:category', foodController.getFoodsByCategory);
router.get('/:id', foodController.getFoodById);

// Protected routes (Admin only)
router.post('/', auth, foodController.createFood);
router.put('/:id', auth, foodController.updateFood);
router.delete('/:id', auth, foodController.deleteFood);

module.exports = router;
