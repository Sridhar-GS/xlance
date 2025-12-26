// src/pages/RoleSelectionPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../services/user_services";
import { Button } from "../components/common";

const RoleSelectionPage = () => {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, loading: authLoading, userProfile } = useAuth();
  const navigate = useNavigate();

  // If not logged in, send to sign in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth/signin", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // If onboarding already done, skip this page
  useEffect(() => {
    if (userProfile && userProfile.onboardingCompleted) {
      const roles = userProfile.role || [];
      if (roles.includes("freelancer") && !roles.includes("client")) {
        navigate("/dashboard/freelancer", { replace: true });
      } else if (roles.includes("client") && !roles.includes("freelancer")) {
        navigate("/dashboard/client", { replace: true });
      } else if (roles.includes("client") && roles.includes("freelancer")) {
        navigate("/dashboard/freelancer", { replace: true });
      }
    }
  }, [userProfile, navigate]);

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    setError("");
  };

  const handleSubmit = async () => {
    if (!role) {
      setError("Please select a role to continue.");
      return;
    }
    if (!user) {
      setError("You must be signed in to continue.");
      return;
    }

    setLoading(true);
    try {
      const rolesArr = role === "both" ? ["client", "freelancer"] : [role];
      await updateUserProfile(user.uid, {
        role: rolesArr,
        onboardingCompleted: true,
      });
      navigate("/profile/create");
    } catch (err) {
      console.error(err);
      setError("Failed to update role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Welcome to Xlance!
        </h2>
        <p className="text-gray-600 mb-8">
          To get started, please tell us what you're here to do.
        </p>

        <div className="space-y-4">
          <RoleCard
            title="I'm a Client"
            description="I want to hire freelancers for my projects."
            isSelected={role === "client"}
            onSelect={() => handleRoleSelection("client")}
          />
          <RoleCard
            title="I'm a Freelancer"
            description="I'm looking for work and want to offer my services."
            isSelected={role === "freelancer"}
            onSelect={() => handleRoleSelection("freelancer")}
          />
          <RoleCard
            title="I'm Both"
            description="I want to hire and also offer my services."
            isSelected={role === "both"}
            onSelect={() => handleRoleSelection("both")}
          />
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="mt-8">
          <Button
            onClick={handleSubmit}
            disabled={!role || loading}
            className="w-full"
          >
            {loading ? "Continuing..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const RoleCard = ({ title, description, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`p-6 border rounded-lg cursor-pointer transition-all duration-200 ${
      isSelected
        ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500"
        : "border-gray-300 hover:border-gray-400"
    }`}
  >
    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    <p className="text-sm text-gray-600 mt-1">{description}</p>
  </div>
);

export default RoleSelectionPage;