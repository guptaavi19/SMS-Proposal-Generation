// app/auth/authConfig.ts
import { Configuration, LogLevel } from "@azure/msal-browser";

// Get the current hostname for redirect URI (safe for SSR)
const getRedirectUri = () => {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}/auth/callback`;
  }
  // Default for SSR
  return "http://localhost:5173/auth/callback";
};

export const msalConfig: Configuration = {
  auth: {
    clientId: "73a7ce46-9279-43e7-9ca8-30d050ce966a ", // Replace with your app's client ID
    authority:
      "https://login.microsoftonline.com/dca13a8f-52cf-4bf2-b966-6b5fe11be437", // Replace with your tenant ID
    redirectUri: getRedirectUri(),
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "localStorage", // Use localStorage instead of sessionStorage
    storeAuthStateInCookie: true, // Required for IE11/Edge and redirect flow
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
      logLevel: LogLevel.Info,
    },
  },
};

// Define login request scopes
export const loginRequest = {
  scopes: ["User.Read", "profile", "openid", "email"], // Adjust as needed
};

// Define API request scopes (if accessing MS Graph or other APIs)
export const graphRequest = {
  scopes: ["User.Read", "Mail.Read"], // Adjust as needed
};
