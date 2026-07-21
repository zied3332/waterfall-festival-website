import type { ReactNode } from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { isAuthenticated } from "../../services/auth.service";

type ProtectedRouteProps = {
  children: ReactNode;
};

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;