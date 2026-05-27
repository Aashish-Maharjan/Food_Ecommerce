import { FaGift, FaClock, FaPercent, FaFire, FaStar, FaUtensils } from 'react-icons/fa';

export default function Offers() {
  const offers = [
    {
      id: 1,
      title: "New Customer Special",
      description: "Get 20% off on your first order! Use code: WELCOME20",
      discount: "20% OFF",
      validUntil: "2024-02-15",
      type: "new-customer",
      featured: true
    },
    {
      id: 2,
      title: "Weekend Feast",
      description: "Order any 3 main dishes and get 1 side dish absolutely free!",
      discount: "FREE SIDE",
      validUntil: "2024-01-31",
      type: "weekend",
      featured: false
    },
    {
      id: 3,
      title: "Family Pack Deal",
      description: "Order our family combo and save 25% on the total bill",
      discount: "25% OFF",
      validUntil: "2024-02-28",
      type: "family",
      featured: true
    },
    {
      id: 4,
      title: "Lunch Special",
      description: "All lunch orders between 11 AM - 2 PM get 15% discount",
      discount: "15% OFF",
      validUntil: "2024-01-31",
      type: "lunch",
      featured: false
    },
    {
      id: 5,
      title: "Bulk Order Bonus",
      description: "Order for 10+ people and get 30% discount plus free delivery",
      discount: "30% OFF",
      validUntil: "2024-02-15",
      type: "bulk",
      featured: true
    },
    {
      id: 6,
      title: "Student Discount",
      description: "Show your student ID and get 10% off on all orders",
      discount: "10% OFF",
      validUntil: "2024-06-30",
      type: "student",
      featured: false
    }
  ];

  const categories = [
    { name: "All Offers", icon: FaGift, count: offers.length },
    { name: "New Customer", icon: FaStar, count: offers.filter(o => o.type === 'new-customer').length },
    { name: "Weekend", icon: FaClock, count: offers.filter(o => o.type === 'weekend').length },
    { name: "Family", icon: FaUtensils, count: offers.filter(o => o.type === 'family').length },
    { name: "Lunch", icon: FaClock, count: offers.filter(o => o.type === 'lunch').length },
    { name: "Bulk", icon: FaFire, count: offers.filter(o => o.type === 'bulk').length },
    { name: "Student", icon: FaStar, count: offers.filter(o => o.type === 'student').length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Special <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Offers</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals and discounts on your favorite Nepali dishes. 
            Don't miss out on these limited-time offers!
          </p>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Browse by Category</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <category.icon className="text-green-600" />
                <span className="font-medium text-gray-700">{category.name}</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Offers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Featured Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.filter(offer => offer.featured).map((offer) => (
              <div key={offer.id} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <FaFire className="text-white text-xl" />
                  </div>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {offer.discount}
                  </span>
                  <div className="flex items-center gap-2 text-gray-500">
                    <FaClock className="text-sm" />
                    <span className="text-sm">Valid until {offer.validUntil}</span>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200">
                  Claim Offer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* All Offers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">All Available Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <FaGift className="text-white text-lg" />
                  </div>
                  {offer.featured && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{offer.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {offer.discount}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <FaClock className="text-xs" />
                    <span className="text-xs">{offer.validUntil}</span>
                  </div>
                </div>
                
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How to Use Our Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Browse Offers</h3>
              <p className="text-gray-600">Check out our current offers and choose the one that suits you best</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Place Order</h3>
              <p className="text-gray-600">Add your favorite dishes to cart and proceed to checkout</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Apply Code</h3>
              <p className="text-gray-600">Enter the offer code at checkout to get your discount</p>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Stay Updated with New Offers!</h2>
          <p className="mb-6 opacity-90">Subscribe to our newsletter and be the first to know about exclusive deals</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/20"
            />
            <button className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
