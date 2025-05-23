// app/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { AuthClient } from "../auth-service.client";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string; username: string } | null;
  loading: boolean;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  checkAuthStatus: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    username: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuthStatus = () => {
    // First check for MSAL accounts
    if (accounts.length > 0) {
      setIsAuthenticated(true);
      const account = accounts[0];
      setUser({
        name: account.name || "",
        email: account.username || "",
        username: account.username || "",
      });
    } else {
      // Fallback to our local storage tokens
      const isAuth = AuthClient.isAuthenticated();
      setIsAuthenticated(isAuth);
      setUser(isAuth ? AuthClient.getUser() : null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Only check auth when MSAL has completed initialization
    if (inProgress === "none") {
      checkAuthStatus();
    }
  }, [inProgress, accounts]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
