import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const createUserProfile = async (user, extraData = {}) => {
  if (!user || !user.uid) return null;

  const userRef = doc(db, 'users', user.uid);

  const fallbackProfile = {
    uid: user.uid,
    name: user.displayName || extraData.name || "",
    email: user.email || "",
    photoURL: user.photoURL || null,
    role: [],
    onboardingCompleted: false,
  };

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) return snap.data();

    const payload = {
      ...fallbackProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, payload);
    return payload;

  } catch (err) {
    console.warn("Firestore unavailable → using local profile");
    return fallbackProfile; // ✅ KEY FIX
  }
};

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid);
  try {
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (err) {
    console.warn('getUserProfile failed (possibly offline):', err && err.message ? err.message : err);
    return null;
  }
};

export const updateUserProfile = async (uid, data) => {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid);
  const payload = { ...data, updatedAt: serverTimestamp() };
  try {
    await updateDoc(userRef, payload);
    return true;
  } catch (err) {
    console.error('Error updating user profile:', err);
    // If offline, log and return false instead of throwing to avoid breaking UI flows
    if (err && (err.code === 'unavailable' || (err.message && err.message.toLowerCase().includes('client is offline')))) {
      console.warn('Firestore unavailable; update skipped.');
      return false;
    }
    throw err;
  }
};
