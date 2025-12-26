import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { createUserProfile, getUserProfile } from "../services/user_services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // 🔥 Split loading states
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // 🔥 Restore cached profile (fast reload)
  useEffect(() => {
    const cached = localStorage.getItem("xlance_profile");
    if (cached) {
      try {
        setUserProfile(JSON.parse(cached));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem("xlance_profile");
        setAuthLoading(false);
        return;
      }

      // ✅ Auth is instant
      setUser(firebaseUser);
      setAuthLoading(false);

      // 🔥 Load profile in background
      setProfileLoading(true);
      try {
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          profile = await createUserProfile(firebaseUser);
        }
        setUserProfile(profile);
        localStorage.setItem("xlance_profile", JSON.stringify(profile));
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // -------- AUTH ACTIONS --------

  const signUp = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profile = await createUserProfile(cred.user, { name });
    setUserProfile(profile);
    localStorage.setItem("xlance_profile", JSON.stringify(profile));
    return cred.user;
  };

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem("xlance_profile");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        setUserProfile,
        authLoading,
        profileLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
