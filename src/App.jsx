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

function AppLayout() {
  const location = useLocation();
  const { authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;

  const isAuthPage = ["/auth/signin", "/auth/signup", "/onboarding"].includes(
    location.pathname
  );

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isAuthPage && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/auth/signin" element={<SignInPage />} />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarded={false}>
                <Onboarding />
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
