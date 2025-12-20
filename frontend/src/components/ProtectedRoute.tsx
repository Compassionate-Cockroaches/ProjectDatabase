import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected route component that requires authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Redirect to welcome page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
}
