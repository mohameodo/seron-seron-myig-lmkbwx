import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-upload');
    const captionInput = document.getElementById('caption');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const uploadStatus = document.getElementById('upload-status');

    let currentUser = null;
    let selectedFile = null;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
        } else {
            window.location.href = '/login.html';
        }
    });

    fileInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(selectedFile);
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectedFile || !currentUser) {
            uploadStatus.textContent = 'Please select a file to upload.';
            uploadStatus.classList.add('text-red-500');
            return;
        }

        uploadStatus.textContent = 'Uploading...';
        uploadStatus.classList.remove('text-red-500', 'text-green-500');

        try {
            // 1. Upload image to Firebase Storage
            const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}_${selectedFile.name}`);
            const snapshot = await uploadBytes(storageRef, selectedFile);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Add post data to Firestore
            await addDoc(collection(db, 'posts'), {
                userId: currentUser.uid,
                caption: captionInput.value,
                imageUrl: downloadURL,
                likes: [],
                timestamp: serverTimestamp()
            });

            uploadStatus.textContent = 'Post shared successfully!';
            uploadStatus.classList.add('text-green-500');
            setTimeout(() => { window.location.href = '/index.html' }, 1500);

        } catch (error) {
            console.error('Error uploading post:', error);
            uploadStatus.textContent = 'Failed to share post. Please try again.';
            uploadStatus.classList.add('text-red-500');
        }
    });
});