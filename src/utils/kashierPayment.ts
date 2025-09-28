/**
 * Kashier Payment Frontend Helper
 * Handles 3-DS authentication and payment processing
 */

export interface PaymentResponse {
  status: string;
  messages: { en: string; ar: string };
  order?: {
    amount: number;
    currency: string;
    systemOrderId: string;
  };
  transactionId?: string;
  authentication?: {
    redirectHtml?: string;
    redirectUrl?: string;
  };
  systemOrderId?: string;
}

export interface HPPUrlResponse {
  url: string;
  orderId: string;
  amount: string | number;
  currency: string;
  hash: string;
}

/**
 * Handle 3-DS authentication response from Kashier
 * @param response Payment response from backend
 * @param containerId Optional container ID for rendering HTML
 * @returns Promise that resolves when 3-DS is complete
 */
export async function handle3DSAuthentication(
  response: PaymentResponse,
  containerId?: string
): Promise<void> {
  const { authentication } = response;

  if (!authentication) {
    throw new Error("No authentication data received from Kashier");
  }

  // Handle redirectHtml (3-DS form)
  if (authentication.redirectHtml) {
    return handleRedirectHtml(authentication.redirectHtml, containerId);
  }

  // Handle redirectUrl (3-DS redirect)
  if (authentication.redirectUrl) {
    return handleRedirectUrl(authentication.redirectUrl);
  }

  throw new Error("No valid 3-DS authentication method found");
}

/**
 * Handle 3-DS HTML form rendering
 * @param html 3-DS HTML from Kashier
 * @param containerId Optional container ID
 */
function handleRedirectHtml(html: string, containerId?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create container if not provided
      const container = containerId
        ? document.getElementById(containerId)
        : document.createElement("div");

      if (!container) {
        throw new Error("Container element not found");
      }

      // Set container styles for 3-DS form
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      // Create inner container for the form
      const formContainer = document.createElement("div");
      formContainer.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      `;

      // Render the 3-DS HTML
      formContainer.innerHTML = html;
      container.appendChild(formContainer);

      // Add to document if not already present
      if (!containerId) {
        document.body.appendChild(container);
      }

      // Auto-submit the form (Kashier HTML includes auto-submit script)
      const form = formContainer.querySelector("form");
      if (form) {
        // Wait a moment for any scripts to load
        setTimeout(() => {
          form.submit();
        }, 100);
      }

      // Clean up after a reasonable timeout
      setTimeout(() => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        resolve();
      }, 30000); // 30 second timeout
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Handle 3-DS redirect URL
 * @param url Redirect URL from Kashier
 */
function handleRedirectUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Redirect to Kashier's 3-DS page
      window.location.href = url;
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Initiate payment with token
 * @param paymentData Payment data
 * @returns Promise with payment response
 */
export async function initiatePaymentWithToken(paymentData: {
  cardToken: string;
  securityCode?: string;
  amount: string;
  currency?: string;
  description?: string;
  merchantOrderId: string;
  customerReference: string;
}): Promise<PaymentResponse> {
  throw new Error(
    "Direct API payments are disabled. Please use the HPP flow instead."
  );
}

/**
 * Generate Hosted Payment Page URL
 * @param orderData Order data
 * @returns Promise with HPP URL
 */
export async function generateHPPUrl(orderData: {
  orderId: string;
  amount: string | number;
  currency?: string;
  customerReference?: string;
  description?: string;
  enable3DS?: boolean;
}): Promise<HPPUrlResponse> {
  try {
    const response = await fetch("/api/payments/hpp-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        currency: "EGP",
        enable3DS: true,
        ...orderData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "HPP URL generation failed");
    }

    return await response.json();
  } catch (error: any) {
    console.error("HPP URL generation error:", error);
    throw error;
  }
}

/**
 * Open Hosted Payment Page in new window
 * @param url HPP URL
 * @param onSuccess Success callback
 * @param onError Error callback
 */
export function openHPPWindow(
  url: string,
  onSuccess?: (data: any) => void,
  onError?: (error: any) => void
): void {
  try {
    const paymentWindow = window.open(
      url,
      "kashier-payment",
      "width=800,height=600,scrollbars=yes,resizable=yes"
    );

    if (!paymentWindow) {
      throw new Error(
        "Failed to open payment window. Please check popup blockers."
      );
    }

    // Listen for window close or navigation
    const checkClosed = setInterval(() => {
      if (paymentWindow.closed) {
        clearInterval(checkClosed);
        // Payment window was closed
        if (onError) {
          onError(new Error("Payment window was closed"));
        }
      }
    }, 1000);

    // Listen for messages from payment window
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "payment-success") {
        clearInterval(checkClosed);
        window.removeEventListener("message", messageHandler);
        paymentWindow.close();
        if (onSuccess) {
          onSuccess(event.data);
        }
      } else if (event.data.type === "payment-error") {
        clearInterval(checkClosed);
        window.removeEventListener("message", messageHandler);
        paymentWindow.close();
        if (onError) {
          onError(event.data.error);
        }
      }
    };

    window.addEventListener("message", messageHandler);
  } catch (error: any) {
    console.error("HPP window error:", error);
    if (onError) {
      onError(error);
    }
  }
}

/**
 * React hook for handling Kashier payments
 */
export function useKashierPayment() {
  const processPayment = async (paymentData: any, containerId?: string) => {
    try {
      // Initiate payment
      const response = await initiatePaymentWithToken(paymentData);

      // Handle 3-DS if required
      if (response.authentication) {
        await handle3DSAuthentication(response, containerId);
      }

      return response;
    } catch (error) {
      console.error("Payment processing error:", error);
      throw error;
    }
  };

  const openHPP = async (orderData: any) => {
    try {
      const { url } = await generateHPPUrl(orderData);
      return new Promise((resolve, reject) => {
        openHPPWindow(url, resolve, reject);
      });
    } catch (error) {
      console.error("HPP error:", error);
      throw error;
    }
  };

  return {
    processPayment,
    openHPP,
    handle3DSAuthentication,
    generateHPPUrl,
  };
}
