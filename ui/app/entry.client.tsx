// app/entry.client.tsx
import { hydrateRoot } from "react-dom/client";
import { RemixBrowser } from "@remix-run/react";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./auth-config";
import { useState, useEffect } from "react";
import { startTransition } from "react";
import { AuthProvider } from "./providers/auth-provider";

function MsalApp() {
  const [msalInstance, setMsalInstance] =
    useState<PublicClientApplication | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializeMsal() {
      try {
        const msal = new PublicClientApplication(msalConfig);
        await msal.initialize();

        try {
          await msal.handleRedirectPromise();
        } catch (redirectError) {
          console.error("Error handling redirect:", redirectError);
        }

        setMsalInstance(msal);
      } catch (error) {
        console.error("Failed to initialize MSAL:", error);
      } finally {
        setIsInitializing(false);
      }
    }

    initializeMsal();
  }, []);

  if (isInitializing) {
    return <RemixBrowser />;
  }

  return (
    <MsalProvider instance={msalInstance!}>
      <AuthProvider>
        <RemixBrowser />
      </AuthProvider>
    </MsalProvider>
  );
}

startTransition(() => {
  hydrateRoot(document, <MsalApp />);
});
