// Note: esewajs library has bugs, so we implement eSewa integration directly
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const crypto = require('crypto');
const axios = require('axios');

/**
 * Generate HMAC SHA256 signature for eSewa
 * @param {string} message - The message to sign
 * @param {string} secretKey - The secret key
 * @returns {string} Base64 encoded signature
 */
const generateSignature = (message, secretKey) => {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('base64');
};

/**
 * Initiate eSewa payment
 * @route POST /api/payments/initiate-payment
 * @access Private/Public
 */
const EsewaInitiatePayment = async (req, res) => {
  try {
    const { amount, productId, orderId, metadata } = req.body;
    
    console.log('Payment initiation request:', {
      amount,
      productId,
      hasOrderId: !!orderId,
      hasMetadata: !!metadata
    });
    
    // Validate required fields
    if (!amount || !productId) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount and productId are required',
        received: { amount: !!amount, productId: !!productId }
      });
    }
    
    // Validate amount is a positive number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
        received: amount
      });
    }

    // Generate unique transaction UUID
    const transaction_uuid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get environment variables
    const merchantId = process.env.MERCHANT_ID || process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
    const secret = process.env.SECRET || process.env.ESEWA_SECRET || '8gBm/:&EnhH.1/q(';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = process.env.SUCCESS_URL || process.env.ESEWA_SUCCESS_URL || `${frontendUrl}/payment/success`;
    const failureUrl = process.env.FAILURE_URL || process.env.ESEWA_FAILURE_URL || `${frontendUrl}/payment/failure`;
    const esewaUrl = process.env.ESEWAPAYMENT_URL || process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

    // Calculate tax and delivery charges (if needed)
    const tax_amount = 0;
    const product_service_charge = 0;
    const product_delivery_charge = 0;
    
    // Round amount to 2 decimal places (eSewa requires whole numbers or max 2 decimals)
    // Also ensure it's a valid number
    const baseAmount = parseFloat(amount);
    if (isNaN(baseAmount) || baseAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount provided'
      });
    }
    
    // Round to 2 decimal places
    const total_amount = Math.round(baseAmount * 100) / 100;

    // Calculate total amount first (before signature generation)
    const roundedTax = Math.round(tax_amount * 100) / 100;
    const roundedService = Math.round(product_service_charge * 100) / 100;
    const roundedDelivery = Math.round(product_delivery_charge * 100) / 100;
    const calculated_total_amount = Math.round((total_amount + roundedTax + roundedService + roundedDelivery) * 100) / 100;
    
    // Create signature
    // According to eSewa docs: signed_field_names should be: total_amount,transaction_uuid,product_code
    // IMPORTANT: Use calculated_total_amount (not base amount) for signature
    const signedFieldNames = 'total_amount,transaction_uuid,product_code';
    const message = `total_amount=${calculated_total_amount},transaction_uuid=${transaction_uuid},product_code=${productId}`;
    const signature = generateSignature(message, secret);

    // Call eSewa payment gateway directly (esewajs library has bugs)
    // Following eSewa official documentation: https://developer.esewa.com.np/pages/Epay
    let reqPayment;
    try {
      // Prepare payment data according to eSewa documentation
      // Note: calculated_total_amount was already calculated above for signature
      // eSewa expects amounts as numbers (not strings) and may require specific format
      // Convert to string with max 2 decimal places for form submission
      const formatAmount = (amt) => {
        const rounded = Math.round(amt * 100) / 100;
        // Return as number, but ensure it's properly formatted
        return rounded;
      };
      
      // According to eSewa documentation, merchant_id might be required in some cases
      // But for the form submission, it's usually not needed as it's in the URL
      // However, let's ensure all required fields are present
      const paymentData = {
        amount: formatAmount(total_amount),
        tax_amount: formatAmount(roundedTax),
        total_amount: formatAmount(calculated_total_amount),
        transaction_uuid: transaction_uuid,
        product_code: productId,
        product_service_charge: formatAmount(roundedService),
        product_delivery_charge: formatAmount(roundedDelivery),
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        success_url: successUrl,
        failure_url: failureUrl,
        signature: signature // We already generated this above
      };
      
      // Note: merchant_id is typically not sent in the form data for v2 API
      // It's usually part of the URL or handled by eSewa's system
      
      // Validate that total_amount matches the sum
      const expectedTotal = total_amount + roundedTax + roundedService + roundedDelivery;
      if (Math.abs(calculated_total_amount - expectedTotal) > 0.01) {
        console.warn('Total amount mismatch:', { calculated_total_amount, expectedTotal });
      }
      
      console.log('Payment data (amounts rounded):', {
        amount: paymentData.amount,
        tax_amount: paymentData.tax_amount,
        product_service_charge: paymentData.product_service_charge,
        product_delivery_charge: paymentData.product_delivery_charge,
        total_amount: paymentData.total_amount,
        transaction_uuid: paymentData.transaction_uuid,
        product_code: paymentData.product_code,
        success_url: paymentData.success_url,
        failure_url: paymentData.failure_url,
        signed_field_names: paymentData.signed_field_names
      });
      
      console.log('Sending payment request to eSewa:', {
        url: esewaUrl,
        data: { ...paymentData, signature: '[REDACTED]' }
      });
      
      // Make POST request to eSewa payment gateway
      // According to eSewa docs, we need to send form data
      // eSewa returns a redirect (302) with the payment URL in Location header
      const formData = new URLSearchParams();
      Object.keys(paymentData).forEach(key => {
        // Convert numbers to strings for URL encoding
        const value = paymentData[key];
        formData.append(key, typeof value === 'number' ? value.toString() : value);
      });
      
      reqPayment = await axios.post(esewaUrl, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0, // Don't follow redirects automatically
        validateStatus: function (status) {
          // Accept 302 redirect status (eSewa returns redirect to payment page)
          return status >= 200 && status < 400;
        }
      });
      
      console.log('eSewa response status:', reqPayment.status);
      console.log('eSewa response headers:', reqPayment.headers);
      
    } catch (gatewayError) {
      console.error('EsewaPaymentGateway error:', gatewayError);
      console.error('Error response data:', gatewayError.response?.data);
      console.error('Error stack:', gatewayError.stack);
      
      // Check if it's an error response from eSewa
      if (gatewayError.response) {
        const status = gatewayError.response.status;
        const errorData = gatewayError.response.data;
        
        // If it's a redirect, that's what we want
        if (status === 302 || status === 301 || status === 307 || status === 308) {
          reqPayment = gatewayError.response;
        } else {
          // It's an actual error from eSewa
          return res.status(400).json({
            success: false,
            message: errorData?.message || 'Error calling eSewa payment gateway',
            error: errorData?.code || gatewayError.message,
            details: errorData
          });
        }
      } else {
        return res.status(500).json({
          success: false,
          message: 'Error calling eSewa payment gateway',
          error: gatewayError.message || 'Unknown gateway error'
        });
      }
    }

    if (!reqPayment) {
      console.error('No payment response received from eSewa');
      return res.status(400).json({
        success: false,
        message: 'Error sending payment data to eSewa',
        error: 'No response received from payment gateway'
      });
    }

    // Extract redirect URL from eSewa response
    // eSewa returns a 302 redirect, so we need to get the location header
    let responseUrl = null;
    let responseStatus = reqPayment?.status || reqPayment?.statusCode;
    
    // Check for redirect location in headers
    if (reqPayment && reqPayment.headers) {
      responseUrl = reqPayment.headers.location || 
                   reqPayment.headers.Location ||
                   reqPayment.headers['location'];
    }
    
    // Also check in response data if it's a form submission response
    if (!responseUrl && reqPayment && reqPayment.data) {
      // Sometimes eSewa returns HTML form, we need to extract action URL
      if (typeof reqPayment.data === 'string' && reqPayment.data.includes('form')) {
        const formMatch = reqPayment.data.match(/action=["']([^"']+)["']/i);
        if (formMatch) {
          responseUrl = formMatch[1];
        }
      } else if (reqPayment.data.url) {
        responseUrl = reqPayment.data.url;
      }
    }
    
    // Fallback: check request response URL
    if (!responseUrl && reqPayment && reqPayment.request) {
      responseUrl = reqPayment.request.res?.responseUrl || 
                   reqPayment.request.res?.headers?.location;
    }

    console.log('Response URL:', responseUrl);
    console.log('Response Status:', responseStatus);

    // eSewa typically returns 302 redirect, so status 302 or 200 with location header is success
    if ((responseStatus === 200 || responseStatus === 302 || responseStatus === 301) && responseUrl) {
      // Create transaction record
      const transaction = new Transaction({
        product_id: productId,
        transaction_uuid: transaction_uuid,
        amount: total_amount,
        user: req.user ? req.user._id : undefined,
        type: req.body.type || 'order',
        paymentMethod: 'esewa',
        status: 'PENDING',
        metadata: {
          ...metadata,
          orderId: orderId || null,
          tax_amount,
          product_service_charge,
          product_delivery_charge
        },
        order: orderId || null
      });

      await transaction.save();
      
      console.log('Transaction created:', transaction._id);
      
      return res.status(200).json({
        success: true,
        url: responseUrl,
        transactionId: transaction._id,
        transaction_uuid: transaction_uuid
      });
    } else {
      // Log detailed error information
      console.error('Failed to extract payment URL from eSewa response:', {
        status: responseStatus,
        hasUrl: !!responseUrl,
        response: reqPayment?.data || reqPayment?.response?.data,
        headers: reqPayment?.headers
      });
      
      return res.status(400).json({
        success: false,
        message: 'Failed to initiate payment',
        error: reqPayment?.error || reqPayment?.response?.data?.message || 'Could not extract payment URL from eSewa response',
        details: reqPayment?.response?.data || { status: responseStatus, hasUrl: !!responseUrl }
      });
    }
  } catch (error) {
    console.error('Error initiating eSewa payment:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error sending payment data',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Check payment status
 * @route POST /api/payments/payment-status
 * @access Private/Public
 */
const paymentStatus = async (req, res) => {
  try {
    const { product_id, transaction_uuid, amount } = req.body;

    // Find transaction
    const transaction = await Transaction.findOne({
      $or: [
        { product_id },
        { transaction_uuid }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Get environment variables
    const merchantId = process.env.MERCHANT_ID || process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
    const statusCheckUrl = process.env.ESEWAPAYMENT_STATUS_CHECK_URL || process.env.ESEWA_STATUS_CHECK_URL || 'https://rc.esewa.com.np/api/epay/transaction/status/';

    // Check payment status with eSewa directly (esewajs library has bugs)
    // Following eSewa official documentation: https://developer.esewa.com.np/pages/Epay#statuscheck
    let paymentStatusCheck;
    try {
      // Get product_code from transaction metadata or use transaction product_id
      const productCode = transaction.metadata?.product_code || transaction.product_id || 'EPAYTEST';
      
      // Prepare status check parameters according to eSewa documentation
      const statusCheckParams = {
        product_code: productCode,
        total_amount: transaction.amount,
        transaction_uuid: transaction.transaction_uuid
      };
      
      console.log('Checking payment status with eSewa:', statusCheckParams);
      
      // Make GET request to eSewa status check API
      paymentStatusCheck = await axios.get(statusCheckUrl, {
        params: statusCheckParams
      });
      
      console.log('EsewaCheckStatus response:', JSON.stringify(paymentStatusCheck.data, null, 2));
    } catch (checkError) {
      console.error('EsewaCheckStatus error:', checkError);
      console.error('Error stack:', checkError.stack);
      return res.status(500).json({
        success: false,
        message: 'Error checking payment status',
        error: checkError.message || 'Unknown error'
      });
    }

    // Extract data from axios response structure
    const responseStatus = paymentStatusCheck?.status || paymentStatusCheck?.statusCode || 200;
    const statusData = paymentStatusCheck?.data || paymentStatusCheck;
    
    if (responseStatus === 200 && statusData) {
      const { status, ref_id } = statusData;

      // Update transaction status
      transaction.status = status;
      if (ref_id) {
        transaction.ref_id = ref_id;
      }
      await transaction.save();

      // If payment is complete, create or update order
      if (status === 'COMPLETE') {
        let order;
        
        // If order already exists, update it
        if (transaction.order) {
          order = await Order.findById(transaction.order);
          if (order) {
            order.paymentStatus = 'completed';
            order.paymentResult = {
              id: ref_id || transaction.transaction_uuid,
              status: 'completed',
              update_time: new Date().toISOString()
            };
            order.status = 'processing';
            await order.save();
          }
        } else {
          // Create new order from transaction metadata
          const metadata = transaction.metadata || {};
          const cartItems = metadata.cartItems || [];
          const shippingAddress = metadata.shippingAddress || {};
          const cartSummary = metadata.cartSummary || {};
          
          if (cartItems.length > 0 && shippingAddress.fullName) {
            // Create order items from cart items
            const orderItems = cartItems.map(item => ({
              food: item.foodId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              discountedPrice: item.discount > 0 ? item.price * (1 - item.discount / 100) : undefined
            }));
            
            // Create order
            order = new Order({
              user: transaction.user || null,
              items: orderItems,
              shippingAddress: {
                street: shippingAddress.address || shippingAddress.street || '',
                city: shippingAddress.city || 'Kathmandu',
                state: shippingAddress.state || 'Bagmati', // Default to Bagmati Province
                zipCode: shippingAddress.postalCode || shippingAddress.zipCode || '',
                country: shippingAddress.country || 'Nepal'
              },
              paymentMethod: 'esewa',
              paymentStatus: 'completed',
              paymentResult: {
                id: ref_id || transaction.transaction_uuid,
                status: 'completed',
                update_time: new Date().toISOString()
              },
              subtotal: cartSummary.subtotal || transaction.amount,
              tax: cartSummary.tax || 0,
              shippingCost: cartSummary.shipping || 0,
              total: transaction.amount,
              status: 'processing'
            });
            
            await order.save();
            
            // Link order to transaction
            transaction.order = order._id;
            await transaction.save();
            
            console.log('Order created from payment:', order._id);
          }
        }
        
        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          transaction: {
            status: transaction.status,
            ref_id: transaction.ref_id,
            amount: transaction.amount,
            transaction_uuid: transaction.transaction_uuid
          },
          order: order ? {
            _id: order._id,
            items: order.items,
            shippingAddress: order.shippingAddress,
            total: order.total,
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt
          } : null
        });
      }

      // Return transaction status (payment not complete)
      return res.status(200).json({
        success: true,
        message: 'Transaction status updated',
        transaction: {
          status: transaction.status,
          ref_id: transaction.ref_id,
          amount: transaction.amount,
          transaction_uuid: transaction.transaction_uuid
        },
        order: null
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to check payment status',
        error: paymentStatusCheck.error || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Verify payment callback from eSewa
 * @route POST /api/payments/verify-payment
 * @access Public (called by eSewa)
 */
const verifyPayment = async (req, res) => {
  try {
    const { 
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature
    } = req.body;

    // Find transaction
    const transaction = await Transaction.findOne({ transaction_uuid });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify signature
    const secret = process.env.SECRET || process.env.ESEWA_SECRET || '8gBm/:&EnhH.1/q(';
    const message = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code},signed_field_names=${signed_field_names}`;
    const expectedSignature = generateSignature(message, secret);

    if (signature !== expectedSignature) {
      console.error('Signature verification failed');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Update transaction
    transaction.status = status;
    transaction.ref_id = transaction_code;
    await transaction.save();

    // Update order if exists
    if (status === 'COMPLETE' && transaction.order) {
      const order = await Order.findById(transaction.order);
      if (order) {
        order.paymentStatus = 'completed';
        order.paymentResult = {
          id: transaction_code,
          status: 'completed',
          update_time: new Date().toISOString()
        };
        order.status = 'processing';
        await order.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  EsewaInitiatePayment,
  paymentStatus,
  verifyPayment
};

