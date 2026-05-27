import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';

export default function Wishlist() {
  // TODO: Implement wishlist functionality
  const wishlistItems = [];

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeart className="text-4xl text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 text-lg mb-8">
              Start adding your favorite dishes to your wishlist!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaShoppingBag />
                Browse Menu
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200"
              >
                <FaArrowLeft />
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>
        {/* Wishlist items will be displayed here */}
      </div>
    </div>
  );
}

