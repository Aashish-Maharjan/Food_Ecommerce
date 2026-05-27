import { FaUtensils, FaHeart, FaUsers, FaAward, FaLeaf, FaGlobe } from 'react-icons/fa';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            About <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">FoodieNepal</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're passionate about bringing the authentic flavors of Nepal to your doorstep, 
            connecting people through the universal language of delicious food.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
              <FaHeart className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To preserve and share the rich culinary heritage of Nepal while making authentic, 
              delicious food accessible to everyone. We believe that food has the power to bring 
              people together and create lasting memories.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <FaGlobe className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To become the leading platform for authentic Nepali cuisine worldwide, 
              celebrating our culture through food and creating a community of food lovers 
              who appreciate the art of traditional cooking.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUtensils className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Authenticity</h3>
              <p className="text-gray-600">We stay true to traditional recipes and cooking methods</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLeaf className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality</h3>
              <p className="text-gray-600">Only the finest ingredients make it to your plate</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Community</h3>
              <p className="text-gray-600">Building connections through shared culinary experiences</p>
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Story</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-600 leading-relaxed mb-4">
                FoodieNepal was born from a simple yet powerful idea: to share the authentic 
                flavors of Nepal with the world. Our founder, a passionate chef from Kathmandu, 
                realized that while Nepali cuisine was gaining popularity, many people were 
                missing out on the true essence of traditional dishes.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                What started as a small family kitchen has grown into a beloved platform 
                that connects food lovers with the rich culinary traditions of Nepal. 
                Every dish we serve tells a story of heritage, culture, and love for food.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we're proud to serve thousands of customers, bringing the warmth 
                and hospitality of Nepal to every meal we deliver.
              </p>
            </div>
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Nepali Kitchen"
                className="rounded-xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-gray-600">Authentic Dishes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">5+</div>
            <div className="text-gray-600">Years of Service</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
            <div className="text-gray-600">Customer Support</div>
          </div>
        </div>

        {/* Team */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Meet Our Team</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team of passionate chefs, food enthusiasts, and customer service experts 
            work together to ensure every meal exceeds your expectations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaAward className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Master Chefs</h3>
              <p className="text-gray-600">Experienced culinary experts with deep knowledge of Nepali cuisine</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Service Team</h3>
              <p className="text-gray-600">Dedicated professionals ensuring smooth delivery and customer satisfaction</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeart className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Control</h3>
              <p className="text-gray-600">Rigorous standards to maintain the highest quality in every dish</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
