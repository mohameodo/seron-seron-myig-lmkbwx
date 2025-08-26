import { db, auth } from './firebase.js';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const profileUsernameHeader = document.getElementById('profile-username');
    const profileUsernameMain = document.getElementById('profile-username-main');
    const postCount = document.getElementById('post-count');
    const postsContainer = document.getElementById('profile-posts-container');

    onAuthStateChanged(auth, async user => {
        if (user) {
            try {
                // Fetch user data
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    profileUsernameHeader.textContent = userData.username;
                    profileUsernameMain.textContent = userData.username;
                }

                // Fetch user's posts
                const postsQuery = query(
                    collection(db, 'posts'),
                    where('userId', '==', user.uid),
                    orderBy('timestamp', 'desc')
                );
                const querySnapshot = await getDocs(postsQuery);

                postCount.textContent = querySnapshot.size;
                postsContainer.innerHTML = ''; // Clear any placeholders

                querySnapshot.forEach(doc => {
                    const post = doc.data();
                    const postElement = document.createElement('div');
                    postElement.className = 'aspect-square bg-gray-200';
                    postElement.innerHTML = `<img src="${post.imageUrl}" alt="Post" class="w-full h-full object-cover">`;
                    postsContainer.appendChild(postElement);
                });

            } catch (error) {
                console.error('Error fetching profile data:', error);
                postsContainer.innerHTML = '<p class="text-red-500 col-span-3">Could not load profile.</p>';
            }
        } else {
            // Handle user not logged in
            profileUsernameMain.textContent = 'Not logged in';
        }
    });
});