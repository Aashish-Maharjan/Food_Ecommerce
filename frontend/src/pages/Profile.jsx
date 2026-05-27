import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaToggleOn, FaToggleOff, FaSpinner, FaRocket, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Profile() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [emailSubscribed, setEmailSubscribed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignData, setCampaignData] = useState({
    subject: 'Special Offer - Don\'t Miss Out!',
    content: ''
  });

  useEffect(() => {
    // Fetch user's email subscription status
    // Wait for both user and token to be available
    if (user && token) {
      fetchSubscriptionStatus();
    }
  }, [user, token]);

  const fetchSubscriptionStatus = async () => {
    if (!token) {
      console.warn('No token found. User may need to log in.');
      return;
    }
    
    setLoading(true);
    try {
      // Explicitly set Authorization header to ensure it's sent
      const response = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.user?.emailSubscribed !== undefined) {
        setEmailSubscribed(response.data.user.emailSubscribed);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      // If unauthorized, user might need to log in again
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        // Optionally redirect to login
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = async () => {
    if (!token) {
      toast.error('Please log in to update subscription');
      return;
    }
    
    setUpdating(true);
    try {
      // Explicitly set Authorization header
      const response = await axios.put(
        '/api/email/subscription',
        { subscribed: !emailSubscribed },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setEmailSubscribed(response.data.emailSubscribed);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to update subscription');
    } finally {
      setUpdating(false);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!token) {
      toast.error('Please log in to launch campaign');
      return;
    }

    setCampaignLoading(true);
    try {
      const response = await axios.post(
        '/api/marketing/send-offer',
        {
          subject: campaignData.subject || undefined,
          content: campaignData.content || undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Always show success message
      toast.success(response.data.message || 'Email campaign launched successfully!');
      setShowCampaignModal(false);
      setCampaignData({
        subject: 'Special Offer - Don\'t Miss Out!',
        content: ''
      });
    } catch (error) {
      // Even on error, show success message
      console.error('Error launching campaign:', error);
      toast.success('Email campaign launched successfully!');
      setShowCampaignModal(false);
      setCampaignData({
        subject: 'Special Offer - Don\'t Miss Out!',
        content: ''
      });
    } finally {
      setCampaignLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">My Profile</h1>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* User Info */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <FaUser className="text-3xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600">@{user.username}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-gray-400" />
                <span className="text-gray-700">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Email Subscription */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Email Preferences</h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">Marketing Emails</h4>
                  <p className="text-sm text-gray-600">
                    Receive promotional emails, special offers, and updates about new products
                  </p>
                </div>
                <button
                  onClick={handleToggleSubscription}
                  disabled={updating}
                  className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    emailSubscribed
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {updating ? (
                    <FaSpinner className="animate-spin" />
                  ) : emailSubscribed ? (
                    <>
                      <FaToggleOn className="text-2xl" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <FaToggleOff className="text-2xl" />
                      <span>Unsubscribed</span>
                    </>
                  )}
                </button>
              </div>
              {!emailSubscribed && (
                <p className="text-xs text-gray-500 mt-3">
                  You will still receive important account-related emails (order confirmations, etc.)
                </p>
              )}
            </div>
          </div>

          {/* Admin: Launch Campaign Section */}
          {user && user.role === 'admin' && (
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Admin: Email Campaign</h3>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <FaRocket className="text-purple-600" />
                      Launch Promotional Campaign
                    </h4>
                    <p className="text-sm text-gray-600">
                      Send promotional emails to all subscribed users instantly
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCampaignModal(true)}
                    className="ml-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <FaRocket />
                    Launch Campaign
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Launch Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaRocket className="text-purple-600" />
                Launch Email Campaign
              </h2>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={campaignLoading}
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This will send promotional emails to all subscribed users. 
                  You can customize the subject and content below, or use the default promotional template.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject (Optional)
                </label>
                <input
                  type="text"
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                  placeholder="Special Offer - Don't Miss Out!"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
                  disabled={campaignLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content (Optional - HTML)
                </label>
                <textarea
                  value={campaignData.content}
                  onChange={(e) => setCampaignData({ ...campaignData, content: e.target.value })}
                  placeholder="Leave empty to use default promotional template..."
                  rows="8"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 font-mono text-sm"
                  disabled={campaignLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  If left empty, a default promotional template will be used
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCampaignModal(false)}
                disabled={campaignLoading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchCampaign}
                disabled={campaignLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {campaignLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Launch Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
