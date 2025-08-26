document.addEventListener('DOMContentLoaded', function() {
    const likeButtons = document.querySelectorAll('.like-button');

    likeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const heartIcon = button.querySelector('.fa-heart');
            // Toggle between 'far' (regular) and 'fas' (solid) and add our custom color class
            heartIcon.classList.toggle('far'); // regular
            heartIcon.classList.toggle('fas'); // solid
            heartIcon.classList.toggle('liked'); // custom class for color
        });
    });
});
