// app/routes/auth.callback.tsx (updated logic for acquiring a real token)
import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus, SilentRequest } from "@azure/msal-browser";
import { loginRequest } from "~/auth-config";

export default function AuthCallback() {
  const { instance, accounts, inProgress } = useMsal();
  const [message, setMessage] = useState("Processing your sign-in...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) {
      return; // Wait until MSAL is done with its current operation
    }

    async function handleRedirect() {
      try {
        // Process the redirect
        const response = await instance.handleRedirectPromise();

        if (response) {
          // We already have a response with tokens from the redirect
          console.log(
            "Authentication successful with redirect response:",
            response
          );
          setMessage("Authentication successful! Redirecting...");

          // Store tokens securely
          localStorage.setItem("msalAccessToken", response.accessToken);
          if (response.idToken) {
            localStorage.setItem("msalIdToken", response.idToken);
          }

          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = "/projects";
          }, 1000);
        } else {
          // Check if we have accounts but no response (user might be already signed in)
          const currentAccounts = instance.getAllAccounts();

          if (currentAccounts.length > 0) {
            console.log("Found existing account:", currentAccounts[0]);
            setMessage("Acquiring tokens for existing session...");

            try {
              // Get a real token silently
              const silentRequest: SilentRequest = {
                ...loginRequest,
                account: currentAccounts[0],
              };

              const tokenResponse = await instance.acquireTokenSilent(
                silentRequest
              );
              console.log(
                "Successfully acquired token silently:",
                tokenResponse
              );

              // Store tokens
              localStorage.setItem(
                "msalAccessToken",
                tokenResponse.accessToken
              );
              if (tokenResponse.idToken) {
                localStorage.setItem("msalIdToken", tokenResponse.idToken);
              }

              setMessage("Authentication successful! Redirecting...");

              // Redirect to dashboard
              setTimeout(() => {
                window.location.href = "/projects";
              }, 1000);
            } catch (silentError) {
              console.error("Error acquiring token silently:", silentError);

              // If silent token acquisition fails, try interactive
              setMessage("Attempting interactive sign-in...");

              try {
                const interactiveResponse = await instance.acquireTokenPopup(
                  loginRequest
                );
                console.log(
                  "Successfully acquired token interactively:",
                  interactiveResponse
                );

                // Store tokens
                localStorage.setItem(
                  "msalAccessToken",
                  interactiveResponse.accessToken
                );
                if (interactiveResponse.idToken) {
                  localStorage.setItem(
                    "msalIdToken",
                    interactiveResponse.idToken
                  );
                }

                setMessage("Authentication successful! Redirecting...");

                // Redirect to dashboard
                setTimeout(() => {
                  window.location.href = "/projects";
                }, 1000);
              } catch (interactiveError) {
                console.error(
                  "Interactive token acquisition failed:",
                  interactiveError
                );
                setError(
                  "Failed to acquire authentication token. Please try logging in again."
                );
              }
            }
          } else {
            // No account found, redirect to login
            setError(
              "No authentication response received. Please try logging in again."
            );
          }
        }
      } catch (err) {
        console.error("Error during redirect handling:", err);
        setError(
          `Authentication failed: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }

    handleRedirect();
  }, [instance, inProgress]);

  if (error) {
    return (
      <div style={{ color: "red", padding: "20px" }}>
        <h1>Authentication Error</h1>
        <p>{error}</p>
        <button
          onClick={() => (window.location.href = "/login")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0078d4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Authentication</h1>
      <p>{message}</p>
      <div
        style={{
          display: "inline-block",
          width: "24px",
          height: "24px",
          border: "3px solid rgba(0, 120, 212, 0.2)",
          borderRadius: "50%",
          borderTopColor: "#0078d4",
          animation: "spin 1s linear infinite",
        }}
      ></div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
