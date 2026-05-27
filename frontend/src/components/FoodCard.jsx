import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaClock, FaFire, FaStar, FaShoppingCart, FaCheck, FaMinus, FaPlus, FaChevronDown, FaChevronUp, FaEdit, FaComment } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ReviewSection from './ReviewSection';

export default function FoodCard({ food, viewMode = 'grid' }) {
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  const { user } = useAuth();
  const isInCartState = isInCart(food._id);
  const currentQuantity = getItemQuantity(food._id);
  const [showReviews, setShowReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleAddReview = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Show review form directly in the card
    setShowReviews(true);
    setShowReviewForm(true);
  };

  const handleAddToCart = () => {
    if (isInCartState) {
      updateQuantity(food._id, currentQuantity + 1);
    } else {
      addToCart(food, 1);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      updateQuantity(food._id, 0);
    } else {
      updateQuantity(food._id, newQuantity);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-6">
        <div className="flex gap-6">
          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src={food.image}
              alt={food.name}
              className="w-32 h-32 object-cover rounded-xl shadow-md"
            />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Link
                  to={`/food/${food._id}`}
                  className="text-xl font-bold text-gray-800 mb-2 hover:text-purple-600 transition-colors block"
                >
                  {food.name}
                </Link>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{food.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium capitalize">
                    {food.category}
                  </span>
                  {food.featured && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      Featured
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <FaClock className="text-purple-500" />
                    <span>{food.prepTime} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaFire className="text-red-500" />
                    <span className="capitalize">{food.spiceLevel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <span>{food.rating} ({food.numReviews})</span>
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="text-right">
                <div className="mb-3">
                  {food.discount > 0 ? (
                    <div>
                      <span className="text-2xl font-bold text-purple-600">Rs. {food.discountedPrice}</span>
                      <span className="text-lg text-gray-400 line-through ml-2">Rs. {food.price}</span>
                      <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">
                        {food.discount}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-800">Rs. {food.price}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {/* Cart Quantity Controls */}
                  {isInCartState ? (
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() => handleQuantityChange(currentQuantity - 1)}
                        className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors"
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="text-lg font-bold text-purple-600 min-w-[2rem] text-center">
                        {currentQuantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(currentQuantity + 1)}
                        disabled={food.stock && currentQuantity >= food.stock}
                        className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <FaShoppingCart />
                      Add to Cart
                    </button>
                  )}
                  
                  {/* Add Review Button - Prominent */}
                  <button
                    onClick={handleAddReview}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200"
                  >
                    <FaComment />
                    {user ? 'Add Review' : 'Login to Review'}
                  </button>
                  
                  <button className="flex items-center justify-center gap-2 px-6 py-2 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200">
                    <FaHeart />
                    Wishlist
                  </button>
                </div>
              </div>
            </div>

            {/* Stock Warning */}
            {food.stock < 10 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Only {food.stock} items left in stock!
                </p>
              </div>
            )}

            {/* Reviews Toggle and Add Review Button */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setShowReviews(!showReviews)}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors font-medium"
              >
                {showReviews ? <FaChevronUp /> : <FaChevronDown />}
                {showReviews ? 'Hide Reviews' : 'Show Reviews'}
              </button>
              {user && (
                <button
                  onClick={() => {
                    setShowReviews(true);
                    setShowReviewForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                >
                  <FaEdit />
                  Write Review
                </button>
              )}
            </div>

            {/* Reviews Section */}
            {showReviews && (
              <div className="mt-4 w-full overflow-hidden">
                <ReviewSection 
                  foodId={food._id} 
                  foodName={food.name} 
                  showFormInitially={showReviewForm}
                  onFormClose={() => setShowReviewForm(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View (default)
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {food.discount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
              {food.discount}% OFF
            </span>
          )}
          {food.featured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
              Featured
            </span>
          )}
        </div>
        
        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors duration-200 shadow-lg">
          <FaHeart className="text-sm" />
        </button>
        
        {/* Stock Warning */}
        {food.stock < 10 && (
          <div className="absolute bottom-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
            ⚠️ Only {food.stock} left!
          </div>
        )}

        {/* Cart Status Badge */}
        {isInCartState && (
          <div className="absolute bottom-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
            <FaCheck className="text-xs" />
            In Cart
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <Link
            to={`/food/${food._id}`}
            className="text-lg font-bold text-gray-800 leading-tight hover:text-purple-600 transition-colors"
          >
            {food.name}
          </Link>
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-400 text-sm" />
            <span className="text-sm font-medium text-gray-700">{food.rating}</span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{food.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium capitalize">
            {food.category}
          </span>
        </div>
        
        {/* Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FaClock className="text-purple-500" />
              <span>{food.prepTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <FaFire className="text-red-500" />
              <span className="capitalize">{food.spiceLevel}</span>
            </div>
          </div>
          <span className="text-xs text-gray-500">({food.numReviews} reviews)</span>
        </div>
        
        {/* Price and Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              {food.discount > 0 ? (
                <div>
                  <span className="text-lg font-bold text-purple-600">Rs. {food.discountedPrice}</span>
                  <span className="text-sm text-gray-400 line-through ml-2">Rs. {food.price}</span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-800">Rs. {food.price}</span>
              )}
            </div>
            
            {/* Cart Controls */}
            {isInCartState ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(currentQuantity - 1)}
                  className="w-7 h-7 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors"
                >
                  <FaMinus className="text-xs" />
                </button>
                <span className="text-sm font-bold text-purple-600 min-w-[1.5rem] text-center">
                  {currentQuantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(currentQuantity + 1)}
                  disabled={food.stock && currentQuantity >= food.stock}
                  className="w-7 h-7 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPlus className="text-xs" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaShoppingCart className="text-sm" />
                Add
              </button>
            )}
          </div>

          {/* Add Review Button - Always Visible */}
          <button
            onClick={handleAddReview}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200"
          >
            <FaComment className="text-sm" />
            {user ? 'Add Review' : 'Login to Review'}
          </button>
        </div>

        {/* Reviews Toggle and Add Review Button */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => setShowReviews(!showReviews)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors text-sm font-medium"
          >
            {showReviews ? <FaChevronUp /> : <FaChevronDown />}
            {showReviews ? 'Hide Reviews' : 'Show Reviews'}
          </button>
          {user && (
            <button
              onClick={() => {
                setShowReviews(true);
                setShowReviewForm(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs"
            >
              <FaEdit className="text-xs" />
              Review
            </button>
          )}
        </div>

        {/* Reviews Section */}
        {showReviews && (
          <div className="mt-4 w-full overflow-hidden">
            <ReviewSection 
              foodId={food._id} 
              foodName={food.name} 
              showFormInitially={showReviewForm}
              onFormClose={() => setShowReviewForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
