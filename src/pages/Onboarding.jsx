import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import { Card, Button, Input } from "../components/common";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";

import { Laptop, Users, Rocket, Target, Zap, ShieldCheck, Trophy, ArrowRight, User, Star } from 'lucide-react';

const Onboarding = () => {
  const { user, userProfile, setUserProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [roleChoice, setRoleChoice] = useState("");
  const [freelancer, setFreelancer] = useState({
    headline: "",
    skills: "",
    experienceLevel: "",
  });
  const [client, setClient] = useState({
    companyType: "individual",
    companyName: "",
    hiringNeeds: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Redirect if already onboarded
  useEffect(() => {
    if (!user || !userProfile) return;

    if (userProfile.onboarded) {
      const roles = userProfile.role || [];
      if (roles.includes("client") && !roles.includes("freelancer")) {
        navigate("/dashboard/client", { replace: true });
      } else {
        navigate("/dashboard/freelancer", { replace: true });
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
      onboarded: true,
    };

    if (rolesArr.includes("freelancer")) {
      payload.freelancerProfile = {
        headline: freelancer.headline.trim(),
        skills: freelancer.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experienceLevel: freelancer.experienceLevel,
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
      // 🔥 UPDATE LOCAL STATE IMMEDIATELY
      setUserProfile((prev) => ({
        ...prev,
        ...payload,
      }));

      // 🔥 UPDATE SERVICE (MUST AWAIT!)
      await userService.updateUserProfile(user.uid, payload);

      // 🔥 NAVIGATE AFTER SUCCESS
      if (rolesArr.length === 1 && rolesArr[0] === "client") {
        navigate("/dashboard/client", { replace: true });
      } else {
        navigate("/dashboard/freelancer", { state: { newFreelancer: true }, replace: true });
      }
    } catch (err) {
      console.error("Onboarding save failed:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-50 py-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-2xl relative z-10">
        <Card variant="glass-light" className="p-10 shadow-2xl border-white/60">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">
              Complete Your Profile
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Customize your Xlance experience</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          {/* ROLE SELECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {[
              { id: "client", label: "Hire Talent", desc: "Build your dream team", icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
              { id: "freelancer", label: "Find Work", desc: "Scale your services", icon: Laptop, color: 'text-primary-600', bg: 'bg-primary-50' }
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = roleChoice === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoleChoice(r.id)}
                  className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col group ${isSelected
                    ? "border-primary-500 bg-white shadow-xl shadow-primary-500/10 scale-[1.02]"
                    : "border-white/60 bg-white/30 hover:border-white hover:bg-white/50"
                    }`}
                >
                  <div className={`p-3 rounded-2xl w-fit mb-4 transition-colors ${isSelected ? r.bg + " " + r.color : "bg-gray-100 text-gray-400"}`}>
                    <Icon size={24} />
                  </div>
                  <div className={`font-black text-sm uppercase tracking-widest mb-1 ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                    {r.label}
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed">
                    {r.desc}
                  </div>
                  {isSelected && (
                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-primary-600 uppercase tracking-widest">
                      Selection Active <ArrowRight size={10} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* FREELANCER FORM */}
          {(roleChoice === "freelancer" || roleChoice === "both") && (
            <section className="mb-10 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-primary-600 rounded-full" />
                <div>
                  <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-gray-400">Freelancer Configuration</h3>
                  <p className="text-[9px] font-bold text-gray-500 uppercase">Core professional parameters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Professional Headline"
                  placeholder="e.g. Senior Full Stack Developer"
                  value={freelancer.headline}
                  onChange={(e) =>
                    setFreelancer((s) => ({ ...s, headline: e.target.value }))
                  }
                  className="bg-white/50 border-white/80 focus:bg-white transition-all h-16 rounded-3xl"
                />
                <Input
                  label="Top Skills"
                  placeholder="React, Node.js, Design..."
                  value={freelancer.skills}
                  onChange={(e) =>
                    setFreelancer((s) => ({ ...s, skills: e.target.value }))
                  }
                  className="bg-white/50 border-white/80 focus:bg-white transition-all h-16 rounded-3xl"
                />
              </div>

              {/* EXPERIENCE SELECTION */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Experience Level</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { val: 'Beginner', icon: Star },
                    { val: 'Intermediate', icon: Zap },
                    { val: 'Expert', icon: ShieldCheck },
                    { val: 'Professional', icon: Trophy }
                  ].map((level) => {
                    const ExpIcon = level.icon;
                    const isSelected = freelancer.experienceLevel === level.val;
                    return (
                      <button
                        key={level.val}
                        type="button"
                        onClick={() => setFreelancer(s => ({ ...s, experienceLevel: level.val }))}
                        className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group ${isSelected
                          ? "border-primary-500 bg-primary-50/50 shadow-md"
                          : "border-white/60 bg-white/20 hover:bg-white/40"
                          }`}
                      >
                        <div className={`p-2 rounded-xl ${isSelected ? "bg-primary-500 text-white" : "bg-white/60 text-gray-400 group-hover:text-primary-400"}`}>
                          <ExpIcon size={20} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-primary-700" : "text-gray-500"}`}>
                          {level.val}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* CLIENT FORM */}
          {(roleChoice === "client" || roleChoice === "both") && (
            <section className="mb-10 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-purple-600 rounded-full" />
                <div>
                  <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-gray-400">Client Intelligence</h3>
                  <p className="text-[9px] font-bold text-gray-500 uppercase">Organizational parameters</p>
                </div>
              </div>

              <div className="flex gap-4 p-2 bg-white/30 rounded-[2rem] border border-white/60 w-fit mb-6">
                {["individual", "company"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setClient((c) => ({ ...c, companyType: t }))}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${client.companyType === t
                      ? "bg-white text-purple-700 shadow-xl"
                      : "text-gray-500 hover:text-gray-800"
                      }`}
                  >
                    {t === 'individual' ? <User size={14} /> : <Users size={14} />}
                    {t}
                  </button>
                ))}
              </div>

              <Input
                label="Full Entity Name"
                placeholder="Individual or Company name"
                value={client.companyName}
                onChange={(e) =>
                  setClient((s) => ({ ...s, companyName: e.target.value }))
                }
                className="bg-white/50 border-white/80 focus:bg-white transition-all h-16 rounded-3xl"
              />

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Strategic Goals</label>
                <textarea
                  rows={4}
                  placeholder="Describe your primary objectives..."
                  className="w-full px-6 py-5 rounded-[2.5rem] border-2 border-white/60 bg-white/30 focus:bg-white transition-all focus:outline-none focus:border-purple-500 placeholder-gray-400 text-gray-900 shadow-sm"
                  value={client.hiringNeeds}
                  onChange={(e) =>
                    setClient((s) => ({ ...s, hiringNeeds: e.target.value }))
                  }
                />
              </div>
            </section>
          )}

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/40">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" /> Secure Protocol v2
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" className="px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-gray-500" onClick={async () => {
                await signOut();
                navigate("/auth/signup");
              }}>
                Abort
              </Button>
              <Button
                variant="neon-primary"
                onClick={onSubmit}
                isLoading={isSaving}
                disabled={!roleChoice}
                className="px-12 h-14 rounded-2xl shadow-xl shadow-primary-500/20 hover:scale-[1.05] transform transition-all font-black uppercase tracking-[0.2em] text-[11px]"
              >
                Execute Initialization
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Onboarding;
