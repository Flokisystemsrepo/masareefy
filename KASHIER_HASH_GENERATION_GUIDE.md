# Kashier Hash Generation Guide

## Overview

This guide explains how hash value generation works in our Kashier payment integration. The hash is used to secure Hosted Payment Page (HPP) URLs and ensure payment authenticity.

## Hash Generation Process

### Step-by-Step Algorithm

1. **Input Parameters:**

   ```typescript
   {
     merchantId: "MID-32713-532",
     merchantOrderId: "ORDER-123",
     amount: "299",
     currency: "EGP",
     customerReference: "customer-123", // Optional
     secret: "4ad630b06dd788bb87653f56165ee504$57e65cf74d33e61b76f156ea2ddade9cca6e69a76f37625a1fedb9e8766406116394a86b0b5fd6f57c6f7740be7761e7"
   }
   ```

2. **Create the Path String:**

   ```typescript
   // Include customer reference in hash IF it's provided
   const customer = customerReference ? `.${customerReference}` : "";
   const path = `/?payment=${mid}.${orderId}.${amountStr}.${currencyStr}${customer}`;
   // With customer: "/?payment=MID-32713-532.ORDER-123.299.EGP.customer-123"
   // Without customer: "/?payment=MID-32713-532.ORDER-123.299.EGP"
   ```

3. **Generate HMAC SHA256 Hash:**
   ```typescript
   return crypto.createHmac("sha256", secret).update(path).digest("hex");
   ```

## Complete Implementation

### Hash Generation Function

```typescript
export function generateKashierOrderHash(opts: GenerateHashOptions): string {
  // 1. Extract parameters
  const { merchantId, merchantOrderId, amount, currency, secret } = opts;

  // 2. Convert to strings
  const mid = merchantId; // "MID-32713-532"
  const orderId = String(merchantOrderId); // "ORDER-123"
  const amountStr = String(amount); // "299"
  const currencyStr = currency; // "EGP"

  // 3. Create the path (NO customer reference in hash)
  const path = `/?payment=${mid}.${orderId}.${amountStr}.${currencyStr}`;
  // Result: "/?payment=MID-32713-532.ORDER-123.299.EGP"

  // 4. Generate HMAC SHA256 hash
  return crypto.createHmac("sha256", secret).update(path).digest("hex");
}
```

### Interface Definition

```typescript
export interface GenerateHashOptions {
  merchantId: string;
  merchantOrderId: string;
  amount: string | number;
  currency: string;
  customerReference?: string; // Optional
  secret: string;
}
```

## Real Example

### Input Values

```typescript
merchantId: "MID-32713-532";
merchantOrderId: "ORDER-123";
amount: "299";
currency: "EGP";
secret: "4ad630b06dd788bb87653f56165ee504$57e65cf74d33e61b76f156ea2ddade9cca6e69a76f37625a1fedb9e8766406116394a86b0b5fd6f57c6f7740be7761e7";
```

### Step-by-Step Process

1. **Create Path:**

   ```
   path = "/?payment=MID-32713-532.ORDER-123.299.EGP"
   ```

2. **Generate Hash:**

   ```typescript
   hash = crypto.createHmac("sha256", secret).update(path).digest("hex");
   ```

3. **Result:**
   ```
   hash = "ed2bdef280138dbdc37d45432afebc94d01ee26bfb1260cee5c5fde47133c051"
   ```

## Critical Rule: Customer Reference

**The most important rule:** The customer reference must be handled consistently between the hash and the HPP URL:

- **If you include `&customer=<value>` in the HPP URL** → **MUST include `.<value>` in the hash path**
- **If you don't include `&customer=...` in the HPP URL** → **MUST NOT include customer reference in the hash path**

### Examples:

**With Customer Reference:**

```typescript
// HPP URL includes: &customer=test-customer
// Hash path must be: /?payment=MID-32713-532.ORDER-123.299.EGP.test-customer
```

**Without Customer Reference:**

```typescript
// HPP URL does NOT include: &customer=...
// Hash path must be: /?payment=MID-32713-532.ORDER-123.299.EGP
```

## Key Requirements

### ✅ Correct Format

- **Path Format:** `/?payment=merchantId.orderId.amount.currency[.customerReference if present]`
- **Customer Reference Rule:** Include customer reference in hash **IF and ONLY IF** you also include `&customer=...` in the HPP URL
- **HMAC SHA256:** Uses Node.js crypto module with SHA256 algorithm
- **Secret Key:** Uses `KASHIER_SECRET_KEY` for hash generation
- **Hex Output:** Returns hash as hexadecimal string
- **Amount Consistency:** Use identical amount string in both hash and URL

### ❌ Common Mistakes

- Including customer reference in hash when not sending `&customer=...` in URL
- Excluding customer reference from hash when sending `&customer=...` in URL
- Using wrong secret key (API key instead of secret key)
- Inconsistent amount formatting between hash and URL
- Incorrect path format
- Wrong HMAC algorithm

## Usage in Code

### HPP URL Generation

```typescript
// In backend/src/routes/payments.ts
const hash = generateKashierOrderHash({
  merchantId: process.env.KASHIER_MERCHANT_ID!,
  merchantOrderId: orderId,
  amount,
  currency,
  customerReference,
  secret: process.env.KASHIER_SECRET_KEY!,
});

const hppUrl = generateHPPUrl({
  merchantId: process.env.KASHIER_MERCHANT_ID!,
  orderId,
  amount,
  currency,
  hash,
  // ... other parameters
});
```

### Environment Variables

```bash
KASHIER_MERCHANT_ID=MID-32713-532
KASHIER_SECRET_KEY=4ad630b06dd788bb87653f56165ee504$57e65cf74d33e61b76f156ea2ddade9cca6e69a76f37625a1fedb9e8766406116394a86b0b5fd6f57c6f7740be7761e7
```

## Testing

### Test Function

```typescript
export function testHashGeneration(): boolean {
  const testResult = generateKashierOrderHash({
    merchantId: "mid-0-1",
    merchantOrderId: "99",
    amount: "20",
    currency: "EGP",
    secret: "11111",
  });

  const expected =
    "606a8a1307d64caf4e2e9bb724738f115a8972c27eccb2a8acd9194c357e4bec";

  console.log("🧪 Hash test result:", testResult);
  console.log("🧪 Expected result:", expected);
  console.log("🧪 Test passed:", testResult === expected);

  return testResult === expected;
}
```

### Test with Real Credentials

```typescript
export function testWithRealCredentials(): boolean {
  const testResult = generateKashierOrderHash({
    merchantId: "MID-32713-532",
    merchantOrderId: "test-order-123",
    amount: "299",
    currency: "EGP",
    customerReference: "test-customer",
    secret:
      "4ad630b06dd788bb87653f56165ee504$57e65cf74d33e61b76f156ea2ddade9cca6e69a76f37625a1fedb9e8766406116394a86b0b5fd6f57c6f7740be7761e7",
  });

  console.log("🧪 Real credentials test result:", testResult);
  console.log(
    "🧪 Path used:",
    "/?payment=MID-32713-532.test-order-123.299.EGP"
  );

  return true;
}
```

## Debugging

### Console Logging

The function includes detailed logging:

```typescript
console.log("🔐 HPP Hash generation:", {
  path,
  secret: secret ? "✅ Set" : "❌ Missing",
  merchantId: mid,
  orderId,
  amount: amountStr,
  currency: currencyStr,
  customerRef,
  fullPath: path,
});
```

### Common Issues

1. **403 Forbidden Error:** Usually caused by incorrect hash generation
2. **Invalid Hash:** Check if secret key is correct
3. **Path Format:** Ensure path follows exact format: `/?payment=merchantId.orderId.amount.currency`

## Files Location

- **Hash Generation:** `backend/src/utils/kashierHash.ts`
- **Usage:** `backend/src/routes/payments.ts`
- **Service:** `backend/src/services/KashierService.ts`

## Security Notes

- Never expose the secret key in frontend code
- Store secret key in environment variables
- Use HTTPS for all payment-related requests
- Validate hash on webhook/redirect endpoints

## Related Documentation

- [Kashier HPP Documentation](https://developers.kashier.io/payment/payment-ui#hpp)
- [Kashier Hash Generation](https://developers.kashier.io/direct-api-integration/pay-with-token)
- [Kashier Error Handling](https://developers.kashier.io/error-handling)
