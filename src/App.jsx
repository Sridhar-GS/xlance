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
import { Navbar, Footer, ScrollToTop } from "./components/common";
import ProtectedRoute from "./components/ProtectedRoute";
import usePushNotifications from "./hooks/usePushNotifications";


import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import Onboarding from "./pages/Onboarding";
import DashboardPage from "./pages/DashboardPage";
import FindWorkPage from "./pages/FindWorkPage";
import Reports from "./pages/Reports";
import JobDetailsPage from "./pages/JobDetailsPage";
import MyProjects from "./pages/MyProjects";
import Messages from "./pages/Messages";
import PostJobPage from "./pages/PostJobPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import ClientJobsPage from "./pages/ClientJobsPage";
import ClientTalentPage from "./pages/ClientTalentPage";
import TalentPage from "./pages/TalentPage";
import FreelancerProfilePage from "./pages/FreelancerProfilePage";

function AppLayout() {
  const { authLoading, error, user } = useAuth(); // Get user
  const location = useLocation();

  // Initialize Push Notifications
  usePushNotifications(user?.uid);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading XLance...</p>
        </div>
      </div>
    );
  }

  // Show Navbar everywhere EXCEPT Onboarding
  const showNav = !['/onboarding'].includes(location.pathname);

  // Show Footer everywhere EXCEPT Onboarding and Messages (Messages is full-height app-like)
  const showFooter = !['/onboarding', '/messages'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />


      {error && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm font-medium z-[100]">
          {typeof error === 'string' ? error : 'A system error occurred. Please refresh.'}
        </div>
      )}

      {showNav && <Navbar />}

      {/* Main fills 100vh minus header if Footer is invalid (like in Messages), else flex-1 */}
      <main className={`flex-1 flex flex-col ${!showFooter ? 'min-h-0' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/talent" element={<TalentPage />} />
          <Route path="/talent/:id" element={<FreelancerProfilePage />} />
          <Route path="/auth/signin" element={<SignInPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />

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

          <Route
            path="/find-work"
            element={
              <ProtectedRoute>
                <FindWorkPage />
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

          <Route
            path="/jobs/:jobId"
            element={
              <ProtectedRoute>
                <JobDetailsPage />
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
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/post-job"
            element={
              <ProtectedRoute>
                <PostJobPage />
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
            path="/client/jobs"
            element={
              <ProtectedRoute>
                <ClientJobsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/talent"
            element={
              <ProtectedRoute>
                <ClientTalentPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
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
