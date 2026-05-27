import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaTimesCircle, FaArrowLeft, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function PaymentFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get failure reason from URL
    const reason = searchParams.get('reason') || 'Payment was cancelled or failed';
    toast.error(reason);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-16">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTimesCircle className="text-5xl text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-2">
            {searchParams.get('reason') || 'Your payment could not be processed.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please try again or choose a different payment method.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <FaRedo />
              Try Again
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="w-full px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <FaArrowLeft />
              Back to Cart
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

