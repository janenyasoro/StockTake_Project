import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAu9gkogPf4jQdAZNhF_AhwhzsoRqFUXp4",
  authDomain: "stockpulse-99c9a.firebaseapp.com",
  projectId: "stockpulse-99c9a",
  storageBucket: "stockpulse-99c9a.firebasestorage.app",
  messagingSenderId: "754393837827",
  appId: "1:754393837827:web:7d4e9fd7374fdb249c3936",
  measurementId: "G-W60QWWJ6WF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

console.log("✅ Firebase initialized successfully!");

export { auth, db, analytics };
export default app;
