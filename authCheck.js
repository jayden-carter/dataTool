import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcacpYTrShmiUcGm8NgXucH6IRNlr3L5E",
  authDomain: "synq-data.firebaseapp.com",
  projectId: "synq-data",
  storageBucket: "synq-data.firebasestorage.app",
  messagingSenderId: "666582373055",
  appId: "1:666582373055:web:48a69368feb8c16ab52c0a",
  measurementId: "G-2E8MH39H3E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elements for loading and content
const loadingDiv = document.getElementById("loading");
const contentDiv = document.getElementById("content");

// Authentication state check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // User not authenticated, redirect to login
    window.location.replace("login.html");
  } else {
    // User authenticated, hide loading and show content
    loadingDiv.style.display = "none";
    contentDiv.style.display = "flex"; // Match the body's display: flex
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    // Attach logout event
    document.getElementById("logout").addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth)
        .then(() => {
          window.location.replace("login.html");
        })
        .catch((error) => {
          console.error("Logout failed:", error);
        });
    });
  }
});