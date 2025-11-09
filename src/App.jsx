import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, Footer } from './components/common';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/auth/signin" element={<SignInPage />} />
          <Route path="/dashboard/:role" element={<DashboardPage />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
