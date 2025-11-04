import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser, AppRole } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: AppRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { currentUser, loading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        toast.error("Please sign in to access this page");
        navigate("/auth");
      } else if (!allowedRoles.includes(currentUser.role)) {
        toast.error("You don't have permission to access this page");
        navigate("/");
      }
    }
  }, [currentUser, loading, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return null;
  }

  return <>{children}</>;
}
