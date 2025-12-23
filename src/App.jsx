// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { JobsProvider } from "./context/JobsContext";
import { Navbar, Footer, ScrollToTop, LoadingScreen } from "./components/common";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import Onboarding from "./pages/Onboarding";
import DashboardPage from "./pages/DashboardPage";
import MyProjects from "./pages/MyProjects";
import Messages from "./pages/Messages";
import Reports from "./pages/Reports";
import FindWorkPage from "./pages/FindWorkPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import RoleSelectionPage from "./pages/RoleSelectionPage";

/**
 * Traffic controller for /dashboard
 * Redirects user to their specific role dashboard (client or freelancer)
 */
function DashboardRedirect() {
  const { userProfile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  const role = userProfile?.role;
  // If no role, they shouldn't be here, send to onboarding
  if (!role || (Array.isArray(role) && role.length === 0)) {
    return <Navigate to="/onboarding" replace />;
  }

  // Get first role (freelancer or client)
  const firstRole = Array.isArray(role) ? role[0] : role;
  return <Navigate to={`/dashboard/${firstRole}`} replace />;
}


function AppLayout() {
  const location = useLocation();
  
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  const isAuthPage = [
    "/auth/signin",
    "/auth/signup",
    "/auth/select-role",
    "/onboarding",
  ].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isAuthPage && <Navbar />}

      <main className="flex-1">
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        
          {/* If already logged in, show /onboarding instead of Signup/Signin */}
          <Route 
            path="/auth/signup" 
            element={user ? <Navigate to="/onboarding" replace /> : <SignUpPage />} 
          />
          <Route 
            path="/auth/signin" 
            element={user ? <Navigate to="/onboarding" replace /> : <SignInPage />} 
          />

        {/* Onboarding Route (logged-in but not yet onboarded) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarded={false}>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/auth/select-role"
          element={
            <ProtectedRoute requireOnboarded={false}>
              <RoleSelectionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/create"
          element={
            <ProtectedRoute>
              <CreateProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/:role"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <MyProjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/find-work"
          element={
            <ProtectedRoute>
              <FindWorkPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Auto redirect based on role */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* Convenience redirects */}
        <Route
          path="/client/dashboard"
          element={<Navigate to="/dashboard/client" replace />}
        />
        <Route
          path="/freelancer/dashboard"
          element={<Navigate to="/dashboard/freelancer" replace />}
        />

        {/* Catch-all → go home */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <JobsProvider>
        
            <AppLayout />
          
        </JobsProvider>
      </AuthProvider>
    </Router>
  );
}