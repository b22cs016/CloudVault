// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZLFCD4600z7rPNaGxfZFjH79UBc-tUYU",
  authDomain: "cloudvault-d816e.firebaseapp.com",
  projectId: "cloudvault-d816e",
  storageBucket: "cloudvault-d816e.firebasestorage.app",
  messagingSenderId: "836782375694",
  appId: "1:836782375694:web:ecfb737622f626d40d0d5f",
  measurementId: "G-XMH5D26LEV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export const auth = firebase.auth();
export default firebase;