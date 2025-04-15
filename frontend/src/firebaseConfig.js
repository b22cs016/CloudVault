// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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