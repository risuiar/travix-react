import { BACKEND_TRAVIX } from "./env";

// Email API utilities for secure verification
const API_BASE_URL = BACKEND_TRAVIX;

// Types
export interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface VerificationEmailRequest {
  email: string;
  userId: string;
  userName?: string;
  language?: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  error?: string;
  email?: string;
  code?: string;
}

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  userId: string,
  userName?: string,
  language?: string
): Promise<EmailResponse> => {
  try {
    const url = `${API_BASE_URL}/api/email/send-verification`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        userId,
        userName,
        language,
      } as VerificationEmailRequest),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to send verification email",
        error: responseText || `HTTP ${response.status}`,
      };
    }

    // Try to parse JSON response
    let data: EmailResponse;
    try {
      data = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        message: "Invalid response from server",
        error: "Invalid JSON response",
      };
    }

    return data;
  } catch (error) {
    console.error("Email API request failed:", error);
    return {
      success: false,
      message: "Failed to send verification email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Verify token from backend (for /verify-email route)
export const verifyToken = async (
  token: string
): Promise<VerificationResponse> => {
  try {
    // Verificar que la URL base esté configurada
    if (!API_BASE_URL || API_BASE_URL === "undefined") {
      console.error("❌ VITE_BACKEND_TRAVIX no está configurado");
      return {
        success: false,
        message: "Backend no configurado",
        error: "VITE_BACKEND_TRAVIX no está configurado",
      };
    }

    const requestBody = { token };

    const response = await fetch(`${API_BASE_URL}/api/email/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Handle response text first to avoid JSON parsing errors
    const responseText = await response.text();

    if (!response.ok) {
      console.error("Token verification Error:", response.status, responseText);
      return {
        success: false,
        message: "Failed to verify token",
        error: responseText || `HTTP ${response.status}`,
      };
    }

    // Try to parse JSON response
    let data: VerificationResponse;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse JSON response:", responseText);
      return {
        success: false,
        message: "Invalid response from server",
        error: "Invalid JSON response",
      };
    }

    return data;
  } catch (error) {
    console.error("Token verification request failed:", error);
    return {
      success: false,
      message: "Failed to verify token",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
