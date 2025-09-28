import React, { useEffect, useRef, useState } from "react";
import { PaymentResponse } from "@/utils/kashierPayment";

interface Kashier3DSHandlerProps {
  paymentResponse: PaymentResponse;
  onComplete: (result: any) => void;
  onError: (error: any) => void;
  containerId?: string;
}

/**
 * React component for handling Kashier 3-DS authentication
 * Renders the 3-DS form or redirects to 3-DS page
 */
export const Kashier3DSHandler: React.FC<Kashier3DSHandlerProps> = ({
  paymentResponse,
  onComplete,
  onError,
  containerId = "kashier-3ds-container",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paymentResponse.authentication) {
      onError(new Error("No authentication data received"));
      return;
    }

    const { authentication } = paymentResponse;

    // Handle redirectHtml (3-DS form)
    if (authentication.redirectHtml) {
      handleRedirectHtml(authentication.redirectHtml);
    }
    // Handle redirectUrl (3-DS redirect)
    else if (authentication.redirectUrl) {
      handleRedirectUrl(authentication.redirectUrl);
    } else {
      onError(new Error("No valid 3-DS authentication method found"));
    }
  }, [paymentResponse, onComplete, onError]);

  const handleRedirectHtml = (html: string) => {
    try {
      setIsProcessing(true);

      if (containerRef.current) {
        // Clear previous content
        containerRef.current.innerHTML = "";

        // Create wrapper for 3-DS form
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
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

        // Create form container
        const formContainer = document.createElement("div");
        formContainer.style.cssText = `
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

        // Add loading indicator
        const loadingDiv = document.createElement("div");
        loadingDiv.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            <p style="margin-top: 10px; color: #666;">Processing 3-DS authentication...</p>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;

        formContainer.appendChild(loadingDiv);
        wrapper.appendChild(formContainer);
        containerRef.current.appendChild(wrapper);

        // Render the 3-DS HTML after a short delay
        setTimeout(() => {
          formContainer.innerHTML = html;

          // Auto-submit the form if it exists
          const form = formContainer.querySelector("form");
          if (form) {
            setTimeout(() => {
              form.submit();
            }, 100);
          }
        }, 1000);

        // Clean up after timeout
        setTimeout(() => {
          if (wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
          }
          setIsProcessing(false);
        }, 30000); // 30 second timeout
      }
    } catch (error: any) {
      setError(error.message);
      onError(error);
    }
  };

  const handleRedirectUrl = (url: string) => {
    try {
      setIsProcessing(true);
      // Redirect to Kashier's 3-DS page
      window.location.href = url;
    } catch (error: any) {
      setError(error.message);
      onError(error);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-medium">3-DS Authentication Error</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={() => onError(new Error(error))}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Close
        </button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div>
            <h3 className="text-blue-800 font-medium">
              Processing 3-DS Authentication
            </h3>
            <p className="text-blue-600 text-sm">
              Please wait while we verify your payment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={containerId}
      ref={containerRef}
      className="kashier-3ds-container"
    />
  );
};

/**
 * Hook for using Kashier 3-DS authentication
 */
export const useKashier3DS = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle3DS = async (paymentResponse: PaymentResponse) => {
    try {
      setIsProcessing(true);
      setError(null);

      const { authentication } = paymentResponse;

      if (!authentication) {
        throw new Error("No authentication data received");
      }

      // Handle redirectHtml
      if (authentication.redirectHtml) {
        // Create a temporary container
        const container = document.createElement("div");
        container.id = "temp-kashier-3ds";
        container.style.cssText =
          "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;";
        document.body.appendChild(container);

        // Render the HTML
        container.innerHTML = authentication.redirectHtml;

        // Auto-submit after a short delay
        setTimeout(() => {
          const form = container.querySelector("form");
          if (form) {
            form.submit();
          }
        }, 1000);

        // Clean up after timeout
        setTimeout(() => {
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        }, 30000);
      }
      // Handle redirectUrl
      else if (authentication.redirectUrl) {
        window.location.href = authentication.redirectUrl;
      } else {
        throw new Error("No valid 3-DS authentication method found");
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handle3DS,
    isProcessing,
    error,
  };
};

export default Kashier3DSHandler;
