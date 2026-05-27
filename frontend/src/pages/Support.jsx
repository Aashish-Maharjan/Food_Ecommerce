import { FaHeadset, FaQuestionCircle, FaPhone, FaEnvelope, FaComments, FaBook, FaVideo, FaFileAlt } from 'react-icons/fa';
import { useState } from 'react';

export default function Support() {
  const [activeTab, setActiveTab] = useState('faq');

  const faqs = [
    {
      question: "How do I place an order?",
      answer: "You can place orders through our website, mobile app, or by calling us directly. Simply browse our menu, add items to your cart, and proceed to checkout."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash on delivery, credit/debit cards, mobile wallets (eSewa, Khalti), and online banking. All online payments are secure and encrypted."
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery takes 30-45 minutes. For larger orders or during peak hours, it may take up to 60 minutes. We'll keep you updated on your order status."
    },
    {
      question: "What if my food arrives cold or incorrect?",
      answer: "We take food quality seriously. If you're not satisfied, please contact us immediately. We'll either replace your order or provide a full refund."
    },
    {
      question: "Do you offer catering services?",
      answer: "Yes! We provide catering for events, parties, and corporate functions. Please contact us at least 24 hours in advance for catering orders."
    },
    {
      question: "Can I modify my order after placing it?",
      answer: "You can modify your order within 5 minutes of placing it. After that, please call us directly and we'll do our best to accommodate changes."
    }
  ];

  const helpTopics = [
    {
      title: "Ordering & Payment",
      icon: FaQuestionCircle,
      description: "Learn how to place orders and make payments",
      articles: ["How to Place an Order", "Payment Methods", "Order Tracking", "Cancellation Policy"]
    },
    {
      title: "Delivery & Pickup",
      icon: FaPhone,
      description: "Information about delivery areas and pickup options",
      articles: ["Delivery Areas", "Delivery Times", "Pickup Locations", "Delivery Charges"]
    },
    {
      title: "Account & Profile",
      icon: FaComments,
      description: "Manage your account and profile settings",
      articles: ["Creating an Account", "Updating Profile", "Password Reset", "Privacy Settings"]
    },
    {
      title: "Returns & Refunds",
      icon: FaBook,
      description: "Our return and refund policies",
      articles: ["Return Policy", "Refund Process", "Quality Issues", "Contact Support"]
    }
  ];

  const contactMethods = [
    {
      title: "Phone Support",
      icon: FaPhone,
      description: "Speak with our customer service team",
      contact: "+977-1-4444444",
      available: "24/7",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Email Support",
      icon: FaEnvelope,
      description: "Send us an email and we'll respond within 2 hours",
      contact: "support@foodienepal.com",
      available: "24/7",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Live Chat",
      icon: FaComments,
      description: "Chat with our support team in real-time",
      contact: "Available on website",
      available: "9 AM - 10 PM",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "WhatsApp",
      icon: FaPhone,
      description: "Message us on WhatsApp for quick support",
      contact: "+977-985-1234567",
      available: "24/7",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Customer <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Support</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help! Find answers to common questions, get help with your orders, 
            or contact our support team for personalized assistance.
          </p>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <method.icon className="text-white text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{method.title}</h3>
              <p className="text-gray-600 text-sm mb-3 text-center">{method.description}</p>
              <div className="text-center">
                <p className="font-medium text-gray-800 mb-1">{method.contact}</p>
                <p className="text-sm text-gray-500">Available: {method.available}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Help Topics */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Help Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {helpTopics.map((topic, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <topic.icon className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{topic.title}</h3>
                    <p className="text-gray-600 text-sm">{topic.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {topic.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      <a href="#" className="text-green-600 hover:text-green-700 text-sm hover:underline">
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Self-Service Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Self-Service Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBook className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Help Center</h3>
              <p className="text-gray-600 mb-4">Browse our comprehensive help articles and guides</p>
              <button className="bg-blue-100 text-blue-700 px-6 py-2 rounded-xl font-medium hover:bg-blue-200 transition-colors duration-200">
                Visit Help Center
              </button>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaVideo className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Video Tutorials</h3>
              <p className="text-gray-600 mb-4">Watch step-by-step video guides for common tasks</p>
              <button className="bg-green-100 text-green-700 px-6 py-2 rounded-xl font-medium hover:bg-green-200 transition-colors duration-200">
                Watch Videos
              </button>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFileAlt className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Download Guides</h3>
              <p className="text-gray-600 mb-4">Download PDF guides and user manuals</p>
              <button className="bg-purple-100 text-purple-700 px-6 py-2 rounded-xl font-medium hover:bg-purple-200 transition-colors duration-200">
                Download PDFs
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Still Need Help?</h2>
          <p className="text-center text-gray-600 mb-8">
            Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
          </p>
          <form className="max-w-2xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
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
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter your email address"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                id="subject"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
              >
                <option value="">Select a topic</option>
                <option value="order">Order Issue</option>
                <option value="payment">Payment Problem</option>
                <option value="delivery">Delivery Issue</option>
                <option value="account">Account Problem</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                rows={5}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 resize-none"
                placeholder="Describe your issue or question in detail..."
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
