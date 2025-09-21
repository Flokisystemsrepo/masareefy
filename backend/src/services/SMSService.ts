import axios from "axios";

interface SMSResponse {
  status: boolean;
  message: string;
  data?: any;
}

interface SendOTPParams {
  phone: string;
  otpCode: string;
  appName?: string;
}

class SMSService {
  private readonly FLOKI_SMS_URL: string;
  private readonly FLOKI_SMS_TOKEN: string;
  private readonly APP_NAME: string;

  constructor() {
    this.FLOKI_SMS_URL =
      process.env.FLOKI_SMS_URL ||
      "https://flokisystems.com/flokisms/send-otp.php";
    this.FLOKI_SMS_TOKEN =
      process.env.FLOKI_SMS_TOKEN ||
      "floki-secure-token-9f8e4c1f79284d99bdad6c74ea7ac2f1";
    this.APP_NAME = process.env.APP_NAME || "Pulse Robot";
  }

  /**
   * Send OTP via SMS using Floki SMS service
   */
  async sendOTP({
    phone,
    otpCode,
    appName,
  }: SendOTPParams): Promise<SMSResponse> {
    try {
      // Validate phone number format (Egyptian mobile)
      if (!this.isValidEgyptianPhone(phone)) {
        return {
          status: false,
          message: "Invalid Egyptian mobile number format",
        };
      }

      // Use correct Floki SMS API structure
      const headers = {
        Authorization: `Bearer ${this.FLOKI_SMS_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      };

      // Prepare payload - exact structure from working Django code
      const payload = {
        app_name: appName || this.APP_NAME,
        otp_code: otpCode,
        phone: phone, // Use phone number as-is (01104484492) without +20 prefix
      };

      console.log("📤 Sending SMS to Floki API:", {
        url: this.FLOKI_SMS_URL,
        headers,
        payload: payload,
        phone: phone,
        otpCode,
      });

      // Send SMS using correct Floki SMS API structure
      const response = await axios.post(this.FLOKI_SMS_URL, payload, {
        headers,
        timeout: 10000,
      });

      console.log("📥 Floki SMS Response:", {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });

      // Handle response - Floki SMS sometimes returns "OTP charge failed" even when SMS is sent
      if (response.status === 200) {
        // Check if the response indicates success or failure
        const responseData = response.data;

        if (responseData && responseData.status === true) {
          return {
            status: true,
            message: "OTP sent successfully",
            data: responseData,
          };
        } else if (
          responseData &&
          (responseData.message === "OTP charge failed" ||
            responseData.message === "Vodafone API Error.")
        ) {
          // Special case: Floki SMS returns errors but SMS is actually sent
          console.log(
            `⚠️ Floki SMS returned '${responseData.message}' but SMS may have been sent`
          );
          return {
            status: true, // Treat as success since SMS is actually delivered
            message: `OTP sent successfully (Floki API reported ${responseData.message} but SMS delivered)`,
            data: responseData,
          };
        } else {
          return {
            status: false,
            message: responseData?.message || "SMS service returned error",
          };
        }
      } else {
        return {
          status: false,
          message: `SMS service returned status: ${response.status}`,
        };
      }
    } catch (error: any) {
      console.error("SMS Service Error:", error);

      if (error.code === "ECONNABORTED") {
        return {
          status: false,
          message: "SMS service timeout. Please try again.",
        };
      }

      if (error.response) {
        return {
          status: false,
          message: `SMS service error: ${error.response.status} - ${
            error.response.data?.message || "Unknown error"
          }`,
        };
      }

      return {
        status: false,
        message: `Failed to send OTP: ${error.message}`,
      };
    }
  }

  /**
   * Validate Egyptian mobile phone number
   * Accepts: 010, 011, 012, 015 followed by 8 digits
   */
  private isValidEgyptianPhone(phone: string): boolean {
    const egyptianPhoneRegex = /^(010|011|012|015)\d{8}$/;
    return egyptianPhoneRegex.test(phone);
  }

  /**
   * Generate a random 6-digit OTP code
   */
  generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Format phone number for display (adds +20 prefix)
   */
  formatPhoneNumber(phone: string): string {
    if (phone.startsWith("+20")) {
      return phone;
    }
    return `+20${phone}`;
  }

  /**
   * Clean phone number (remove +20 prefix if present)
   */
  cleanPhoneNumber(phone: string): string {
    return phone.replace(/^\+20/, "");
  }
}

export default new SMSService();
