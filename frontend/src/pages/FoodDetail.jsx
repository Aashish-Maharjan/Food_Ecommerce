import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { FaStar, FaClock, FaFire, FaShoppingCart, FaMinus, FaPlus, FaArrowLeft, FaHeart, FaCheck } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ReviewSection from '../components/ReviewSection';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(location.state?.showReviewForm || false);
  const [quantity, setQuantity] = useState(1);

  const isInCartState = isInCart(id);
  const currentQuantity = getItemQuantity(id);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        setLoading(true);
        // Try to fetch from API first
        try {
          const response = await axios.get(`/api/foods/${id}`);
          if (response.data.success) {
            setFood(response.data.data);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('API fetch failed, trying sample data...', apiError);
        }
        
        // If API fails, try to find in sample data (for development)
        const { sampleFoods } = await import('../data/sampleFoods');
        const sampleFood = sampleFoods.find(f => f._id === id);
        if (sampleFood) {
          setFood(sampleFood);
        } else {
          toast.error('Food item not found');
          navigate('/menu');
        }
      } catch (error) {
        console.error('Error fetching food:', error);
        toast.error('Failed to load food details');
        navigate('/menu');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFood();
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (food) {
      if (isInCartState) {
        updateQuantity(id, currentQuantity + quantity);
        toast.success(`Added ${quantity} more to cart!`);
      } else {
        addToCart(food, quantity);
        toast.success('Added to cart!');
      }
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (food?.stock && newQuantity > food.stock) {
      toast.warning(`Only ${food.stock} items available`);
      return;
    }
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading food details...</p>
        </div>
      </div>
    );
  }

  if (!food) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors mb-6"
        >
          <FaArrowLeft />
          Back to Menu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Food Image */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-96 object-cover"
            />
            {food.discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                {food.discount}% OFF
              </div>
            )}
          </div>

          {/* Food Details */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{food.name}</h1>
              
              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`text-lg ${
                          star <= Math.round(food.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {food.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-gray-500">({food.numReviews || 0} reviews)</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium capitalize">
                  {food.category}
                </span>
                {food.cuisine && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium capitalize">
                    {food.cuisine}
                  </span>
                )}
                {food.featured && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
                    Featured
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed mb-6">{food.description}</p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaClock className="text-purple-500" />
                  <span>{food.prepTime || 'N/A'} min</span>
                </div>
                {food.spiceLevel && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaFire className="text-red-500" />
                    <span className="capitalize">{food.spiceLevel}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                {food.discount > 0 ? (
                  <div>
                    <span className="text-4xl font-bold text-purple-600">Rs. {food.discountedPrice}</span>
                    <span className="text-2xl text-gray-400 line-through ml-3">Rs. {food.price}</span>
                    <div className="mt-2">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                        Save Rs. {(food.price - food.discountedPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-gray-800">Rs. {food.price}</span>
                )}
              </div>

              {/* Stock Warning */}
              {food.stock !== undefined && food.stock < 10 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Only {food.stock} items left in stock!
                  </p>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border-2 border-gray-200 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-4 py-2 text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaMinus />
                    </button>
                    <span className="px-6 py-2 text-gray-800 font-medium min-w-[4rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={food.stock && quantity >= food.stock}
                      className="px-4 py-2 text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  {food.stock && (
                    <span className="text-sm text-gray-500">
                      {food.stock - quantity} left
                    </span>
                  )}
                </div>

                {isInCartState ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border-2 border-purple-600 rounded-lg">
                      <button
                        onClick={() => updateQuantity(id, currentQuantity - 1)}
                        className="px-4 py-3 text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <FaMinus />
                      </button>
                      <span className="px-6 py-3 text-purple-600 font-bold min-w-[4rem] text-center">
                        {currentQuantity} in cart
                      </span>
                      <button
                        onClick={() => updateQuantity(id, currentQuantity + 1)}
                        disabled={food.stock && currentQuantity >= food.stock}
                        className="px-4 py-3 text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <FaCheck />
                      <span className="font-medium">In Cart</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>
                )}
              </div>

              {/* Wishlist Button */}
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                <FaHeart />
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Customer Reviews</h2>
              <p className="text-gray-600">Share your experience with {food.name}</p>
            </div>
            {user && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaStar />
                Write a Review
              </button>
            )}
            {!user && (
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaStar />
                Login to Review
              </Link>
            )}
          </div>

          <ReviewSection
            foodId={food._id}
            foodName={food.name}
            showFormInitially={showReviewForm}
            onFormClose={() => setShowReviewForm(false)}
          />
        </div>
      </div>
    </div>
  );
}

