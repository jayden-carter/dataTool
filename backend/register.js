// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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

// Initialize Firebase using the modular API
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Attach event listener to the submit button
const submit = document.getElementById("submit");
submit.addEventListener('click', function(event) {
  event.preventDefault();
  
  // Get the current input values when the user clicks the button
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log("Create Account button clicked with email:", email);
  
  // Create the user using Firebase Authentication
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up successfully
      const user = userCredential.user;
      console.log("User created:", user);
      // Redirect to login.html after successful account creation
      window.location.href = "login.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error [${errorCode}]: ${errorMessage}`);
      // Optionally, display the errorMessage in your HTML.
      const errorEl = document.getElementById('error');
      errorEl.innerText = errorMessage;
      errorEl.classList.remove('hidden');
    });
});
