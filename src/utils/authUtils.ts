// Utility functions for authentication management

export const clearAllAuthData = () => {
  console.log("Clearing all authentication data...");

  // Clear localStorage
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("companyName");
  localStorage.removeItem("brandId");
  localStorage.removeItem("userId");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");

  // Clear sessionStorage
  sessionStorage.clear();

  console.log("All authentication data cleared");
};

export const isRateLimitError = (error: any): boolean => {
  if (!error) return false;

  const message = error.message || error.toString();
  return (
    message.includes("Too many requests") ||
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("Rate limit")
  );
};

export const shouldRetryRequest = (error: any, retryCount: number): boolean => {
  // Don't retry if it's a rate limit error
  if (isRateLimitError(error)) {
    return false;
  }

  // Don't retry more than 2 times
  if (retryCount >= 2) {
    return false;
  }

  // Don't retry authentication errors (401)
  if (
    error.message?.includes("401") ||
    error.message?.includes("Authentication")
  ) {
    return false;
  }

  return true;
};

export const getRetryDelay = (retryCount: number): number => {
  // Exponential backoff: 1s, 2s, 4s
  return Math.min(1000 * Math.pow(2, retryCount), 4000);
};
