import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import GoogleIcon from "../assets/google-color-svgrepo-com.svg";
import AppleIcon from "../assets/apple-173-svgrepo-com.svg";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Input } from "../components/common";
import { validateEmail, validatePassword } from "../utils/helpers";
import PageTransition from "../components/common/PageTransition";

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    signUp,
    signInWithGoogle,
    signInWithApple,
  } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const initialRole =
    location?.state?.role ||
    new URLSearchParams(location.search).get("role") ||
    null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateAccount = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!validateEmail(formData.email)) e.email = "Invalid email";
    if (!validatePassword(formData.password)) e.password = "Min 8 characters";
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ✅ EMAIL SIGNUP
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (!validateAccount()) return;

    setIsLoadingEmail(true);
    setErrors({});

    try {
      await signUp(formData.email, formData.password, formData.name);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setErrors({
        submit: err?.message || "Sign up failed",
      });
    } finally {
      setIsLoadingEmail(false);
    }
  };

  // ✅ GOOGLE SIGNUP (REDIRECT ONLY)
  const handleGoogleSignup = async () => {
    setIsLoadingSocial(true);
    setErrors({});
    try {
      await signInWithGoogle();
      // Redirect happens automatically
    } catch (err) {
      setErrors({ submit: err?.message || "Google sign-up failed" });
      setIsLoadingSocial(false);
    }
  };

  // ✅ APPLE SIGNUP
  const handleAppleSignup = async () => {
    setIsLoadingSocial(true);
    setErrors({});
    try {
      await signInWithApple();
    } catch (err) {
      setErrors({ submit: err?.message || "Apple sign-up failed" });
      setIsLoadingSocial(false);
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-center mb-2">
              Create your account
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Join Xlance today
            </p>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {errors.submit}
              </div>
            )}

            {/* SOCIAL */}
            <div className="space-y-4">
              <Button
                onClick={handleGoogleSignup}
                isLoading={isLoadingSocial}
                variant="outline"
                className="w-full flex gap-3"
              >
                <img src={GoogleIcon} className="w-5 h-5" />
                Sign up with Google
              </Button>

              <Button
                onClick={handleAppleSignup}
                isLoading={isLoadingSocial}
                variant="outline"
                className="w-full flex gap-3"
              >
                <img src={AppleIcon} className="w-5 h-5" />
                Sign up with Apple
              </Button>
            </div>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t" />
              <span className="mx-4 text-sm text-gray-500">or</span>
              <div className="flex-grow border-t" />
            </div>

            {/* EMAIL FORM */}
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                icon={<User size={18} />}
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                icon={<Mail size={18} />}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                icon={<Lock size={18} />}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                icon={<Lock size={18} />}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />

              <Button
                type="submit"
                isLoading={isLoadingEmail}
                className="w-full mt-4"
              >
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm mt-6">
              Already have an account?{" "}
              <Link to="/auth/signin" className="text-primary-600 font-medium">
                Sign In
              </Link>
            </p>
          </Card>
        </div>
      </main>
    </PageTransition>
  );
};

export default SignUpPage;
