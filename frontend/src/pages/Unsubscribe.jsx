import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Unsubscribe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = async () => {
      const email = searchParams.get('email');
      const token = searchParams.get('token');

      if (!email) {
        setError('Email parameter is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post('/api/email/unsubscribe', {
          email: decodeURIComponent(email),
          token
        });

        if (response.data.success) {
          setSuccess(true);
          toast.success('Successfully unsubscribed from marketing emails');
        } else {
          setError(response.data.message || 'Failed to unsubscribe');
        }
      } catch (error) {
        console.error('Unsubscribe error:', error);
        setError(error.response?.data?.message || 'Failed to unsubscribe. Please try again.');
        toast.error('Failed to unsubscribe');
      } finally {
        setLoading(false);
      }
    };

    unsubscribe();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing...</h2>
          <p className="text-gray-600">Please wait while we process your request</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-16">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTimesCircle className="text-5xl text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Unsubscribe Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-16">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-5xl text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Successfully Unsubscribed</h2>
            <p className="text-gray-600 mb-6">
              You have been unsubscribed from marketing emails. You will no longer receive promotional emails from us.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You can still receive important account-related emails (order confirmations, etc.)
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Go Home
              </button>
              <button
                onClick={() => navigate('/menu')}
                className="w-full px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

