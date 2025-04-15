// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLv8ssMafd43OgI9LqW0-QpuKJMjFB-hU",
  authDomain: "cloud-vault-88f26.firebaseapp.com",
  projectId: "cloud-vault-88f26",
  storageBucket: "cloud-vault-88f26.firebasestorage.app",
  messagingSenderId: "134292262685",
  appId: "1:134292262685:web:254c63adc2488eda9e9bf4",
  measurementId: "G-S04GY80XN0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Add scopes for Google provider (optional)
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');

export { auth, googleProvider, storage, db }; 