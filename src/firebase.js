// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeSPoGNdqnL4gN2DrYagx8_cUMh-YrPGo",
  authDomain: "xlance-b4fc6.firebaseapp.com",
  projectId: "xlance-b4fc6",
  storageBucket: "xlance-b4fc6.firebasestorage.app",
  messagingSenderId: "896412795774",
  appId: "1:896412795774:web:db33bdbe9eb868aa56292f",
  measurementId: "G-2PDRM32E0W"
};




const app = initializeApp(firebaseConfig);

// ✅ EXPORT BOTH
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
