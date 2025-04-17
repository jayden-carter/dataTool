// Import the functions you need from the Firebase SDKs
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAkpIDIHkV3YrkGm1jqHdOFu8fE_5yrffk",
    authDomain: "datacartfront.firebaseapp.com",
    projectId: "datacartfront",
    storageBucket: "datacartfront.firebasestorage.app",
    messagingSenderId: "544659950888",
    appId: "1:544659950888:web:65f3f1ea9a3d634671941d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
