const Cart = require('../models/Cart');
const Food = require('../models/Food');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId })
      .populate('items.food', 'name price image description category cuisine');

    if (!cart) {
      cart = new Cart({ user: req.user.userId });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      message: 'Server error while fetching cart'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;

    // Validate food exists and is available
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        message: 'Food item not found'
      });
    }

    if (!food.availability) {
      return res.status(400).json({
        message: 'Food item is not available'
      });
    }

    if (food.stock < quantity) {
      return res.status(400).json({
        message: 'Insufficient stock'
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId });
    }

    // Add item to cart
    const discountedPrice = food.discount > 0 ? 
      food.price - (food.price * food.discount / 100) : undefined;

    cart.addItem(foodId, quantity, food.price, discountedPrice);
    await cart.save();

    // Populate food details
    await cart.populate('items.food', 'name price image description category cuisine');

    res.json({
      message: 'Item added to cart successfully',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      message: 'Server error while adding item to cart'
    });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/update
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({
        message: 'Quantity cannot be negative'
      });
    }

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    // Check stock if increasing quantity
    if (quantity > 0) {
      const food = await Food.findById(foodId);
      if (food && food.stock < quantity) {
        return res.status(400).json({
          message: 'Insufficient stock'
        });
      }
    }

    cart.updateItemQuantity(foodId, quantity);
    await cart.save();

    // Populate food details
    await cart.populate('items.food', 'name price image description category cuisine');

    res.json({
      message: 'Cart updated successfully',
      cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      message: 'Server error while updating cart'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:foodId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { foodId } = req.params;

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    cart.removeItem(foodId);
    await cart.save();

    // Populate food details
    await cart.populate('items.food', 'name price image description category cuisine');

    res.json({
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      message: 'Server error while removing item from cart'
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    cart.clearCart();
    await cart.save();

    res.json({
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      message: 'Server error while clearing cart'
    });
  }
};

// @desc    Get cart summary (count and total)
// @route   GET /api/cart/summary
// @access  Private
exports.getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    
    if (!cart) {
      return res.json({
        itemCount: 0,
        total: 0,
        discountedTotal: 0,
        tax: 0,
        grandTotal: 0
      });
    }

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      itemCount,
      total: cart.total,
      discountedTotal: cart.discountedTotal,
      tax: cart.tax,
      grandTotal: cart.grandTotal
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      message: 'Server error while fetching cart summary'
    });
  }
};
