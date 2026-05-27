import { useState, useEffect, useCallback } from 'react';
import { FaStar, FaQuoteLeft, FaUser, FaFilter, FaSort, FaSearch, FaThumbsUp, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredReviews, setFilteredReviews] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);
      if (showVerifiedOnly) params.append('verified', 'true');
      params.append('sortBy', sortBy);
      params.append('limit', '100'); // Get more reviews for filtering
      
      const url = `/api/reviews?${params.toString()}`;
      console.log('Fetching reviews from:', url);
      
      const response = await axios.get(url);
      console.log('Reviews response:', response.data);
      
      if (response.data.success) {
        setReviews(response.data.data || []);
      } else {
        console.warn('Response not successful:', response.data);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        toast.error('Reviews endpoint not found. Please ensure the backend server is running on port 5001.');
      } else {
        toast.error('Failed to load reviews. Please check your connection.');
      }
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [ratingFilter, sortBy, showVerifiedOnly]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Listen for review submission events
  useEffect(() => {
    const handleReviewSubmitted = () => {
      console.log('Review submitted event received, refreshing reviews...');
      fetchReviews();
    };
    
    window.addEventListener('reviewSubmitted', handleReviewSubmitted);
    return () => {
      window.removeEventListener('reviewSubmitted', handleReviewSubmitted);
    };
  }, [fetchReviews]);

  // Filter reviews (search only, as rating and verified are handled by API)
  useEffect(() => {
    let filtered = [...reviews];

    // Search filter (client-side for better UX)
    if (searchTerm) {
      filtered = filtered.filter(review => {
        const foodName = review.food?.name?.toLowerCase() || '';
        const reviewText = review.review?.toLowerCase() || '';
        const userName = `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return foodName.includes(searchLower) || 
               reviewText.includes(searchLower) || 
               userName.includes(searchLower);
      });
    }

    setFilteredReviews(filtered);
  }, [reviews, searchTerm]);

  // Calculate overall statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : 0;
  const verifiedReviews = reviews.filter(review => review.isVerified).length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: totalReviews > 0 
      ? ((reviews.filter(review => review.rating === rating).length / totalReviews) * 100).toFixed(0)
      : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Customer <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Reviews</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover what our customers are saying about our delicious Nepali cuisine
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{totalReviews}</div>
            <p className="text-gray-600">Total Reviews</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">{averageRating}</div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`text-lg ${
                    star <= Math.round(averageRating) 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600">Average Rating</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{verifiedReviews}</div>
            <p className="text-gray-600">Verified Reviews</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {reviews.reduce((sum, review) => sum + review.helpful, 0)}
            </div>
            <p className="text-gray-600">Helpful Votes</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Rating Distribution</h2>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-20">
                  <span className="text-sm font-medium text-gray-600">{rating}</span>
                  <FaStar className="text-yellow-400 text-sm" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">{count}</span>
                <span className="text-sm text-gray-500 w-16 text-right">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Reviews</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by food name, review content, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest-rating">Highest Rating</option>
                <option value="lowest-rating">Lowest Rating</option>
                <option value="most-helpful">Most Helpful</option>
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showVerifiedOnly}
                  onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Show verified reviews only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRatingFilter('all');
                  setShowVerifiedOnly(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  Showing {filteredReviews.length} of {totalReviews} reviews
                </p>
                {filteredReviews.length !== totalReviews && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRatingFilter('all');
                      setShowVerifiedOnly(false);
                    }}
                    className="text-purple-600 hover:text-purple-700 transition-colors text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {filteredReviews.map((review) => (
                <div key={review._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex gap-6">
                    {/* Food Image */}
                    <div className="flex-shrink-0">
                    <img
                      src={review.food?.image || 'https://via.placeholder.com/150'}
                      alt={review.food?.name || 'Food item'}
                      className="w-20 h-20 object-cover rounded-xl shadow-md"
                    />
                    </div>

                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {review.food?.name || 'Unknown Food'}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            {review.food?.category && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium capitalize">
                                {review.food.category}
                              </span>
                            )}
                            {review.isVerified && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium flex items-center gap-1">
                                <FaCheckCircle className="text-xs" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`text-lg ${
                                star <= review.rating 
                                  ? 'text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed">{review.review}</p>
                      </div>

                      {/* User Info and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((review.user?.firstName || '') + ' ' + (review.user?.lastName || ''))}`}
                            alt={`${review.user?.firstName || ''} ${review.user?.lastName || ''}`}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                          <div className="text-sm">
                            <p className="font-medium text-gray-800">
                              {review.user?.firstName || 'Anonymous'} {review.user?.lastName || ''}
                            </p>
                            <div className="flex items-center gap-2 text-gray-500">
                              <FaClock className="text-xs" />
                              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button 
                            onClick={async () => {
                              if (!user) {
                                toast.error('Please login to mark reviews as helpful');
                                return;
                              }
                              try {
                                const response = await axios.post(`/api/reviews/${review._id}/helpful`);
                                if (response.data.success) {
                                  setReviews(prev => prev.map(r => 
                                    r._id === review._id 
                                      ? { ...r, helpful: response.data.data.helpful }
                                      : r
                                  ));
                                  toast.success('Marked as helpful!');
                                }
                              } catch (error) {
                                toast.error('Failed to update helpful status');
                              }
                            }}
                            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                          >
                            <FaThumbsUp className="text-sm" />
                            <span className="text-sm">Helpful ({review.helpful || 0})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
