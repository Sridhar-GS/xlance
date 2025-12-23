import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "../firebase";
import { createUserProfile, getUserProfile } from "../services/user_services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for Auth State
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Always start loading when auth changes

      if (!firebaseUser) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        // 2. Sync with Firestore
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          profile = await createUserProfile(firebaseUser);
        }
        
        setUser(firebaseUser);
        setUserProfile(profile);
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false); // Stop loading only after everything is ready
      }
    });

    // Handle background social redirects
    getRedirectResult(auth).catch(() => {});

    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profile = await createUserProfile(cred.user, { name });
    setUserProfile(profile);
    return cred.user;
  };

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
  
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithRedirect(auth, provider);
  };

  const signInWithApple = () => {
    const provider = new OAuthProvider("apple.com");
    return signInWithRedirect(auth, provider);
  };

  const signOut = () => firebaseSignOut(auth);

  const refreshUserProfile = async () => {
    if (!auth.currentUser) return;
    const profile = await getUserProfile(auth.currentUser.uid);
    setUserProfile(profile);
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, signUp, signIn, signOut, signInWithGoogle, signInWithApple, refreshUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);