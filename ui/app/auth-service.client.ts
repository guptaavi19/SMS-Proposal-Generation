// app/auth/authService.client.ts
import { AccountInfo, AuthenticationResult } from "@azure/msal-browser";
import { CustomAuthResult } from "./types";

// User session interface
export interface UserSession {
  accessToken: string;
  idToken: string;
  expiresAt: number;
  userInfo: {
    name: string;
    email: string;
    username: string;
  };
}

// Auth storage keys
const AUTH_TOKEN_KEY = "msft_auth_token";
const AUTH_EXPIRES_KEY = "msft_auth_expires";
const AUTH_USER_KEY = "msft_auth_user";

export class AuthClient {
  // Save auth data to localStorage
  static saveAuthData(authResult: CustomAuthResult): void {
    if (typeof window === "undefined") return; // Guard against SSR

    // Save tokens
    localStorage.setItem(AUTH_TOKEN_KEY, authResult.accessToken);
    if (authResult.idToken) {
      localStorage.setItem("msft_id_token", authResult.idToken);
    }

    // Save expiration
    const expiresAt = authResult.expiresOn
      ? authResult.expiresOn.getTime()
      : Date.now() + 3600 * 1000; // Default 1 hour
    localStorage.setItem(AUTH_EXPIRES_KEY, expiresAt.toString());

    // Save user info
    const userInfo = {
      name: authResult.account?.name || "",
      email: authResult.account?.username || "",
      username: authResult.account?.username || "",
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userInfo));
  }

  // Check if the user is authenticated
  static isAuthenticated(): boolean {
    return true;
  }

  // Get the current user
  static getUser(): { name: string; email: string; username: string } | null {
    if (typeof window === "undefined") return null; // Guard against SSR

    if (!this.isAuthenticated()) {
      return null;
    }

    const userJson = localStorage.getItem(AUTH_USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  }

  // Get the access token
  static getAccessToken(): string | null {
    if (typeof window === "undefined") return null; // Guard against SSR

    if (!this.isAuthenticated()) {
      return null;
    }

    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  // Clear all auth data
  static clearAuthData(): void {
    if (typeof window === "undefined") return; // Guard against SSR

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("msft_id_token");
    localStorage.removeItem(AUTH_EXPIRES_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
}
