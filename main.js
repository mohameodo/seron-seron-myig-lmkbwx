document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('main');
    const inputs = document.querySelectorAll('input');
    const loginButton = document.querySelector('button[type="submit"]');

    // Fade in the main content on load
    setTimeout(() => {
        mainContent.style.opacity = '1';
    }, 100);

    // Function to check if both inputs have values
    function checkInputs() {
        const username = inputs[0].value.trim();
        const password = inputs[1].value.trim();
        loginButton.disabled = !(username && password);
    }

    // Add event listeners to inputs
    inputs.forEach(input => {
        input.addEventListener('keyup', checkInputs);
    });

    // Initial check
    checkInputs();
});
