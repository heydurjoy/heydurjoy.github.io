// Hamburger menu for mobile nav
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
        console.log('Hamburger clicked');
        navLinks.classList.toggle('open');
        console.log('navLinks:', navLinks, 'classList:', navLinks.classList.value);
    });
} 