import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/providers/auth-provider";

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function RequireAuth({
  children,
  redirectTo,
}: RequireAuthProps) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/";
  const redirectPath =
    redirectTo || `/login?redirectTo=${encodeURIComponent(currentPath)}`;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(redirectPath);
    }
  }, [isAuthenticated, loading, navigate, redirectPath]);

  if (loading) {
    return <div>Verifying authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div>Authentication required</div>;
  }

  return <>{children}</>;
}
