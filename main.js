import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { collection, query, getDocs, orderBy, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('feed-container');
    const logoutBtn = document.getElementById('logout-btn');

    let currentUser = null;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            loadFeed();
        } else {
            window.location.href = '/login.html';
        }
    });

    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = '/login.html';
        }).catch((error) => {
            console.error('Sign out error', error);
        });
    });

    const loadFeed = async () => {
        feedContainer.innerHTML = '';
        const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);

        for (const postDoc of querySnapshot.docs) {
            const postData = postDoc.data();
            const userDocRef = doc(db, 'users', postData.userId);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data();

            const postElement = createPostElement(postDoc.id, postData, userData);
            feedContainer.appendChild(postElement);
        }
    };

    const createPostElement = (postId, postData, userData) => {
        const postDiv = document.createElement('div');
        postDiv.className = 'bg-white border rounded-lg';

        const isLiked = postData.likes && postData.likes.includes(currentUser.uid);

        postDiv.innerHTML = `
            <div class="flex items-center p-3">
                <div class="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                <span class="font-semibold">${userData.username}</span>
            </div>
            <img src="${postData.imageUrl}" alt="Post image" class="w-full">
            <div class="p-3">
                <div class="flex items-center space-x-4 mb-2">
                    <button data-post-id="${postId}" class="like-btn text-2xl">
                        <i class="${isLiked ? 'fas fa-heart text-red-500' : 'far fa-heart'}"></i>
                    </button>
                    <button class="text-2xl"><i class="far fa-comment"></i></button>
                    <button class="text-2xl"><i class="far fa-paper-plane"></i></button>
                </div>
                <p class="font-semibold"><span class="like-count">${postData.likes ? postData.likes.length : 0}</span> likes</p>
                <p><span class="font-semibold">${userData.username}</span> ${postData.caption}</p>
            </div>
        `;

        const likeBtn = postDiv.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => toggleLike(postId, likeBtn, postDiv));

        return postDiv;
    };

    const toggleLike = async (postId, likeBtn, postDiv) => {
        const postRef = doc(db, 'posts', postId);
        const likeIcon = likeBtn.querySelector('i');
        const likeCountElement = postDiv.querySelector('.like-count');
        let currentLikes = parseInt(likeCountElement.textContent);

        if (likeIcon.classList.contains('far')) { // Not liked, so like it
            await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
            likeIcon.classList.remove('far');
            likeIcon.classList.add('fas', 'fa-heart', 'text-red-500');
            likeCountElement.textContent = currentLikes + 1;
        } else { // Liked, so unlike it
            await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
            likeIcon.classList.remove('fas', 'fa-heart', 'text-red-500');
            likeIcon.classList.add('far', 'fa-heart');
            likeCountElement.textContent = currentLikes - 1;
        }
    };
});