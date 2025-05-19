// app/routes/logout.tsx
import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "@remix-run/react";
import { AuthClient } from "~/auth-service.client";
import { useAuth } from "~/providers/auth-provider";

export default function Logout() {
  const { instance, inProgress, accounts } = useMsal();
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    // Clear local storage auth data
    AuthClient.clearAuthData();

    // Update auth context
    checkAuthStatus();

    // Only attempt MSAL logout when MSAL is fully initialized
    if (instance && inProgress === "none") {
      const logoutRequest = {
        account: accounts.length > 0 ? accounts[0] : undefined,
        postLogoutRedirectUri: `${window.location.origin}/`,
        onRedirectNavigate: () => false, // Prevents automatic navigation
      };

      console.log("Starting client-side logout");

      // Perform MSAL logout
      instance.logoutRedirect(logoutRequest).catch((error) => {
        console.error("Logout error:", error);
        // Ensure we redirect even if MSAL logout fails
        navigate("/");
      });
    } else {
      // Redirect anyway if MSAL isn't available
      navigate("/");
    }
  }, [instance, accounts, inProgress, navigate, checkAuthStatus]);

  return (
    <div className="logout-page">
      <h1>Signing Out</h1>
      <p>Please wait while we sign you out...</p>
      <div className="loading-spinner"></div>
    </div>
  );
}
