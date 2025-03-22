import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
  allowedUserType?: "volunteer" | "recruiter" | "both";
};

export function ProtectedRoute({
  path,
  component: Component,
  allowedUserType = "both",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Custom wrapper to check auth and user type
  const ProtectedComponent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!user) {
      setLocation("/auth");
      return null;
    }

    // Check if user type is allowed
    if (
      allowedUserType !== "both" &&
      user.userType !== allowedUserType
    ) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-center mb-6">
            You don't have permission to access this page as a {user.userType}.
          </p>
          <button
            onClick={() => setLocation("/")}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Go to Home
          </button>
        </div>
      );
    }

    return <Component />;
  };

  return <Route path={path} component={ProtectedComponent} />;
}
