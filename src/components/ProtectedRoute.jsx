import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "./common";

const ProtectedRoute = ({ children, requireOnboarded = true }) => {
  const { user, userProfile, authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;

  if (!user) return <Navigate to="/auth/signin" replace />;

  if (requireOnboarded && !userProfile?.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
