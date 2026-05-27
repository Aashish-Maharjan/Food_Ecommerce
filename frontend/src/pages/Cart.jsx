import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft, FaCreditCard, FaTruck, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartSummary,
    validateCart,
    isCartEmpty,
    loading 
  } = useCart();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
  const [isClearingCart, setIsClearingCart] = useState(false);

  const cartSummary = getCartSummary();
  const cartValidation = validateCart();

  const handleQuantityChange = async (foodId, newQuantity) => {
    try {
      updateQuantity(foodId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (foodId) => {
    try {
      removeFromCart(foodId);
      setShowRemoveConfirm(null);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      setIsClearingCart(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setIsClearingCart(false);
    }
  };

  const handleCheckout = () => {
    if (!cartValidation.isValid) {
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (isCartEmpty()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingBag className="text-4xl text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 text-lg mb-8">
              Looks like you haven't added any delicious dishes to your cart yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaArrowLeft />
                Browse Menu
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Shopping Cart</h1>
              <p className="text-gray-600">
                {cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <FaArrowLeft />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Cart Validation Warnings */}
        {!cartValidation.isValid && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-yellow-600 text-xl mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Stock Issues Detected</h3>
                <ul className="space-y-1">
                  {cartValidation.issues.map((issue, index) => (
                    <li key={index} className="text-yellow-700 text-sm">
                      <strong>{issue.itemName}</strong>: {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Cart Items</h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item._id} className="p-6">
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg shadow-md"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {item.description}
                            </p>
                            
                            {/* Category and Cuisine Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                                {item.category}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                {item.cuisine}
                              </span>
                            </div>

                            {/* Stock Warning */}
                            {item.stock && item.quantity > item.stock && (
                              <div className="flex items-center gap-2 text-yellow-600 text-sm mb-2">
                                <FaExclamationTriangle />
                                <span>Only {item.stock} available</span>
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div className="text-right ml-4">
                            {item.discount > 0 ? (
                              <div>
                                <span className="text-lg font-bold text-purple-600">
                                  Rs. {item.discountedPrice}
                                </span>
                                <span className="text-sm text-gray-400 line-through ml-2">
                                  Rs. {item.price}
                                </span>
                                <div className="text-xs text-red-600 font-medium mt-1">
                                  {item.discount}% OFF
                                </div>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-800">
                                Rs. {item.price}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls and Actions */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                            <div className="flex items-center border border-gray-200 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="px-3 py-1 text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <FaMinus className="text-sm" />
                              </button>
                              <span className="px-4 py-1 text-gray-800 font-medium min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                disabled={item.stock && item.quantity >= item.stock}
                                className="px-3 py-1 text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <FaPlus className="text-sm" />
                              </button>
                            </div>
                            {item.stock && (
                              <span className="text-xs text-gray-500">
                                {item.stock - item.quantity} left
                              </span>
                            )}
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => setShowRemoveConfirm(item._id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Remove item"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="mt-3 text-right">
                          <span className="text-sm text-gray-600">Item Total:</span>
                          <span className="text-lg font-bold text-purple-600 ml-2">
                            Rs. {((item.discount > 0 ? item.discountedPrice : item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Remove Confirmation Modal */}
                    {showRemoveConfirm === item._id && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FaExclamationTriangle className="text-red-600" />
                          <span className="text-red-800 font-medium">
                            Remove "{item.name}" from cart?
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Yes, Remove
                          </button>
                          <button
                            onClick={() => setShowRemoveConfirm(null)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleClearCart}
                    disabled={isClearingCart}
                    className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-xl font-semibold hover:bg-red-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isClearingCart ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <FaTrash />
                        Clear Cart
                      </>
                    )}
                  </button>
                  <Link
                    to="/menu"
                    className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200 text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartSummary.itemCount} items)</span>
                  <span className="font-medium">Rs. {cartSummary.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {cartSummary.hasFreeShipping ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `Rs. ${cartSummary.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {/* Free Shipping Progress */}
                {!cartSummary.hasFreeShipping && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Free shipping over Rs. {cartSummary.freeShippingThreshold}</span>
                      <span>Rs. {(cartSummary.freeShippingThreshold - cartSummary.subtotal).toFixed(2)} more</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((cartSummary.subtotal / cartSummary.freeShippingThreshold) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>Rs. {cartSummary.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={!cartValidation.isValid || isCheckingOut}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isCheckingOut ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FaCreditCard />
                    Proceed to Checkout
                  </div>
                )}
              </button>

              {/* Additional Info */}
              <div className="text-center text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FaTruck className="text-purple-500" />
                  <span>Fast & Free Delivery</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
