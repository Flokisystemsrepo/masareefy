import crypto from "crypto";

/**
 * Validate Kashier signature from redirect/webhook query parameters
 * @param query Query parameters object from request
 * @param secret Kashier API secret key
 * @returns boolean indicating if signature is valid
 */
export function validateSignature(
  query: Record<string, string>,
  secret: string
): boolean {
  let queryString = "";

  // Build query string excluding signature and mode parameters
  for (const key in query) {
    if (key === "signature" || key === "mode") continue;
    queryString += "&" + key + "=" + query[key];
  }

  // Remove leading '&' and create final URL
  const finalUrl = queryString.substring(1);

  // Generate HMAC SHA256 signature
  const computed = crypto
    .createHmac("sha256", secret)
    .update(finalUrl)
    .digest("hex");

  // Compare with provided signature
  return computed === query.signature;
}

/**
 * Validate signature from request headers (alternative method)
 * @param headers Request headers object
 * @param body Request body (string)
 * @param secret Kashier API secret key
 * @returns boolean indicating if signature is valid
 */
export function validateHeaderSignature(
  headers: Record<string, string>,
  body: string,
  secret: string
): boolean {
  const signature =
    headers["x-kashier-signature"] || headers["kashier-signature"];

  if (!signature) {
    return false;
  }

  const computed = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return computed === signature;
}

/**
 * Extract payment information from validated query parameters
 * @param query Validated query parameters
 * @returns Parsed payment information
 */
export function extractPaymentInfo(query: Record<string, string>) {
  return {
    orderId: query.orderId,
    amount: query.amount,
    currency: query.currency,
    status: query.status,
    transactionId: query.transactionId,
    paymentStatus: query.paymentStatus,
    customerReference: query.customerReference,
    systemOrderId: query.systemOrderId,
  };
}

/**
 * Create a secure redirect URL with signature
 * @param baseUrl Base URL for redirect
 * @param params Parameters to include
 * @param secret Kashier API secret key
 * @returns Complete URL with signature
 */
export function createSignedRedirectUrl(
  baseUrl: string,
  params: Record<string, string>,
  secret: string
): string {
  // Build query string
  let queryString = "";
  for (const key in params) {
    queryString += "&" + key + "=" + encodeURIComponent(params[key]);
  }

  const finalUrl = queryString.substring(1);

  // Generate signature
  const signature = crypto
    .createHmac("sha256", secret)
    .update(finalUrl)
    .digest("hex");

  // Add signature to parameters
  const signedParams = { ...params, signature };

  // Build final URL
  const urlParams = new URLSearchParams(signedParams);
  return `${baseUrl}?${urlParams.toString()}`;
}
