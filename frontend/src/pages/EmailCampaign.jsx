import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaUsers, FaPaperPlane, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaEye, FaEyeSlash, FaRocket, FaSearch, FaCheckSquare, FaSquare } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function EmailCampaign() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    campaignType: 'promotional',
    testMode: false, // Changed to false - admin can select specific users
    sendToAll: false // New option to send to all subscribed users
  });
  const [preview, setPreview] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    // Fetch email statistics and users
    fetchStats();
    fetchUsers();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      if (!token) {
        toast.error('Please log in to view statistics');
        return;
      }
      const response = await axios.get('/api/email/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to load email statistics');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      if (!token) {
        return;
      }
      const response = await axios.get('/api/email/users?subscribedOnly=true');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to load users');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.content.length < 50) {
      toast.error('Email content must be at least 50 characters');
      return;
    }

    // Determine target emails
    let targetEmails = [];
    if (formData.sendToAll) {
      // Send to all subscribed users
      targetEmails = [];
    } else if (selectedEmails.length > 0) {
      // Send to selected emails only
      targetEmails = selectedEmails;
    } else {
      toast.error('Please select at least one user or choose "Send to All Subscribed Users"');
      return;
    }

    // Confirm before sending
    const recipientCount = formData.sendToAll 
      ? stats?.subscribedUsers || 0 
      : selectedEmails.length;
    
    const confirmMessage = `Launch email campaign to ${recipientCount} ${recipientCount === 1 ? 'user' : 'users'}? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSending(true);
    setResults(null);

    try {
      if (!token) {
        toast.error('Please log in to send emails');
        setSending(false);
        return;
      }
      
      const payload = {
        ...formData,
        targetEmails: formData.sendToAll ? [] : targetEmails
      };
      
      const response = await axios.post('/api/email/send-marketing', payload);

      setResults(response.data.results);
      toast.success(response.data.message);
      
      // Reset form after successful send
      setFormData({
        subject: '',
        content: '',
        campaignType: 'promotional',
        testMode: false,
        sendToAll: false
      });
      setSelectedEmails([]);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.response?.data?.message || 'Failed to send marketing emails');
    } finally {
      setSending(false);
    }
  };

  // Email templates
  const templates = {
    promotional: {
      subject: 'Special Offer - Get 20% Off Your Next Order!',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed; text-align: center;">🎉 Special Offer Just For You!</h2>
          <p>Hi there,</p>
          <p>We're excited to offer you <strong>20% off</strong> on your next order!</p>
          <p>Use code: <strong style="color: #7c3aed; font-size: 18px;">SAVE20</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/menu" 
               style="background-color: #7c3aed; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Shop Now
            </a>
          </div>
          <p>This offer is valid for a limited time only. Don't miss out!</p>
          <p>Best regards,<br>The Food Ecommerce Team</p>
        </div>
      `
    },
    newsletter: {
      subject: 'Monthly Newsletter - New Products & Updates',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed; text-align: center;">📰 Monthly Newsletter</h2>
          <p>Hi there,</p>
          <p>Here's what's new this month:</p>
          <ul>
            <li>New delicious items added to our menu</li>
            <li>Special festival offers coming soon</li>
            <li>Customer reviews and ratings</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/menu" 
               style="background-color: #7c3aed; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Explore Menu
            </a>
          </div>
          <p>Thank you for being a valued customer!</p>
          <p>Best regards,<br>The Food Ecommerce Team</p>
        </div>
      `
    },
    'special-offer': {
      subject: 'Festival Special - Exclusive Discounts!',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed; text-align: center;">🎊 Festival Special Offer!</h2>
          <p>Hi there,</p>
          <p>Celebrate with us! Get exclusive festival discounts on all your favorite foods.</p>
          <p><strong>Special Offer:</strong> Get 25% off on orders above Rs. 1000</p>
          <p>Use code: <strong style="color: #7c3aed; font-size: 18px;">FESTIVAL25</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/menu" 
               style="background-color: #7c3aed; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Order Now
            </a>
          </div>
          <p>Happy celebrations!</p>
          <p>Best regards,<br>The Food Ecommerce Team</p>
        </div>
      `
    }
  };

  const loadTemplate = (type) => {
    if (templates[type]) {
      setFormData(prev => ({
        ...prev,
        subject: templates[type].subject,
        content: templates[type].content
      }));
      toast.success('Template loaded!');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower)
    );
  });

  if (user && user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FaEnvelope className="text-purple-600" />
            Email Marketing Campaign
          </h1>
          <p className="text-gray-600">Send promotional emails to subscribed users</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Statistics Cards */}
          {stats && (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <FaUsers className="text-2xl text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Subscribed Users</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.subscribedUsers || 0}</p>
                <p className="text-sm text-gray-500 mt-1">out of {stats.totalUsers || 0} total users</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <FaEnvelope className="text-2xl text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Unsubscribed</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.unsubscribedUsers || 0}</p>
                <p className="text-sm text-gray-500 mt-1">users opted out</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <FaUsers className="text-2xl text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">New Users</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.newUsers || 0}</p>
                <p className="text-sm text-gray-500 mt-1">registered in last 7 days</p>
              </div>
            </>
          )}
        </div>

        {/* Email Campaign Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type
              </label>
              <select
                name="campaignType"
                value={formData.campaignType}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
              >
                <option value="promotional">Promotional</option>
                <option value="newsletter">Newsletter</option>
                <option value="special-offer">Special Offer</option>
                <option value="event">Event</option>
              </select>
            </div>

            {/* Template Quick Load */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadTemplate('promotional')}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Promotional
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('newsletter')}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Newsletter
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('special-offer')}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Special Offer
                </button>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="Enter email subject..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.subject.length}/200 characters</p>
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Content (HTML) *
                </label>
                <button
                  type="button"
                  onClick={() => setPreview(!preview)}
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                >
                  {preview ? <FaEyeSlash /> : <FaEye />}
                  {preview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              {preview ? (
                <div 
                  className="w-full min-h-[400px] p-4 border-2 border-gray-200 rounded-xl bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              ) : (
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={15}
                  placeholder="Enter HTML email content... (You can use HTML tags)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 font-mono text-sm"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length} characters (minimum 50 required)
              </p>
            </div>

            {/* Recipient Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Recipients
              </label>
              
              {/* Send to All Option */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <input
                  type="checkbox"
                  name="sendToAll"
                  id="sendToAll"
                  checked={formData.sendToAll}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, sendToAll: e.target.checked }));
                    if (e.target.checked) {
                      setSelectedEmails([]);
                    }
                  }}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="sendToAll" className="flex-1 cursor-pointer">
                  <span className="font-semibold text-blue-800">Send to All Subscribed Users</span>
                  <p className="text-sm text-blue-700">
                    Send to all {stats?.subscribedUsers || 0} subscribed users
                  </p>
                </label>
              </div>

              {/* OR Select Specific Users */}
              {!formData.sendToAll && (
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">Select Specific Users</h4>
                      <p className="text-sm text-gray-600">
                        {selectedEmails.length} user{selectedEmails.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUserSelection(!showUserSelection)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
                    >
                      {showUserSelection ? 'Hide' : 'Show'} User List
                    </button>
                  </div>

                  {showUserSelection && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {/* Search */}
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
                        />
                      </div>

                      {/* Select All / Deselect All */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = filteredUsers.map(u => u.email);
                            setSelectedEmails(filtered);
                          }}
                          className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedEmails([])}
                          className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Deselect All
                        </button>
                      </div>

                      {/* User List */}
                      <div className="space-y-2">
                        {filteredUsers.map((user) => (
                          <label
                            key={user._id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedEmails.includes(user.email)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmails([...selectedEmails, user.email]);
                                } else {
                                  setSelectedEmails(selectedEmails.filter(email => email !== user.email));
                                }
                              }}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                            {user.emailSubscribed && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                Subscribed
                              </span>
                            )}
                          </label>
                        ))}
                        {filteredUsers.length === 0 && (
                          <p className="text-center text-gray-500 py-4">No users found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Launch Campaign Button */}
            <button
              type="submit"
              disabled={
                sending || 
                !formData.subject.trim() || 
                formData.content.length < 50 ||
                (!formData.sendToAll && selectedEmails.length === 0)
              }
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {sending ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Launching Campaign...
                </>
              ) : (
                <>
                  <FaRocket />
                  Launch Email Campaign
                </>
              )}
            </button>
            
            {!formData.sendToAll && selectedEmails.length === 0 && (
              <p className="text-sm text-red-600 text-center">
                Please select at least one user or choose "Send to All Subscribed Users"
              </p>
            )}
          </form>

          {/* Results */}
          {results && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                Campaign Results
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-800">{results.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-green-600">{results.sent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                </div>
              </div>
              {results.errors && results.errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-800 mb-2">Errors:</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {results.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {results.errors.length > 5 && (
                      <li>... and {results.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
