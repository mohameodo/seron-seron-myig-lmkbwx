import { db, storage, auth } from './firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const fileUpload = document.getElementById('file-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const captionInput = document.getElementById('caption-input');
    const postBtn = document.getElementById('post-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const uploadStatus = document.getElementById('upload-status');

    let selectedFile = null;
    let currentUser = null;

    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
        } else {
            currentUser = null;
            window.location.href = '/index.html'; // Redirect if not logged in
        }
    });

    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreviewContainer.classList.remove('hidden');
                captionInput.classList.remove('hidden');
                postBtn.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    postBtn.addEventListener('click', () => {
        if (!selectedFile || !currentUser) {
            uploadStatus.textContent = 'Please select a file and be logged in.';
            return;
        }

        postBtn.disabled = true;
        uploadStatus.textContent = 'Uploading...';
        progressContainer.classList.remove('hidden');

        const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}_${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress + '%';
            },
            (error) => {
                console.error('Upload failed:', error);
                uploadStatus.textContent = 'Upload failed! Please try again.';
                postBtn.disabled = false;
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    try {
                        await addDoc(collection(db, 'posts'), {
                            userId: currentUser.uid,
                            caption: captionInput.value,
                            imageUrl: downloadURL,
                            likes: [],
                            timestamp: serverTimestamp()
                        });
                        uploadStatus.textContent = 'Post created successfully!';
                        setTimeout(() => {
                            window.location.href = '/feed.html';
                        }, 1500);
                    } catch (error) {
                        console.error('Error adding document: ', error);
                        uploadStatus.textContent = 'Failed to create post.';
                        postBtn.disabled = false;
                    }
                });
            }
        );
    });
});