import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


// Firebase configuration (remove unused measurementId for clarity)
const firebaseConfig = {
    apiKey: "AIzaSyDcacpYTrShmiUcGm8NgXucH6IRNlr3L5E",
    authDomain: "synq-data.firebaseapp.com",
    projectId: "synq-data",
    storageBucket: "synq-data.firebasestorage.app",
    messagingSenderId: "666582373055",
    appId: "1:666582373055:web:48a69368feb8c16ab52c0a"
};

// Initialize the Firebase app
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);