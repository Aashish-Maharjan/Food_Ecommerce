import { useState, useEffect } from 'react';
import { FaStar, FaUser, FaClock, FaThumbsUp, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function ReviewSection({ foodId, foodName, showFormInitially = false, onFormClose }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(showFormInitially);
  const [editingReview, setEditingReview] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    review: '',
    helpful: false
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/reviews/food/${foodId}`);
        if (response.data.success) {
          setReviews(response.data.data || []);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // If food doesn't exist or no reviews, set empty array
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (foodId) {
      fetchReviews();
    }
  }, [foodId]);

  // Handle showFormInitially prop
  useEffect(() => {
    if (showFormInitially) {
      setShowReviewForm(true);
    }
  }, [showFormInitially]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (!formData.review.trim()) {
      toast.error('Please write a review');
      return;
    }

    if (formData.review.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    // Check if foodId is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(foodId);
    if (!isValidObjectId) {
      toast.error('This food item is not in the database. Reviews can only be submitted for foods that exist in the database.');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await axios.post('/api/reviews', {
        foodId,
        rating: parseInt(formData.rating),
        review: formData.review.trim()
      });

      if (response.data.success) {
        const newReview = response.data.data;
        // Refresh reviews list to get the latest data
        const refreshResponse = await axios.get(`/api/reviews/food/${foodId}`);
        if (refreshResponse.data.success) {
          setReviews(refreshResponse.data.data || []);
        }
        setFormData({ rating: 5, review: '', helpful: false });
        setShowReviewForm(false);
        if (onFormClose) onFormClose();
        
        // Dispatch event to refresh Reviews page
        window.dispatchEvent(new Event('reviewSubmitted'));
        
        toast.success('Review submitted successfully! It will appear on the Reviews page.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg ||
                          'Failed to submit review';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      review: review.review,
      helpful: review.helpful
    });
    setShowReviewForm(true);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    
    if (!formData.review.trim()) {
      toast.error('Please write a review');
      return;
    }

    if (formData.review.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await axios.put(`/api/reviews/${editingReview._id}`, {
        foodId,
        rating: parseInt(formData.rating),
        review: formData.review.trim()
      });

      if (response.data.success) {
        const updatedReview = response.data.data;
        setReviews(prev => prev.map(review => 
          review._id === editingReview._id ? updatedReview : review
        ));
        
      setFormData({ rating: 5, review: '', helpful: false });
      setShowReviewForm(false);
      setEditingReview(null);
      if (onFormClose) onFormClose();
      toast.success('Review updated successfully!');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg ||
                          'Failed to update review';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/reviews/${reviewId}`);
      
      if (response.data.success) {
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        toast.success('Review deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete review';
      toast.error(errorMessage);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      toast.error('Please login to mark reviews as helpful');
      return;
    }

    try {
      const response = await axios.post(`/api/reviews/${reviewId}/helpful`);
      
      if (response.data.success) {
        const isHelpful = response.data.data.isHelpful;
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { 
                ...review, 
                helpful: response.data.data.helpful,
                helpfulUsers: isHelpful 
                  ? [...(review.helpfulUsers || []), user._id]
                  : (review.helpfulUsers || []).filter(id => id !== user._id)
              }
            : review
        ));
        
        toast.success(isHelpful ? 'Marked as helpful!' : 'Removed helpful vote');
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update helpful status';
      toast.error(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setFormData({ rating: 5, review: '', helpful: false });
    setShowReviewForm(false);
    if (onFormClose) onFormClose();
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Get rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: reviews.length > 0 
      ? ((reviews.filter(review => review.rating === rating).length / reviews.length) * 100).toFixed(0)
      : 0
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading reviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2 truncate">Customer Reviews</h2>
          <p className="text-sm sm:text-base text-gray-600 truncate">See what others are saying about {foodName}</p>
        </div>
        
        {user && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base whitespace-nowrap"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Overall Rating */}
        <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">{averageRating}</div>
          <div className="flex justify-center mb-2 gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`text-lg sm:text-xl ${
                  star <= Math.round(averageRating) 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm sm:text-base text-gray-600">Based on {reviews.length} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2 sm:space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 w-12 sm:w-16 flex-shrink-0">
                <span className="text-xs sm:text-sm font-medium text-gray-600">{rating}</span>
                <FaStar className="text-yellow-400 text-xs sm:text-sm" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-0">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-xs sm:text-sm text-gray-600 w-8 sm:w-12 text-right flex-shrink-0">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white to-purple-50/30 rounded-xl sm:rounded-2xl border-2 border-purple-100 shadow-lg w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 flex-1 min-w-0 truncate">
              {editingReview ? '✏️ Edit Your Review' : '⭐ Write a Review'}
            </h3>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl sm:text-3xl font-bold flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              aria-label="Close form"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={editingReview ? handleUpdateReview : handleSubmitReview} className="space-y-4 sm:space-y-6 w-full">
            {/* Rating Selection */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className={`p-2 sm:p-3 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                      formData.rating >= star
                        ? 'text-yellow-400 bg-yellow-50 shadow-md scale-105'
                        : 'text-gray-300 hover:text-yellow-300 hover:bg-gray-50'
                    }`}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <FaStar className="text-2xl sm:text-3xl md:text-4xl" />
                  </button>
                ))}
              </div>
              <p className="text-xs sm:text-sm font-medium text-purple-600 mt-2 min-h-[20px] text-center sm:text-left">
                {formData.rating === 5 && '🌟 Excellent! We love to hear that!'}
                {formData.rating === 4 && '👍 Very Good! Thank you for your feedback!'}
                {formData.rating === 3 && '😊 Good! We appreciate your input!'}
                {formData.rating === 2 && '😐 Fair. We\'d love to improve!'}
                {formData.rating === 1 && '😔 Poor. Please let us know how we can do better!'}
              </p>
            </div>

            {/* Review Text */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm w-full">
              <label htmlFor="review" className="block text-sm font-semibold text-gray-700 mb-3">
                Your Review <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-gray-500 ml-2 block sm:inline mt-1 sm:mt-0">
                  (Minimum 10 characters)
                </span>
              </label>
              <textarea
                id="review"
                name="review"
                value={formData.review}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 resize-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                placeholder="Share your experience with this dish... What did you like? What could be better?"
                required
                minLength={10}
                maxLength={500}
              />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 mt-2">
                <p className="text-xs text-gray-500">
                  {formData.review.length < 10 
                    ? `${10 - formData.review.length} more characters needed`
                    : '✓ Ready to submit'
                  }
                </p>
                <p className={`text-xs font-medium ${
                  formData.review.length >= 10 
                    ? 'text-green-600' 
                    : 'text-gray-400'
                }`}>
                  {formData.review.length} / 500
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
              <button
                type="submit"
                disabled={submitting || formData.review.trim().length < 10}
                className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                    <span>{editingReview ? 'Updating...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <FaStar className="text-sm" />
                    <span>{editingReview ? 'Update Review' : 'Submit Review'}</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 sm:space-y-6 w-full">
        {reviews.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 text-4xl sm:text-6xl mb-4">💬</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">
              Be the first to share your experience with this dish!
            </p>
            {user && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Write First Review
              </button>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border border-gray-100 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 w-full overflow-hidden">
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <img
                    src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.firstName}+${review.user?.lastName}&background=purple&color=fff`}
                    alt={`${review.user?.firstName} ${review.user?.lastName}`}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                        {review.user?.firstName} {review.user?.lastName}
                      </h4>
                      {review.isVerified && (
                        <span className="px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium flex items-center gap-1 flex-shrink-0">
                          <FaCheckCircle className="text-xs" />
                          Verified
                        </span>
                      )}
                      {review.isEdited && (
                        <span className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium flex-shrink-0">
                          Edited
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-xs" />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {review.isEdited && review.editedAt && (
                        <span className="text-purple-600">(edited {new Date(review.editedAt).toLocaleDateString()})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-sm sm:text-base ${
                        star <= review.rating 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">{review.review}</p>
              </div>

              {/* Review Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleMarkHelpful(review._id)}
                    className={`flex items-center gap-2 transition-colors text-xs sm:text-sm ${
                      user && review.helpfulUsers && review.helpfulUsers.some(id => 
                        (typeof id === 'string' ? id : id.toString()) === (user.id || user._id)
                      )
                        ? 'text-purple-600'
                        : 'text-gray-600 hover:text-purple-600'
                    }`}
                  >
                    <FaThumbsUp className="text-sm" />
                    <span>Helpful ({review.helpful || 0})</span>
                  </button>
                </div>

                {/* Edit/Delete for own reviews */}
                {user && (review.user?._id === user.id || review.user?._id === user._id) && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-700 transition-colors text-xs sm:text-sm"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors text-xs sm:text-sm"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
