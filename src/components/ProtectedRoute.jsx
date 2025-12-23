import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireOnboarded = true }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Show nothing or a spinner

  // 1. Not logged in
  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // 2. Profile not yet fetched
  if (!userProfile) return null;

  // 3. Logged in but NOT onboarded (and trying to access a restricted page)
  if (requireOnboarded && !userProfile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;