import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import GoogleIcon from "../assets/google-color-svgrepo-com.svg";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Input } from "../components/common";
import { validateEmail } from "../utils/helpers";
import PageTransition from "../components/common/PageTransition";

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ EMAIL SIGN IN
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await signIn(formData.email, formData.password);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setErrors({ submit: err?.message || "Invalid email or password" });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ GOOGLE SIGN IN (THIS IS THE KEY FIX)
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setErrors({ submit: err?.message || "Google sign-in failed" });
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {/* 🔥 GOOGLE SIGN IN */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full flex gap-3 mb-4"
            >
              <img src={GoogleIcon} className="w-5 h-5" />
              Continue with Google
            </Button>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t" />
              <span className="mx-4 text-sm text-gray-500">or</span>
              <div className="flex-grow border-t" />
            </div>

            {/* EMAIL SIGN IN */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                icon={<Mail size={20} />}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                icon={<Lock size={20} />}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />

              <Button isLoading={isLoading} type="submit" className="w-full mt-6">
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  to="/auth/signup"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </main>
    </PageTransition>
  );
};

export default SignInPage;
