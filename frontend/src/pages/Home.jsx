import { useState, useEffect } from 'react';
import { FaStar, FaClock, FaFire, FaShoppingCart, FaArrowRight, FaUtensils, FaCrown, FaLeaf, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { sampleFoods } from '../data/sampleFoods';

export default function Home() {
  const [featuredFoods, setFeaturedFoods] = useState([]);

  useEffect(() => {
    // Get featured foods (first 6 items)
    setFeaturedFoods(sampleFoods.slice(0, 6));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AM PM Sweets
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover the perfect blend of traditional Nepali snacks and delightful sweets, 
            crafted with authentic recipes and the finest ingredients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/menu"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explore Our Menu
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold text-lg hover:bg-purple-600 hover:text-white transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AM PM Sweets</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We bring you the authentic taste of Nepal with modern convenience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCrown className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                We use only the finest ingredients and traditional recipes to ensure every bite is a memorable experience.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaLeaf className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Fresh & Natural</h3>
              <p className="text-gray-600 leading-relaxed">
                All our snacks and sweets are made fresh daily with natural ingredients, no artificial preservatives.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeart className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Made with Love</h3>
              <p className="text-gray-600 leading-relaxed">
                Every dish is prepared with care and passion, bringing you the authentic flavors of home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Featured <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Delights</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Taste our most popular snacks and sweets, loved by customers across Nepal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredFoods.map((food) => (
              <div key={food._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Image */}
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
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{food.name}</h3>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400 text-sm" />
                      <span className="text-sm font-medium text-gray-700">{food.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{food.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium capitalize">
                      {food.category}
                    </span>
                  </div>
                  
                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <FaClock className="text-purple-500" />
                      <span>{food.prepTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaFire className="text-red-500" />
                      <span className="capitalize">{food.spiceLevel}</span>
                    </div>
                  </div>
                  
                  {/* Price and CTA */}
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
                    
                    <Link
                      to="/menu"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      View Menu
                      <FaArrowRight className="text-sm" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaUtensils />
              View Full Menu
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Ready to Experience <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Authentic Flavors</span>?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Order now and discover why AM PM Sweets is the preferred choice for traditional Nepali snacks and sweets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/menu"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Order Now
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold text-lg hover:bg-purple-600 hover:text-white transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
