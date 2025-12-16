import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const isAuthenticated = localStorage.getItem("erp-auth") === "true";
  
  // Also check if data is corrupted/missing to avoid dashboard crash
  const hasData = localStorage.getItem("erp-data-profile");

  if (!isAuthenticated || !hasData) {
    // If not authenticated OR data is missing, clear partial junk and force login
    localStorage.removeItem("erp-auth");
    localStorage.removeItem("erp-data-profile");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}