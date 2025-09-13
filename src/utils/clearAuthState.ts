// Emergency utility to clear authentication state
// This can be called from browser console if user gets stuck in auth loops

export const emergencyClearAuth = () => {
  console.log("🚨 Emergency auth clear initiated...");

  // Clear all localStorage
  const keysToRemove = [
    "isAuthenticated",
    "userEmail",
    "userName",
    "companyName",
    "brandId",
    "userId",
    "token",
    "refreshToken",
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
    console.log(`Removed ${key}`);
  });

  // Clear sessionStorage
  sessionStorage.clear();
  console.log("Cleared sessionStorage");

  // Clear any cookies (if any)
  document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });

  console.log("✅ Emergency auth clear completed. Please refresh the page.");

  // Auto refresh after 2 seconds
  setTimeout(() => {
    window.location.reload();
  }, 2000);
};

// Function to clear subscription rate limits
export const clearSubscriptionRateLimit = () => {
  console.log("🧹 Clearing subscription rate limits...");

  // Clear any stored rate limit data from localStorage
  const rateLimitKeys = [
    "subscriptionRateLimit",
    "rateLimitMap",
    "pendingRequests",
  ];

  rateLimitKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log("✅ Subscription rate limits cleared");
};

// Make it available globally for console access
if (typeof window !== "undefined") {
  (window as any).emergencyClearAuth = emergencyClearAuth;
  (window as any).clearSubscriptionRateLimit = clearSubscriptionRateLimit;
  console.log(
    "🔧 Emergency functions available: window.emergencyClearAuth() and window.clearSubscriptionRateLimit()"
  );
}
