# eSewa Payment Integration Setup

## Installation

Install the required package:
```bash
cd backend
npm install esewajs
```

## Environment Variables

Add the following to your `.env` file in the backend directory:

```env
# eSewa Configuration
MERCHANT_ID=EPAYTEST                    # Your eSewa merchant ID (use EPAYTEST for testing)
SECRET=8gBm/:&EnhH.1/q(                 # Your eSewa secret key (use test secret for testing)
ESEWAPAYMENT_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form  # Test URL
ESEWAPAYMENT_STATUS_CHECK_URL=https://rc.esewa.com.np/api/epay/transaction/status/  # Test URL

# For Production (replace when going live):
# MERCHANT_ID=your_production_merchant_id
# SECRET=your_production_secret
# ESEWAPAYMENT_URL=https://epay.esewa.com.np/api/epay/main/v2/form
# ESEWAPAYMENT_STATUS_CHECK_URL=https://esewa.com.np/api/epay/transaction/status/

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000
SUCCESS_URL=http://localhost:3000/payment/success
FAILURE_URL=http://localhost:3000/payment/failure

# Product Code (use EPAYTEST for testing)
REACT_APP_ESEWA_PRODUCT_CODE=EPAYTEST
```

## Test Credentials

For testing, use these eSewa credentials:
- **eSewa ID:** 9806800001/2/3/4/5
- **Password:** Nepal@123
- **MPIN:** 1122 (for mobile app)

## API Endpoints

### 1. Initiate Payment
**POST** `/api/payments/initiate-payment`

**Request Body:**
```json
{
  "amount": 100,
  "productId": "EPAYTEST",
  "type": "order",
  "metadata": {
    "orderId": "optional_order_id",
    "cartItems": []
  }
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://rc-epay.esewa.com.np/api/epay/main/v2/form?...",
  "transactionId": "transaction_id",
  "transaction_uuid": "unique_uuid"
}
```

### 2. Check Payment Status
**POST** `/api/payments/payment-status`

**Request Body:**
```json
{
  "product_id": "EPAYTEST",
  "transaction_uuid": "transaction_uuid",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction status updated successfully",
  "transaction": {
    "status": "COMPLETE",
    "ref_id": "0001TS9",
    "amount": 100
  }
}
```

### 3. Verify Payment (Callback)
**POST** `/api/payments/verify-payment`

This endpoint is called by eSewa after payment completion.

## Payment Flow

1. User selects eSewa payment method in checkout
2. Frontend calls `/api/payments/initiate-payment`
3. Backend creates transaction and returns eSewa payment URL
4. User is redirected to eSewa payment page
5. User completes payment on eSewa
6. eSewa redirects to success/failure URL
7. Frontend verifies payment using `/api/payments/payment-status`
8. Order is created and cart is cleared

## References

- [eSewa Developer Documentation](https://developer.esewa.com.np/pages/Epay)
- [Integration Guide](https://developer.esewa.com.np/pages/Epay#integration)
- [Status Check API](https://developer.esewa.com.np/pages/Epay#statuscheck)

