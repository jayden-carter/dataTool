// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

// Firebase Configuration (use your own config values)
const firebaseConfig = {
  apiKey: "AIzaSyDcacpYTrShmiUcGm8NgXucH6IRNlr3L5E",
  authDomain: "synq-data.firebaseapp.com",
  projectId: "synq-data",
  storageBucket: "synq-data.firebasestorage.app",
  messagingSenderId: "666582373055",
  appId: "1:666582373055:web:48a69368feb8c16ab52c0a",
  measurementId: "G-2E8MH39H3E"
};

// Initialize Firebase using the modular API
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Attach event listener for form submission
document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();
  
  // Get input values at the time of submission
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  // Attempt to sign in with email and password
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Successful login: retrieve the user object
      const user = userCredential.user;
      console.log("User logged in:", user);
      
      // Store the user in localStorage (for session persistence)
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      
      // Redirect to dashboard (index.html)
      window.location.href = "index.html";
    })
    .catch((error) => {
      // Handle errors here
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error [" + errorCode + "]: " + errorMessage);
      // Optionally display the error message on the page by manipulating the DOM
      const errorEl = document.getElementById('error');
      errorEl.innerText = errorMessage;
      errorEl.classList.remove('hidden');
    });
});
