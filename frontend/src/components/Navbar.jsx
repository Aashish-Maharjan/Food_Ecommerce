import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaShoppingCart, FaUser, FaSearch, FaHeart, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart, getCartSummary, removeFromCart, updateQuantity } = useCart();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const closeCart = () => setIsCartOpen(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const cartSummary = getCartSummary();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <FaStar className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AM PM Sweets
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-lg font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? 'text-purple-600' 
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`text-lg font-medium transition-colors duration-200 ${
                isActive('/menu') 
                  ? 'text-purple-600' 
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/about"
              className={`text-lg font-medium transition-colors duration-200 ${
                isActive('/about') 
                  ? 'text-purple-600' 
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              About
            </Link>
            <Link
              to="/reviews"
              className={`text-lg font-medium transition-colors duration-200 ${
                isActive('/reviews') 
                  ? 'text-purple-600' 
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Reviews
            </Link>
            <Link
              to="/contact"
              className={`text-lg font-medium transition-colors duration-200 ${
                isActive('/contact') 
                  ? 'text-purple-600' 
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200">
              <FaSearch className="text-xl" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 relative"
            >
              <FaHeart className="text-xl" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 relative"
            >
              <FaShoppingCart className="text-xl" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  <FaUser className="text-xl" />
                  <span className="hidden sm:block font-medium">{user.firstName}</span>
                </button>

                {/* User Dropdown */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
            >
              {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`px-4 py-2 text-lg font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/menu"
                className={`px-4 py-2 text-lg font-medium transition-colors duration-200 ${
                  isActive('/menu') 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Menu
              </Link>
              <Link
                to="/about"
                className={`px-4 py-2 text-lg font-medium transition-colors duration-200 ${
                  isActive('/about') 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/reviews"
                className={`px-4 py-2 text-lg font-medium transition-colors duration-200 ${
                  isActive('/reviews') 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                to="/contact"
                className={`px-4 py-2 text-lg font-medium transition-colors duration-200 ${
                  isActive('/contact') 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Cart Dropdown */}
      {isCartOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-100 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Shopping Cart</h3>
              <button
                onClick={closeCart}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <FaShoppingCart className="text-gray-300 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
                <Link
                  to="/menu"
                  className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  onClick={closeCart}
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">Rs. {item.discountedPrice || item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">Rs. {cartSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span className="font-medium">
                      {cartSummary.hasFreeShipping ? 'Free' : `Rs. ${cartSummary.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total:</span>
                    <span>Rs. {cartSummary.total.toFixed(2)}</span>
                  </div>
                  
                  {cartSummary.hasFreeShipping && (
                    <p className="text-green-600 text-sm text-center">
                      🎉 Free shipping on orders over Rs. {cartSummary.freeShippingThreshold}
                    </p>
                  )}
                </div>

                {/* Cart Actions */}
                <div className="flex gap-3">
                  <Link
                    to="/cart"
                    className="flex-1 px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors duration-200 text-center"
                    onClick={closeCart}
                  >
                    View Cart
                  </Link>
                  <Link
                    to="/checkout"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-center"
                    onClick={closeCart}
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
