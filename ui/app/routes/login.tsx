// app/routes/login.tsx
import { useEffect } from "react";
import { useSearchParams } from "@remix-run/react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "~/auth-config";
import { RedirectRequest } from "@azure/msal-browser";
import { useAuth } from "~/providers/auth-provider";

export default function Login() {
  const { instance, inProgress } = useMsal();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/projects";

  useEffect(() => {
    // If already authenticated, redirect to target
    if (isAuthenticated) {
      window.location.href = redirectTo;
      return;
    }

    // Only attempt login when MSAL is fully initialized
    if (instance && inProgress === "none") {
      // Create redirect request with state to remember where to redirect after auth
      const request: RedirectRequest = {
        ...loginRequest,
        state: redirectTo, // Store the redirectTo URL in the state parameter
      };

      // Redirect to Microsoft login page
      instance.loginRedirect(request).catch((error) => {
        console.error("Login redirect failed:", error);
      });
    }
  }, [instance, inProgress, redirectTo, isAuthenticated]);

  return (
    <div className="login-container">
      <h1>Signing in to Microsoft Entra ID</h1>
      <p>You are being redirected to Microsoft for authentication...</p>
      <div className="loading-indicator">Loading...</div>
    </div>
  );
}
