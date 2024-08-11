// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnTIkp-yWsp6k24haq_iDzIMOObMm2NJM",
  authDomain: "customer-support-assistant.firebaseapp.com",
  projectId: "customer-support-assistant",
  storageBucket: "customer-support-assistant.appspot.com",
  messagingSenderId: "495056457758",
  appId: "1:495056457758:web:67f1e2b22c70218c5e9e0f",
  measurementId: "G-ZGEQZ8V4XQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
const auth = getAuth(app);
// const db = getFirestore(app);

let analytics;

if (typeof window !== 'undefined') {
  // Check if analytics is supported in this environment
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(err => {
    console.error('Error initializing Firebase Analytics:', err);
  });
}

export { auth, firestore, firebaseConfig, analytics };