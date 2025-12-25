import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import { Card, Button, Input } from "../components/common";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../services/user_services";

const Onboarding = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [roleChoice, setRoleChoice] = useState("");
  const [freelancer, setFreelancer] = useState({
    headline: "",
    skills: "",
    yearsExperience: "",
  });
  const [client, setClient] = useState({
    companyType: "individual",
    companyName: "",
    hiringNeeds: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Redirect if already onboarded (FIXED FIELD NAME)
  useEffect(() => {
    if (!user || !userProfile) return;

    if (userProfile.onboarded) {
      const roles = userProfile.role || [];
      if (roles.includes("client") && !roles.includes("freelancer")) {
        navigate("/client/dashboard", { replace: true });
      } else {
        navigate("/freelancer/dashboard", { replace: true });
      }
    }
  }, [user, userProfile, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Not signed in
      </div>
    );
  }

  const onSubmit = async () => {
    if (!roleChoice) {
      setError("Please select a role");
      return;
    }

    setIsSaving(true);
    setError(null);

    const rolesArr =
      roleChoice === "both" ? ["client", "freelancer"] : [roleChoice];

    const payload = {
      role: rolesArr,
      onboarded: true, // ✅ FIXED
    };

    if (rolesArr.includes("freelancer")) {
      payload.freelancerProfile = {
        headline: freelancer.headline.trim(),
        skills: freelancer.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        yearsExperience: Number(freelancer.yearsExperience) || 0,
      };
    }

    if (rolesArr.includes("client")) {
      payload.clientProfile = {
        companyType: client.companyType,
        companyName: client.companyName.trim(),
        hiringNeeds: client.hiringNeeds.trim(),
      };
    }

    try {
      // 🔥 DO NOT BLOCK UI ON FIRESTORE
      updateUserProfile(user.uid, payload).catch(() => {});

      // 🔥 NAVIGATE IMMEDIATELY
      if (rolesArr.length === 1 && rolesArr[0] === "client") {
        navigate("/client/dashboard", { replace: true });
      } else {
        navigate("/freelancer/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Onboarding save failed:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      // 🔥 ALWAYS STOP LOADING
      setIsSaving(false);
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen flex items-start justify-center py-16 px-4">
        <div className="w-full max-w-2xl">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-1">Welcome to Xlance</h2>
            <p className="text-sm text-gray-500 mb-6">
              Tell us how you want to use Xlance and we’ll customise your
              experience.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* ROLE SELECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {["client", "freelancer", "both"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleChoice(r)}
                  className={`p-4 rounded-lg border transition ${
                    roleChoice === r
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">
                    {r === "client"
                      ? "Hire Freelancers"
                      : r === "freelancer"
                      ? "Work as a Freelancer"
                      : "Both"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {r === "client"
                      ? "Find and hire top talent"
                      : r === "freelancer"
                      ? "Find projects and clients"
                      : "Hire and work on projects"}
                  </div>
                </button>
              ))}
            </div>

            {/* FREELANCER FORM */}
            {(roleChoice === "freelancer" || roleChoice === "both") && (
              <section className="mb-6">
                <h3 className="font-medium mb-3">Freelancer Details</h3>
                <Input
                  label="Headline"
                  value={freelancer.headline}
                  onChange={(e) =>
                    setFreelancer((s) => ({
                      ...s,
                      headline: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Skills (comma separated)"
                  value={freelancer.skills}
                  onChange={(e) =>
                    setFreelancer((s) => ({
                      ...s,
                      skills: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  value={freelancer.yearsExperience}
                  onChange={(e) =>
                    setFreelancer((s) => ({
                      ...s,
                      yearsExperience: e.target.value,
                    }))
                  }
                />
              </section>
            )}

            {/* CLIENT FORM */}
            {(roleChoice === "client" || roleChoice === "both") && (
              <section className="mb-6">
                <h3 className="font-medium mb-3">Client Details</h3>

                <div className="flex gap-4 mb-3">
                  {["individual", "company"].map((t) => (
                    <label key={t} className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={client.companyType === t}
                        onChange={() =>
                          setClient((c) => ({ ...c, companyType: t }))
                        }
                      />
                      <span className="ml-2 capitalize">{t}</span>
                    </label>
                  ))}
                </div>

                <Input
                  label="Company Name (optional)"
                  value={client.companyName}
                  onChange={(e) =>
                    setClient((s) => ({
                      ...s,
                      companyName: e.target.value,
                    }))
                  }
                />

                <textarea
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200"
                  value={client.hiringNeeds}
                  onChange={(e) =>
                    setClient((s) => ({
                      ...s,
                      hiringNeeds: e.target.value,
                    }))
                  }
                />
              </section>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button
                onClick={onSubmit}
                isLoading={isSaving}
                disabled={!roleChoice}
              >
                Continue
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </PageTransition>
  );
};

export default Onboarding;
