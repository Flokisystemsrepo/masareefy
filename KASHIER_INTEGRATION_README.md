# 🚀 Kashier Payments Integration

Complete production-ready Kashier payments integration for Node.js/Express backend and React frontend.

## 📋 Features

- ✅ **Pay with Token** via `POST /v3/orders` (ECOMMERCE, 3-DS enabled)
- ✅ **3-DS Authentication** handling with redirectHtml and redirectUrl
- ✅ **Webhook Processing** with signature validation
- ✅ **Hosted Payment Page (HPP)** URL generation
- ✅ **Signature Validation** for redirects and webhooks
- ✅ **TypeScript Support** with full type definitions
- ✅ **React Components** for 3-DS handling
- ✅ **Production Ready** with error handling and security

## 🏗️ Architecture

### Backend Files

```
backend/src/
├── services/KashierService.ts     # Main Kashier API service
├── routes/payments.ts            # Payment API routes
├── utils/kashierHash.ts          # Hash generation utilities
├── utils/kashierSign.ts          # Signature validation utilities
└── env.example                   # Environment variables template
```

### Frontend Files

```
src/
├── utils/kashierPayment.ts       # Frontend payment utilities
└── components/Kashier3DSHandler.tsx # 3-DS authentication component
```

## 🔧 Setup

### 1. Environment Variables

Copy `backend/env.example` to `backend/.env` and configure:

```bash
# Kashier Configuration
KASHIER_BASE_URL=https://test-fep.kashier.io
KASHIER_MERCHANT_ID=MID-XXX-XXX
KASHIER_API_KEY=xxxxxxxxxxxxxxxx
KASHIER_MODE=test
KASHIER_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook
KASHIER_MERCHANT_REDIRECT=https://yourdomain.com/api/payments/redirect
FRONTEND_URL=http://localhost:5173
```

### 2. Install Dependencies

```bash
# Backend dependencies (if not already installed)
npm install axios

# Frontend dependencies (if not already installed)
npm install @types/node
```

## 🚀 API Endpoints

### Pay with Token

```http
POST /api/payments/pay-with-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "cardToken": "123456789123456789",
  "securityCode": "123",
  "amount": "299.00",
  "currency": "EGP",
  "description": "Growth Plan Subscription",
  "merchantOrderId": "ORDER-123",
  "customerReference": "USER-456"
}
```

**Response:**

```json
{
  "status": "SUCCESS",
  "messages": {
    "en": "Authentication in progress",
    "ar": "المصادقة قيد التقدم"
  },
  "order": {
    "amount": 299,
    "currency": "EGP",
    "systemOrderId": "bdcab401-d3eb-4cb1-80a7-6bc59f595961"
  },
  "transactionId": "TX-2498912112",
  "authentication": {
    "redirectHtml": "<div id=\"initiate3dsSimpleRedirect\">...</div>",
    "redirectUrl": "https://checkout.staging.payformance.io/3dsRedirect/..."
  }
}
```

### Generate HPP URL

```http
POST /api/payments/hpp-url
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "ORDER-123",
  "amount": "299.00",
  "currency": "EGP",
  "customerReference": "USER-456",
  "description": "Growth Plan Subscription"
}
```

### Webhook (Kashier → Server)

```http
POST /api/payments/webhook
# Signature validation included
```

### Redirect (Browser → Server)

```http
GET /api/payments/redirect
# Signature validation included
```

## 💻 Frontend Usage

### 1. Basic Payment Processing

```tsx
import { useKashierPayment } from "@/utils/kashierPayment";

function PaymentComponent() {
  const { processPayment, openHPP } = useKashierPayment();

  const handlePayment = async () => {
    try {
      const response = await processPayment({
        cardToken: "123456789123456789",
        securityCode: "123",
        amount: "299.00",
        currency: "EGP",
        merchantOrderId: "ORDER-123",
        customerReference: "USER-456",
      });

      console.log("Payment successful:", response);
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return <button onClick={handlePayment}>Pay with Token</button>;
}
```

### 2. 3-DS Authentication Handling

```tsx
import { Kashier3DSHandler } from "@/components/Kashier3DSHandler";

function PaymentPage() {
  const [paymentResponse, setPaymentResponse] = useState(null);

  const handlePaymentComplete = (result) => {
    console.log("Payment completed:", result);
    // Handle successful payment
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    // Handle payment error
  };

  return (
    <div>
      {paymentResponse && (
        <Kashier3DSHandler
          paymentResponse={paymentResponse}
          onComplete={handlePaymentComplete}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
}
```

### 3. Hosted Payment Page

```tsx
import { useKashierPayment } from "@/utils/kashierPayment";

function HPPPayment() {
  const { openHPP } = useKashierPayment();

  const handleHPPPayment = async () => {
    try {
      await openHPP({
        orderId: "ORDER-123",
        amount: "299.00",
        currency: "EGP",
        customerReference: "USER-456",
      });
    } catch (error) {
      console.error("HPP payment failed:", error);
    }
  };

  return <button onClick={handleHPPPayment}>Pay with HPP</button>;
}
```

## 🔐 Security Features

### 1. Signature Validation

- All webhooks and redirects are validated using HMAC SHA256
- Prevents tampering and ensures authenticity

### 2. Hash Generation

- Secure hash generation for HPP URLs
- Uses merchant secret for HMAC SHA256

### 3. Token-based Authentication

- All payment endpoints require valid JWT tokens
- Prevents unauthorized access

## 🧪 Testing

### 1. Test Hash Generation

```typescript
import { testHashGeneration } from "@/utils/kashierHash";

// Run test to verify hash generation
testHashGeneration(); // Should return true
```

### 2. Test Signature Validation

```typescript
import { validateSignature } from "@/utils/kashierSign";

const query = { orderId: "123", amount: "100", signature: "abc123" };
const isValid = validateSignature(query, "your-secret");
```

## 📊 Error Handling

### Backend Errors

- Comprehensive error handling in all endpoints
- Detailed error messages for debugging
- Proper HTTP status codes

### Frontend Errors

- User-friendly error messages
- Graceful fallbacks for 3-DS failures
- Loading states and timeouts

## 🚀 Production Deployment

### 1. Environment Variables

```bash
# Production Kashier Configuration
KASHIER_BASE_URL=https://fep.kashier.io
KASHIER_MODE=live
KASHIER_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook
KASHIER_MERCHANT_REDIRECT=https://yourdomain.com/api/payments/redirect
```

### 2. Webhook URLs

- Ensure webhook URLs are publicly accessible
- Use HTTPS in production
- Test webhook endpoints with Kashier's test tools

### 3. Security Checklist

- ✅ Environment variables secured
- ✅ API keys not exposed to frontend
- ✅ Webhook signature validation enabled
- ✅ HTTPS enabled in production
- ✅ Rate limiting configured

## 📚 API Documentation

### KashierService Methods

#### `payWithToken(input: PayWithTokenInput)`

Initiates payment using stored card token with 3-DS support.

#### `generateHPPUrl(options: HPPUrlOptions)`

Generates Hosted Payment Page URL with proper hash.

#### `verifyPaymentStatus(transactionId: string)`

Verifies payment status by querying Kashier API.

### Utility Functions

#### `generateKashierOrderHash(opts: GenerateHashOptions)`

Generates SHA256 HMAC hash for HPP URLs.

#### `validateSignature(query: Record<string, string>, secret: string)`

Validates Kashier signature from query parameters.

## 🔄 Integration Flow

### Pay with Token Flow

1. Frontend calls `/api/payments/pay-with-token`
2. Backend sends request to Kashier `/v3/orders`
3. Kashier returns 3-DS authentication data
4. Frontend handles 3-DS (redirectHtml or redirectUrl)
5. User completes 3-DS authentication
6. Kashier sends webhook to `/api/payments/webhook`
7. Backend processes payment status
8. User redirected to success page

### HPP Flow

1. Frontend calls `/api/payments/hpp-url`
2. Backend generates HPP URL with hash
3. Frontend redirects user to HPP
4. User completes payment on Kashier
5. Kashier redirects to `/api/payments/redirect`
6. Backend validates signature
7. User redirected to success page

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid signature" error**

   - Check API key configuration
   - Verify webhook URL is correct
   - Ensure signature validation logic is working

2. **3-DS not working**

   - Check if `enable3DS: true` is set
   - Verify redirectHtml/redirectUrl handling
   - Ensure proper container setup

3. **Payment not processing**
   - Verify merchant ID and API key
   - Check amount and currency format
   - Ensure customer reference is provided

### Debug Mode

Enable detailed logging by setting:

```bash
NODE_ENV=development
```

## 📞 Support

For Kashier-specific issues:

- Check [Kashier Documentation](https://developers.kashier.io/)
- Contact Kashier Support
- Review API response codes and messages

For integration issues:

- Check server logs for detailed error messages
- Verify environment variables
- Test with Kashier's sandbox environment first
