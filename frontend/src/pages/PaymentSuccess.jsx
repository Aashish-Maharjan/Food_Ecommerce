import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaArrowLeft, FaBox, FaMapMarkerAlt, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log('PaymentSuccess: Starting payment verification');
        console.log('URL search params:', Object.fromEntries(searchParams.entries()));
        
        // eSewa sends data as base64 encoded JSON in 'data' parameter
        // OR as individual query parameters
        let esewaData = {};
        
        // Check if data is in base64 format
        const dataParam = searchParams.get('data');
        if (dataParam) {
          try {
            // Decode base64 and parse JSON
            const decodedData = atob(dataParam);
            esewaData = JSON.parse(decodedData);
            console.log('Decoded eSewa data:', esewaData);
          } catch (decodeError) {
            console.error('Error decoding eSewa data:', decodeError);
            // Fall back to individual parameters
            esewaData = {
              transaction_code: searchParams.get('transaction_code'),
              status: searchParams.get('status'),
              total_amount: searchParams.get('total_amount'),
              transaction_uuid: searchParams.get('transaction_uuid'),
              product_code: searchParams.get('product_code')
            };
          }
        } else {
          // Get parameters from URL (eSewa callback - individual params)
          esewaData = {
            transaction_code: searchParams.get('transaction_code'),
            status: searchParams.get('status'),
            total_amount: searchParams.get('total_amount'),
            transaction_uuid: searchParams.get('transaction_uuid'),
            product_code: searchParams.get('product_code')
          };
        }

        // Get transaction data from sessionStorage (if available)
        const pendingTransaction = sessionStorage.getItem('pendingTransaction');
        let transactionData = {};
        
        if (pendingTransaction) {
          try {
            transactionData = JSON.parse(pendingTransaction);
            console.log('Transaction data from sessionStorage:', transactionData);
          } catch (parseError) {
            console.error('Error parsing sessionStorage data:', parseError);
          }
        } else {
          console.warn('No transaction data in sessionStorage, using eSewa data only');
        }

        // Use transaction_uuid from eSewa response (preferred) or from sessionStorage
        const transaction_uuid = esewaData.transaction_uuid || transactionData.transaction_uuid;
        const product_id = transactionData.productId || esewaData.product_code || 'EPAYTEST';
        const amount = transactionData.amount || parseFloat(esewaData.total_amount) || 0;

        if (!transaction_uuid) {
          setError('Transaction UUID not found. Please contact support with transaction code: ' + (esewaData.transaction_code || 'N/A'));
          setVerifying(false);
          return;
        }

        console.log('Verifying payment with backend:', { product_id, transaction_uuid, amount });

        // Verify payment status with backend
        const response = await axios.post('/api/payment/payment-status', {
          product_id: product_id,
          transaction_uuid: transaction_uuid,
          amount: amount
        });

        console.log('Payment verification response:', response.data);

        if (response.data.success && response.data.transaction?.status === 'COMPLETE') {
          // Payment verified successfully
          setVerified(true);
          setOrder(response.data.order);
          setTransaction(response.data.transaction);
          
          // Clear pending transaction from sessionStorage
          if (pendingTransaction) {
            sessionStorage.removeItem('pendingTransaction');
          }
          
          // Clear cart
          clearCart();
          
          toast.success('Payment successful! Your order has been placed.');
        } else {
          const errorMsg = response.data.message || 'Payment verification failed';
          setError(errorMsg);
          toast.error(errorMsg + '. Please contact support.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setError(error.response?.data?.message || 'Failed to verify payment');
        toast.error('Failed to verify payment. Please contact support.');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment...</h2>
          <p className="text-gray-600">Please wait while we verify your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-5xl text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment has been verified and your order has been placed successfully.
          </p>
          {transaction && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-600">Transaction ID</p>
              <p className="text-lg font-semibold text-gray-800">{transaction.ref_id || transaction.transaction_uuid}</p>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <FaBox className="text-2xl text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-800">Order Details</h3>
            </div>

            {/* Order ID */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-xl font-semibold text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Items Ordered</h4>
              <div className="space-y-3">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        Rs. {((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                      </p>
                      {item.discountedPrice && item.discountedPrice < item.price && (
                        <p className="text-xs text-gray-500 line-through">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaMapMarkerAlt className="text-xl text-purple-600" />
                  <h4 className="text-lg font-semibold text-gray-800">Shipping Address</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 font-medium">{order.shippingAddress.street}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p className="text-gray-600">
                    {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                  </p>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (13% VAT)</span>
                    <span>Rs. {order.tax.toFixed(2)}</span>
                  </div>
                )}
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Rs. {order.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-purple-600">Rs. {order.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-800">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-purple-600 capitalize">{order.status || 'Processing'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View All Orders
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="flex-1 px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <FaArrowLeft />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

