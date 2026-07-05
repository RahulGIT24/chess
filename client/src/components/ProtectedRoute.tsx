import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export default function ProtectedRoute() {
  const [, authenticated] = useAuth();

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
