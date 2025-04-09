// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


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
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Handle login form submission (email/password)
document.getElementById('authForm').addEventListener('submit', function (e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Sign in with Firebase Authentication
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Store the user in localStorage
      localStorage.setItem('loggedInUser', JSON.stringify(user));

      // Redirect to dashboard (index.html)
      window.location.href = 'index.html';
    })
    .catch((error) => {
      // Show error message
      const errorMessage = error.message;
      const messageEl = document.getElementById('authMessage');
      messageEl.innerText = errorMessage;
      messageEl.classList.remove('hidden');
    });
});

// Google Sign-In logic
document.getElementById('googleSignInBtn').addEventListener('click', function() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      // Store the user in localStorage
      localStorage.setItem('loggedInUser', JSON.stringify(user));

      // Redirect to dashboard (index.html)
      window.location.href = 'index.html';
    })
    .catch((error) => {
      // Show error message if Google login fails
      const errorMessage = error.message;
      const messageEl = document.getElementById('authMessage');
      messageEl.innerText = errorMessage;
      messageEl.classList.remove('hidden');
    });
});
