import { auth } from '../../../shared/services/firebaseConfig';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    fetchSignInMethodsForEmail
} from 'firebase/auth';

export const authService = {
    // Sign up
    signup: async (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    },

    // Login
    login: async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    },

    // Google Login
    loginWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    },

    // Logout
    logout: async () => {
        return signOut(auth);
    },

    // Get current user (synchronous helper not possible with Firebase v9+, handled by AuthContext via onAuthStateChanged)
    // This is kept for compatibility but returns null if called directly. Context monitors state.
    getCurrentUser: () => {
        return auth.currentUser;
    },

    // Observer for auth state changes
    onAuthStateChanged: (callback) => {
        return onAuthStateChanged(auth, callback);
    },

    // Check if email exists
    checkEmailExists: async (email) => {
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            return methods.length > 0;
        } catch (error) {
            // If email enumeration protection is on, we might get an error or empty array.
            // We'll treat error as "unknown" (false) to let normal sign-up flow handle it.
            console.warn("Email check skipped/failed:", error);
            return false;
        }
    }
};
