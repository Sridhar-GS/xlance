import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import GoogleIcon from "../assets/google-color-svgrepo-com.svg";
import AppleIcon from "../assets/apple-173-svgrepo-com.svg";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Input } from "../components/common";
import { validateEmail, validatePassword } from "../utils/helpers";
import PageTransition from "../components/common/PageTransition";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const eMap = {};
    if (!formData.name) eMap.name = "Name required";
    if (!validateEmail(formData.email)) eMap.email = "Invalid email";
    if (!validatePassword(formData.password)) eMap.password = "Min 8 characters";
    if (formData.password !== formData.confirmPassword)
      eMap.confirmPassword = "Passwords do not match";

    if (Object.keys(eMap).length) {
      setErrors(eMap);
      return;
    }

    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.name);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setErrors({ submit: err.message || "Signup failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="p-8">
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

            {/* GOOGLE SIGNUP */}
            <Button
              type="button"
              onClick={signInWithGoogle}
              variant="outline"
              className="w-full flex gap-3 mb-4"
            >
              <img src={GoogleIcon} className="w-5 h-5" />
              Continue with Google
            </Button>

            {/* APPLE (DISABLED) */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex gap-3 mb-6"
              onClick={() => alert("Apple Sign-In not enabled yet")}
            >
              <img src={AppleIcon} className="w-5 h-5" />
              Continue with Apple
            </Button>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t" />
              <span className="mx-4 text-sm text-gray-500">or</span>
              <div className="flex-grow border-t" />
            </div>

            {/* EMAIL SIGNUP */}
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button isLoading={isLoading} type="submit" className="w-full">
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
