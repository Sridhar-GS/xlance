import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import GoogleIcon from "../../../assets/google-color-svgrepo-com.svg";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Input } from "../../../shared/components";
import { validateEmail, validatePassword } from "../../../shared/utils/helpers";
import PageTransition from "../../../shared/components/PageTransition";
import usePageTitle from "../../../shared/hooks/usePageTitle";

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  usePageTitle("Sign In");
  const { signIn, signUp, signInWithGoogle, checkEmailExists, user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  const isGoogleSigningIn = React.useRef(false);

  React.useEffect(() => {
    if (user && userProfile && !isGoogleSigningIn.current) {
      if (userProfile.onboarded) {
        const hasClientRole = Array.isArray(userProfile.role)
          ? userProfile.role.some(r => r.toLowerCase() === 'client')
          : userProfile.role?.toLowerCase() === 'client';

        const role = hasClientRole ? "client" : "freelancer";
        navigate(`/dashboard/${role}`, { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, userProfile, navigate]);

  const validateField = (name, value) => {
    if (!value) return "Required";
    if (name === 'email' && !validateEmail(value)) return "Invalid email format";
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation if field has been touched or currently has an error
    if (touched[name] || errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  // ✅ EMAIL SIGN IN (With Smart Auto-Signup)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ email: true, password: true });
      return;
    }

    setIsLoading(true);

    try {
      // Explicitly check for user existence to give clear feedback
      const exists = await checkEmailExists(formData.email);

      if (!exists) {
        setErrors({ email: "Unregistered user. Please Sign Up." });
        setIsLoading(false);
        return;
      }

      await signIn(formData.email, formData.password);

    } catch (err) {
      console.error("Auth Fail:", err);
      const errorCode = err.code;
      if (errorCode === "auth/wrong-password" || errorCode === "auth/invalid-credential") {
        setErrors({ submit: "Incorrect email or password." });
      } else if (errorCode === "auth/too-many-requests") {
        setErrors({ submit: "Too many attempts. Try later." });
      } else {
        setErrors({ submit: err.message || "Sign in failed" });
      }
      setIsLoading(false);
    }
  };

  // ✅ GOOGLE SIGN IN
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      isGoogleSigningIn.current = true; // Block auto-redirect

      // Use a custom import here if needed, or rely on AuthContext's return
      const { user: signedInUser, isNewUser } = await signInWithGoogle();

      // STRICT CHECK: If this is a NEW user, we DO NOT allow them on Sign In page.
      if (isNewUser) {
        // 1. Delete the accidentally created auth account
        await signedInUser.delete().catch(() => {
          // If delete fails (requires re-auth), at least sign out
          console.warn("User delete failed, signing out instead");
        });

        // 2. Ensure they are signed out (if delete didn't auto-do it)
        await import("../services/authService").then(m => m.authService.logout());

        // 3. Show Error
        setErrors({
          submit: (
            <div className="flex flex-col gap-1 items-center">
              <span>Account not found.</span>
              <Link to="/auth/signup" className="underline font-black hover:text-red-800">Please Join First</Link>
            </div>
          )
        });

        setIsLoading(false);
        isGoogleSigningIn.current = false; // Reset but stay on page (user is null now)
        return;
      }

      // If existing user, allow effect to redirect
      isGoogleSigningIn.current = false;
      // navigate removed, useEffect handles it
    } catch (err) {
      setErrors({ submit: err?.message || "Google sign-in failed" });
      setIsLoading(false);
      isGoogleSigningIn.current = false;
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-50">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[120px] -z-10" />

        <div className="w-full max-w-md relative z-10">
          <Card variant="glass-light" className="p-10 shadow-2xl border-white/60 relative group-card">

            {/* Back to Home - Inside Card */}
            <Link
              to="/"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100/50 transition-all duration-300 flex items-center gap-2 group overflow-hidden w-9 hover:w-32 bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm"
              title="Back to Home"
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-gray-500 group-hover:text-primary-600">
                <span className="font-bold text-xs">X</span>
              </div>
              <span className="text-xs font-bold text-gray-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                Back to Home
              </span>
            </Link>

            <div className="text-center mb-10">
              <div className="bg-primary-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
                <Lock className="text-white" size={24} />
              </div>
              <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">
                Welcome Back
              </h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Sign in to your talent or work hub</p>
            </div>

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider text-center">
                {errors.submit}
              </div>
            )}

            {/* 🔥 GOOGLE SIGN IN */}
            <Button
              type="button"
              isLoading={isLoading}
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full flex gap-3 mb-6 bg-white/60 border-white/80 h-14 rounded-2xl font-bold transition-all hover:bg-white hover:shadow-md"
            >
              <img src={GoogleIcon} className="w-5 h-5" />
              Continue with Google
            </Button>

            <div className="flex items-center my-8">
              <div className="flex-grow border-t border-gray-200/50" />
              <span className="mx-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">or login with email</span>
              <div className="flex-grow border-t border-gray-200/50" />
            </div>

            {/* EMAIL SIGN IN */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                name="email"
                type="email"
                icon={<Mail size={20} className="text-primary-500" />}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                className="bg-white/40 border-white/60 focus:bg-white transition-all h-14 rounded-2xl mt-1"
              />

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                  <Link to="/auth/forgot-password" size="sm" className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700">Forgot?</Link>
                </div>
                <Input
                  name="password"
                  type="password"
                  icon={<Lock size={20} className="text-primary-500" />}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  className="bg-white/40 border-white/60 focus:bg-white transition-all h-14 rounded-2xl"
                />
              </div>

              <Button
                isLoading={isLoading}
                type="submit"
                variant="neon-primary"
                className="w-full h-14 rounded-2xl mt-8 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] transform transition-all"
              >
                Enter Dashboard
              </Button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-loose">
                New to the platform?{" "}
                <Link
                  to="/auth/signup"
                  className="text-primary-600 hover:text-primary-700 font-black border-b-2 border-primary-600/20 hover:border-primary-600 transition-all ml-1"
                >
                  Join the Hub
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
