import { auth } from './firebaseConfig.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('content');

    // Show loading state
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (contentDiv) contentDiv.style.display = 'none';

    // Authentication state check
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log(`Authenticated as ${user.email}, Employee ID: ${sessionStorage.getItem('employeeId') || '260'}`);
            if (!sessionStorage.getItem('employeeId')) {
                sessionStorage.setItem('employeeId', '260');
            }
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (contentDiv) contentDiv.style.display = 'block';
        } else {
            console.log("No user authenticated, redirecting to login...");
            if (loadingDiv) loadingDiv.style.display = 'none';
            window.location.href = 'login.html';
        }
    });
});