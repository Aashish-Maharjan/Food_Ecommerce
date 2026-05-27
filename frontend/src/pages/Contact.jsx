import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Get in <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions, feedback, or just want to say hello? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Our Location</h3>
                    <p className="text-gray-600">Thamel, Kathmandu, Nepal</p>
                    <p className="text-gray-600">Near the famous Thamel Chowk</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Phone Numbers</h3>
                    <p className="text-gray-600">+977-1-4444444</p>
                    <p className="text-gray-600">+977-985-1234567 (Mobile)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email Address</h3>
                    <p className="text-gray-600">info@foodienepal.com</p>
                    <p className="text-gray-600">support@foodienepal.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Business Hours</h3>
                    <p className="text-gray-600">Monday - Sunday: 8:00 AM - 10:00 PM</p>
                    <p className="text-gray-600">24/7 Online Ordering Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Follow Us</h2>
              <div className="grid grid-cols-2 gap-4">
                <a href="#" className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200">
                  <FaFacebook className="text-blue-600 text-xl" />
                  <span className="font-medium text-blue-600">Facebook</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-4 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors duration-200">
                  <FaTwitter className="text-sky-600 text-xl" />
                  <span className="font-medium text-sky-600">Twitter</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-4 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors duration-200">
                  <FaInstagram className="text-pink-600 text-xl" />
                  <span className="font-medium text-pink-600">Instagram</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200">
                  <FaLinkedin className="text-blue-600 text-xl" />
                  <span className="font-medium text-blue-600">LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Find Us</h2>
              <div className="bg-gray-200 rounded-xl h-48 flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="text-gray-400 text-4xl mx-auto mb-2" />
                  <p className="text-gray-500">Interactive Map Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I place an order?</h3>
              <p className="text-gray-600">You can place orders through our website, mobile app, or by calling us directly. We accept various payment methods including cash on delivery.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What are your delivery areas?</h3>
              <p className="text-gray-600">We currently deliver to Kathmandu Valley and surrounding areas. Delivery charges vary based on distance.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How long does delivery take?</h3>
              <p className="text-gray-600">Standard delivery takes 30-45 minutes. For larger orders or during peak hours, it may take up to 60 minutes.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Do you offer catering services?</h3>
              <p className="text-gray-600">Yes! We provide catering for events, parties, and corporate functions. Please contact us at least 24 hours in advance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
