import { auth, db } from './firebase.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

// --- AUTH STATE OBSERVER ---
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, user => {
        const isAuthPage = window.location.pathname === '/' || window.location.pathname === '/index.html';
        if (user) {
            // User is signed in.
            if (isAuthPage) {
                window.location.href = '/feed.html';
            }
        } else {
            // User is signed out.
            if (!isAuthPage) {
                window.location.href = '/index.html';
            }
        }
    });
});

// --- DOM ELEMENTS (for index.html) ---
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');
const toggleLink = document.getElementById('toggle-link');
const toggleText = document.getElementById('toggle-text');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');

// --- EVENT LISTENERS (for index.html) ---
if (loginForm) {
    // Toggle between Login and Signup forms
    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.classList.toggle('hidden');
        signupContainer.classList.toggle('hidden');
        if (signupContainer.classList.contains('hidden')) {
            toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link" class="text-blue-500 font-semibold">Sign up</a>`;
        } else {
            toggleText.innerHTML = `Have an account? <a href="#" id="toggle-link" class="text-blue-500 font-semibold">Log in</a>`;
        }
        // Re-add event listener to the new link
        document.getElementById('toggle-link').addEventListener('click', arguments.callee);
    });

    // Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                console.log('User logged in:', userCredential.user);
                loginError.textContent = '';
            })
            .catch(error => {
                loginError.textContent = error.message;
            });
    });

    // Signup
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Store additional user info in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                username: username,
                email: email
            });
            console.log('User signed up:', userCredential.user);
            signupError.textContent = '';
        } catch (error) {
            signupError.textContent = error.message;
        }
    });
}

// --- LOGOUT FUNCTIONALITY (for other pages) ---
const logoutBtn = document.getElementById('logout-btn') || document.getElementById('logout-btn-profile');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).catch(error => console.error('Sign out error', error));
    });
}