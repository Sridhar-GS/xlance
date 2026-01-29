import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";
// Removed JobsContext
import { Navbar, Footer, ScrollToTop } from "./shared/components";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import usePushNotifications from "./shared/hooks/usePushNotifications";


import HomePage from "./features/home/pages/HomePage";
import SignInPage from "./features/auth/pages/SignInPage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import Onboarding from "./features/auth/pages/Onboarding";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import Reports from "./features/dashboard/pages/Reports";
import MyOrdersPage from "./features/orders/pages/MyOrdersPage";
import Messages from "./features/messages/pages/Messages";

// Refactored Gig Pages
import MarketplacePage from "./features/gigs/pages/MarketplacePage";
import GigDetailsPage from "./features/gigs/pages/GigDetailsPage";
import CreateGigPage from "./features/gigs/pages/CreateGigPage";
import MyGigsPage from "./features/gigs/pages/MyGigsPage";

// Order Pages
import CheckoutPage from "./features/orders/pages/CheckoutPage";
import OrderDetailsPage from "./features/orders/pages/OrderDetailsPage";

// Profile Pages
import CreateProfilePage from "./features/profile/pages/CreateProfilePage";
import ClientTalentPage from "./features/profile/pages/ClientTalentPage";
import TalentPage from "./features/profile/pages/TalentPage";
import FreelancerProfilePage from "./features/profile/pages/FreelancerProfilePage";
import ClientProfilePage from "./features/profile/pages/ClientProfilePage";
import SettingsPage from "./features/profile/pages/SettingsPage";

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
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/gigs/:gigId" element={<GigDetailsPage />} />
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

          {/* New Gig Routes - Public routes are above */}
          <Route
            path="/gigs/create"
            element={
              <ProtectedRoute>
                <CreateGigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-gigs"
            element={
              <ProtectedRoute>
                <MyGigsPage />
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

          {/* Order Routes */}
          <Route
            path="/checkout/:gigId"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
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
            path="/profile/create"
            element={
              <ProtectedRoute>
                <CreateProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Client Specific - Talent Search (Could be refactored later) */}
          <Route
            path="/client/talent"
            element={
              <ProtectedRoute>
                <ClientTalentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-profile/:id"
            element={
              <ProtectedRoute>
                <ClientProfilePage />
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
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}
