import { db, auth } from './firebase.js';
import { collection, query, getDocs, orderBy, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('feed-container');

    onAuthStateChanged(auth, user => {
        if (user) {
            fetchPosts(user.uid);
        } else {
            feedContainer.innerHTML = '<p class="text-center text-gray-500">Please log in to see the feed.</p>';
        }
    });

    const fetchPosts = async (currentUserId) => {
        try {
            const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(postsQuery);
            feedContainer.innerHTML = ''; // Clear skeleton

            if (querySnapshot.empty) {
                feedContainer.innerHTML = '<p class="text-center text-gray-500">No posts yet. Be the first to share!</p>';
                return;
            }

            for (const postDoc of querySnapshot.docs) {
                const post = postDoc.data();
                const userDocRef = doc(db, 'users', post.userId);
                const userDocSnap = await getDoc(userDocRef);
                const username = userDocSnap.exists() ? userDocSnap.data().username : 'Unknown User';

                const postElement = createPostElement(postDoc.id, post, username, currentUserId);
                feedContainer.appendChild(postElement);
            }
        } catch (error) {
            console.error("Error fetching posts: ", error);
            feedContainer.innerHTML = '<p class="text-center text-red-500">Could not load feed.</p>';
        }
    };

    const createPostElement = (postId, post, username, currentUserId) => {
        const postDiv = document.createElement('div');
        postDiv.className = 'bg-white border border-gray-300 rounded-lg mb-4';

        const isLiked = post.likes && post.likes.includes(currentUserId);

        postDiv.innerHTML = `
            <div class="p-3 flex items-center">
                <div class="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                <span class="font-semibold">${username}</span>
            </div>
            <img src="${post.imageUrl}" alt="Post by ${username}" class="w-full">
            <div class="p-3">
                <div class="flex space-x-4 mb-2">
                    <button class="like-btn" data-post-id="${postId}">
                        <i class="${isLiked ? 'fas text-red-500' : 'far'} fa-heart text-2xl"></i>
                    </button>
                    <button><i class="far fa-comment text-2xl"></i></button>
                </div>
                <p class="font-semibold"><span class="like-count">${post.likes ? post.likes.length : 0}</span> likes</p>
                <p><span class="font-semibold">${username}</span> ${post.caption}</p>
            </div>
        `;

        const likeBtn = postDiv.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => handleLike(postId, currentUserId, likeBtn, postDiv));

        return postDiv;
    };

    const handleLike = async (postId, userId, likeBtn, postDiv) => {
        const postRef = doc(db, 'posts', postId);
        const likeIcon = likeBtn.querySelector('i');
        const likeCountSpan = postDiv.querySelector('.like-count');

        try {
            const postSnap = await getDoc(postRef);
            if (!postSnap.exists()) return;

            const postData = postSnap.data();
            const likes = postData.likes || [];

            if (likes.includes(userId)) {
                // Unlike
                await updateDoc(postRef, { likes: arrayRemove(userId) });
                likeIcon.classList.remove('fas', 'text-red-500');
                likeIcon.classList.add('far');
                likeCountSpan.textContent = parseInt(likeCountSpan.textContent) - 1;
            } else {
                // Like
                await updateDoc(postRef, { likes: arrayUnion(userId) });
                likeIcon.classList.remove('far');
                likeIcon.classList.add('fas', 'text-red-500');
                likeCountSpan.textContent = parseInt(likeCountSpan.textContent) + 1;
            }
        } catch (error) {
            console.error('Error updating like:', error);
        }
    };
});