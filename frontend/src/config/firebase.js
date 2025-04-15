import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLv8ssMafd43OgI9LqW0-QpuKJMjFB-hU",
  authDomain: "cloud-vault-88f26.firebaseapp.com",
  projectId: "cloud-vault-88f26",
  storageBucket: "cloud-vault-bucket",
  messagingSenderId: "134292262685",
  appId: "1:134292262685:web:254c63adc2488eda9e9bf4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider, storage, db }; 