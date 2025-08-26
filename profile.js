import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const usernameHeader = document.getElementById('profile-username-header');
    const usernameElement = document.getElementById('profile-username');
    const postCountElement = document.getElementById('post-count');
    const postGrid = document.getElementById('post-grid');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadProfile(user);
        } else {
            window.location.href = '/login.html';
        }
    });

    const loadProfile = async (user) => {
        // Fetch user data
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data();

        usernameHeader.textContent = userData.username;
        usernameElement.textContent = userData.username;

        // Fetch user's posts
        const q = query(collection(db, 'posts'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);

        postCountElement.textContent = querySnapshot.size;
        postGrid.innerHTML = ''; // Clear existing posts

        querySnapshot.forEach((doc) => {
            const postData = doc.data();
            const postElement = document.createElement('div');
            postElement.className = 'aspect-square bg-gray-200';
            postElement.innerHTML = `<img src="${postData.imageUrl}" class="w-full h-full object-cover" alt="User post">`;
            postGrid.appendChild(postElement);
        });
    };
});