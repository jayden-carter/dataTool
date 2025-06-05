import { auth } from './firebaseConfig.js';
import { signInWithEmailAndPassword, browserLocalPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { browserSessionPersistence } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
// ...
setPersistence(auth, browserSessionPersistence)

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorElement = document.getElementById('error');

    if (!loginForm || !errorElement) {
        console.error("Login form or error element not found in DOM");
        return;
    }

    // Set persistence when the page loads
    setPersistence(auth, browserLocalPersistence)
        .then(() => {
            console.log("Persistence set to local");
        })
        .catch((error) => {
            console.error("Error setting persistence:", error);
        });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Logged in successfully:", userCredential.user.email);
                sessionStorage.setItem('employeeId', '260');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error("Login failed:", error.message);
                let errorMessage = error.message;
                if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password. Please try again.';
                } else if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No user found with this email.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email format.';
                }
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            });
    });
});