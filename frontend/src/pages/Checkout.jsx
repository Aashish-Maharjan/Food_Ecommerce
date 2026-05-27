import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCreditCard, FaTruck, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowLeft, FaSpinner, FaWallet, FaMobileAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, getCartSummary, clearCart, isCartEmpty } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cash'
  });

  const cartSummary = getCartSummary();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isCartEmpty()) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setLoading(true);
    try {
      // If payment method is cash on delivery
      if (formData.paymentMethod === 'cash') {
        // TODO: Implement COD order creation
        await new Promise(resolve => setTimeout(resolve, 2000));
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/orders');
        return;
      }

      // If payment method is eSewa
      if (formData.paymentMethod === 'esewa') {
        // Generate unique product ID for this order
        // Use import.meta.env for Vite (not process.env)
        const productId = import.meta.env.VITE_ESEWA_PRODUCT_CODE || 'EPAYTEST';
        const totalAmount = cartSummary.total;

        // Initiate eSewa payment
        const response = await axios.post('/api/payment/initiate-payment', {
          amount: totalAmount,
          productId: productId,
          type: 'order',
          metadata: {
            cartItems: cart.map(item => ({
              foodId: item._id,
              name: item.name,
              quantity: item.quantity,
              price: item.discount > 0 ? item.discountedPrice : item.price
            })),
            shippingAddress: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              postalCode: formData.postalCode
            },
            cartSummary: cartSummary
          }
        });

        if (response.data.success && response.data.url) {
          // Store transaction info in sessionStorage for verification
          sessionStorage.setItem('pendingTransaction', JSON.stringify({
            transactionId: response.data.transactionId,
            transaction_uuid: response.data.transaction_uuid,
            amount: totalAmount,
            productId: productId,
            shippingAddress: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              postalCode: formData.postalCode
            },
            cartItems: cart
          }));

          // Redirect to eSewa payment page
          window.location.href = response.data.url;
        } else {
          const errorMsg = response.data.message || response.data.error || 'Failed to initiate payment';
          toast.error(errorMsg);
          if (response.data.details) {
            console.error('Payment error details:', response.data.details);
          }
          setLoading(false);
        }
        return;
      }

      // For other payment methods (Khalti, etc.)
      toast.info('Payment method not yet implemented');
      setLoading(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Failed to process checkout. Please try again.';
      toast.error(errorMsg);
      console.error('Checkout error:', error);
      if (error.response?.data?.details) {
        console.error('Error details:', error.response.data.details);
      }
      setLoading(false);
    }
  };

  if (isCartEmpty()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 text-lg mb-8">
              Add items to your cart before checkout.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaArrowLeft />
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors mb-4"
          >
            <FaArrowLeft />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Delivery Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FaTruck className="text-purple-600" />
                  Delivery Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                      placeholder="Street address, apartment, suite, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FaCreditCard className="text-purple-600" />
                  Payment Method
                </h2>
                
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.paymentMethod === 'cash' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <FaTruck className="text-2xl text-purple-600" />
                      <div>
                        <span className="font-semibold text-gray-800 block">Cash on Delivery</span>
                        <span className="text-sm text-gray-500">Pay when you receive your order</span>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.paymentMethod === 'esewa' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="esewa"
                      checked={formData.paymentMethod === 'esewa'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <FaMobileAlt className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-800 block">eSewa</span>
                        <span className="text-sm text-gray-500">Pay securely with your eSewa wallet</span>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.paymentMethod === 'khalti' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="khalti"
                      checked={formData.paymentMethod === 'khalti'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <FaWallet className="text-2xl text-purple-600" />
                      <div>
                        <span className="font-semibold text-gray-800 block">Khalti</span>
                        <span className="text-sm text-gray-500">Pay with Khalti wallet</span>
                      </div>
                    </div>
                  </label>
                </div>
                
                {/* eSewa Payment Button - Shows when eSewa is selected */}
                {formData.paymentMethod === 'esewa' && (
                  <div className="mt-4 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-purple-50 rounded-xl border-2 border-green-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1 text-lg">Pay with eSewa</h3>
                        <p className="text-sm text-gray-600">Secure and instant payment via eSewa wallet</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaMobileAlt />
                            Pay with eSewa
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button - Only show for non-eSewa payments */}
              {formData.paymentMethod !== 'esewa' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Processing Order...
                    </div>
                  ) : (
                    formData.paymentMethod === 'cash' ? 'Place Order (Cash on Delivery)' : 'Place Order'
                  )}
                </button>
              )}
              
              {/* Info message for eSewa */}
              {formData.paymentMethod === 'esewa' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 text-center">
                    <FaMobileAlt className="inline mr-2" />
                    Click the "Pay with eSewa" button above to proceed with payment
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 pb-3 border-b border-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-800">
                        Rs. {((item.discount > 0 ? item.discountedPrice : item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-200" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">Rs. {cartSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {cartSummary.hasFreeShipping ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `Rs. ${cartSummary.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>Rs. {cartSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

