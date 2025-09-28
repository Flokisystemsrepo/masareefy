import crypto from "crypto";

export interface GenerateHashOptions {
  merchantId: string;
  merchantOrderId: string;
  amount: string | number;
  currency: string;
  customerReference?: string;
  secret: string;
}

/**
 * Generate Kashier order hash for Hosted Payment Page (HPP) flow
 * @param opts Hash generation options
 * @returns SHA256 HMAC hash string
 */
export function generateKashierOrderHash(opts: GenerateHashOptions): string {
  const {
    merchantId,
    merchantOrderId,
    amount,
    currency,
    customerReference,
    secret,
  } = opts;

  const mid = String(merchantId);
  const orderId = String(merchantOrderId);
  const amountStr = String(amount);
  const currencyStr = String(currency);

  // Include customer reference in hash IF it's provided
  // Format: /?payment=merchantId.orderId.amount.currency[.customerReference if present]
  const customer = customerReference ? `.${customerReference}` : "";
  const path = `/?payment=${mid}.${orderId}.${amountStr}.${currencyStr}${customer}`;

  console.log("🔐 HPP Hash generation:", {
    path,
    secret: secret ? "✅ Set" : "❌ Missing",
    merchantId: mid,
    orderId,
    amount: amountStr,
    currency: currencyStr,
    customerRef: customerReference,
    customerInPath: customerReference ? "✅ Included" : "❌ Not included",
    fullPath: path,
  });

  return crypto.createHmac("sha256", secret).update(path).digest("hex");
}

/**
 * Example usage and test case
 * Expected result for `/?payment=mid-0-1.99.20.EGP` with secret `11111`:
 * Should be `606a8a1307d64caf4e2e9bb724738f115a8972c27eccb2a8acd9194c357e4bec`
 */
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

/**
 * Test with our actual credentials to verify hash generation
 */
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
    "/?payment=MID-32713-532.test-order-123.299.EGP.test-customer"
  );

  return true; // Just for logging
}

/**
 * Test without customer reference
 */
export function testWithoutCustomerReference(): boolean {
  const testResult = generateKashierOrderHash({
    merchantId: "MID-32713-532",
    merchantOrderId: "test-order-456",
    amount: "299",
    currency: "EGP",
    // No customerReference provided
    secret:
      "4ad630b06dd788bb87653f56165ee504$57e65cf74d33e61b76f156ea2ddade9cca6e69a76f37625a1fedb9e8766406116394a86b0b5fd6f57c6f7740be7761e7",
  });

  console.log("🧪 Test without customer reference:", testResult);
  console.log(
    "🧪 Path used:",
    "/?payment=MID-32713-532.test-order-456.299.EGP"
  );

  return true;
}
