import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "../services/authService";
import { userService } from "../services/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkEmailExists = async (email) => {
    return await authService.checkEmailExists(email);
  };

  const loadProfile = useCallback(async (uid) => {
    try {
      const profile = await userService.getUserProfile(uid);
      setUserProfile(profile);
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError("Failed to load user profile");
    }
  }, []);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          await loadProfile(firebaseUser.uid);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setAuthLoading(false);
      }
    });

    // Safety timeout: If Firebase takes too long (e.g. network issue), stopped loading
    const safetyTimeout = setTimeout(() => {
      setAuthLoading((loading) => {
        if (loading) {
          console.warn("Auth check timed out, forcing app load.");
          return false;
        }
        return loading;
      });
    }, 4000);

    // Cleanup subscription
    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [loadProfile]);

  const signUp = async (email, password, name) => {
    try {
      setAuthLoading(true);
      const result = await authService.signup(email, password);

      // OPTIMIZATION: Start profile creation but don't blocking navigation
      // We set the user immediately so the UI can proceed
      setUser(result.user);

      userService.createUserProfile(result.user.uid, {
        email: result.user.email,
        name: name
      }).then(newProfile => {
        setUserProfile(newProfile);
      }).catch(err => console.error("Background profile creation failed:", err));

      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setAuthLoading(true);
      const result = await authService.login(email, password);

      // OPTIMIZATION: Set user immediately
      setUser(result.user);

      // Load profile in background
      loadProfile(result.user.uid);

      return result.user;
    } catch (err) {
      // setError(err.message); // Disable global error to allow local handling
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Do NOT set global authLoading(true) here. It unmounts the UI and destroys verification states.
      // setAuthLoading(true); 

      const result = await authService.loginWithGoogle();

      // Check if new user
      const { getAdditionalUserInfo } = await import("firebase/auth");
      const { isNewUser } = getAdditionalUserInfo(result) || {};

      setUser(result.user);

      // Handle profile check/creation (Awaited to avoid race condition with strict Sign-Up logout)
      try {
        const profile = await userService.getUserProfile(result.user.uid);
        if (!profile) {
          const newProfile = await userService.createUserProfile(result.user.uid, {
            email: result.user.email,
            name: result.user.displayName,
            onboarded: false,
            role: []
          });
          setUserProfile(newProfile);
        } else {
          setUserProfile(profile);
        }
      } catch (err) {
        console.error("Profile sync failed:", err);
      }

      return { user: result.user, isNewUser };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      // setAuthLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setAuthLoading(true);
      await authService.logout();
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    setUserProfile,
    authLoading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    checkEmailExists,
    refreshProfile: () => user ? loadProfile(user.uid) : Promise.resolve()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
