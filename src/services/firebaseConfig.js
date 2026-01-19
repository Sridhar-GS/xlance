// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6AduXP3Xcv8iJVfeO2JJv_61lu8sBp0o",
    authDomain: "xlance-aac8c.firebaseapp.com",
    projectId: "xlance-aac8c",
    storageBucket: "xlance-aac8c.firebasestorage.app",
    messagingSenderId: "18606152150",
    appId: "1:18606152150:web:f7d69b0428cf9e42806c77",
    measurementId: "G-MLEDK83G6S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;
