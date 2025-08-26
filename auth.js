import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    const loginBox = document.querySelector('.w-full.max-w-sm > div:first-of-type').parentElement;
    const signupContainer = document.getElementById('signup-container');

    // Redirect if user is already logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = '/index.html';
        }
    });

    showSignupBtn.addEventListener('click', () => {
        loginBox.classList.add('hidden');
        signupContainer.classList.remove('hidden');
    });

    showLoginBtn.addEventListener('click', () => {
        signupContainer.classList.add('hidden');
        loginBox.classList.remove('hidden');
    });

    // Login logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                window.location.href = '/index.html';
            })
            .catch((error) => {
                loginError.textContent = error.message;
            });
    });

    // Signup logic
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const username = document.getElementById('signup-username').value;

        if (!username) {
            signupError.textContent = 'Please enter a username.';
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                // Create a user document in Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    username: username,
                    email: email
                });
                window.location.href = '/index.html';
            })
            .catch((error) => {
                signupError.textContent = error.message;
            });
    });
});