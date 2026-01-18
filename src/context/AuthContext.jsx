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

  useEffect(() => {
    let unsubscribeProfile = null;

    if (user?.uid) {
      // Real-time profile subscription
      unsubscribeProfile = userService.subscribeToUserProfile(user.uid, (profile) => {
        setUserProfile(profile);
      });
    } else {
      setUserProfile(null);
    }

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [user]);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Profile is now handled by the separate useEffect above
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setAuthLoading(false);
      }
    });

    const safetyTimeout = setTimeout(() => {
      setAuthLoading((loading) => {
        if (loading) return false;
        return loading;
      });
    }, 4000);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

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

      // (Subscription effect will load profile)

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
      const result = await authService.loginWithGoogle();

      // Check if new user
      const { getAdditionalUserInfo } = await import("firebase/auth");
      const { isNewUser } = getAdditionalUserInfo(result) || {};

      setUser(result.user);

      // Handle profile creation if needed
      try {
        const profile = await userService.getUserProfile(result.user.uid);
        if (!profile) {
          await userService.createUserProfile(result.user.uid, {
            email: result.user.email,
            name: result.user.displayName,
            onboarded: false,
            role: []
          });
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
    refreshProfile: () => Promise.resolve() // No-op with real-time sync
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
