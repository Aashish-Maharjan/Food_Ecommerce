import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes, FaThumbsUp, FaTh, FaList } from 'react-icons/fa';
import FoodCard from '../components/FoodCard';
import { sampleFoods, categories, spiceLevels, priceRanges, sortOptions, viewModes } from '../data/sampleFoods';
import axios from 'axios';

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        // Try to fetch from API first
        try {
          const response = await axios.get('/api/foods');
          // Handle both array response and object with foods property
          const foodsData = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.foods || response.data?.data || []);
          
          if (foodsData && foodsData.length > 0) {
            setFoods(foodsData);
            setFilteredFoods(foodsData);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('API fetch failed, using sample data...', apiError);
        }
        
        // Fallback to sample data if API fails or returns empty
        setFoods(sampleFoods);
        setFilteredFoods(sampleFoods);
      } catch (error) {
        console.error('Error fetching foods:', error);
        // Fallback to sample data on error
        setFoods(sampleFoods);
        setFilteredFoods(sampleFoods);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  // Filter and sort foods
  useEffect(() => {
    let filtered = [...foods];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(food => food.category === selectedCategory);
    }

    // Spice level filter
    if (selectedSpiceLevel !== 'all') {
      filtered = filtered.filter(food => food.spiceLevel === selectedSpiceLevel);
    }

    // Price range filter
    if (selectedPriceRange !== 'all') {
      const [min, max] = selectedPriceRange.split('-').map(Number);
      if (selectedPriceRange === '300+') {
        filtered = filtered.filter(food => food.discountedPrice >= 300);
      } else {
        filtered = filtered.filter(food => 
          food.discountedPrice >= min && food.discountedPrice <= max
        );
      }
    }

    // Sort foods
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b._id.localeCompare(a._id);
        case 'oldest':
          return a._id.localeCompare(b._id);
        case 'price-low':
          return a.discountedPrice - b.discountedPrice;
        case 'price-high':
          return b.discountedPrice - a.discountedPrice;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return b.numReviews - a.numReviews;
        case 'discount':
          return b.discount - a.discount;
        default:
          return 0;
      }
    });

    setFilteredFoods(filtered);
  }, [foods, searchTerm, selectedCategory, selectedSpiceLevel, selectedPriceRange, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedSpiceLevel('all');
    setSelectedPriceRange('all');
    setSortBy('newest');
  };

  const getFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory !== 'all') count++;
    if (selectedSpiceLevel !== 'all') count++;
    if (selectedPriceRange !== 'all') count++;
    if (sortBy !== 'newest') count++;
    return count;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading delicious foods...</p>
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
            Our <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Menu</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our delicious collection of snacks and sweets, crafted with love and authentic flavors
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for your favorite snacks and sweets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaTh className="inline mr-2" />
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaList className="inline mr-2" />
                List View
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaFilter />
              Filters
              {getFilterCount() > 0 && (
                <span className="bg-white text-purple-600 text-xs px-2 py-1 rounded-full font-bold">
                  {getFilterCount()}
                </span>
              )}
            </button>
          </div>

          {/* Quick Category Pills */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items ({foods.length})
            </button>
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon} {category.label} ({foods.filter(f => f.category === category.value).length})
              </button>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Spice Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spice Level</label>
                <select
                  value={selectedSpiceLevel}
                  onChange={(e) => setSelectedSpiceLevel(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="all">All Spice Levels</option>
                  {spiceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.icon} {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="all">All Prices</option>
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
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
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredFoods.length} of {foods.length} items
          </p>
          {getFilterCount() > 0 && (
            <button
              onClick={clearFilters}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
            >
              <FaTimes />
              Clear filters
            </button>
          )}
        </div>

        {/* Food Grid/List */}
        {filteredFoods.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredFoods.map((food) => (
              <FoodCard key={food._id} food={food} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
