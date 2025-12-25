import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const createUserProfile = async (user, extraData = {}) => {
  if (!user?.uid) return null;

  const ref = doc(db, "users", user.uid);

  const profile = {
    uid: user.uid,
    name: user.displayName || extraData.name || "",
    email: user.email || "",
    photoURL: user.photoURL || null,
    role: [],
    onboarded: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    await setDoc(ref, profile);
    return profile;
  } catch (err) {
    console.warn("Firestore unavailable, using local profile");
    return profile;
  }
};

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
};

export const updateUserProfile = async (uid, data) => {
  if (!uid) return false;
  try {
    await updateDoc(doc(db, "users", uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
};
