const $next = document.querySelector('.next');
const $prev = document.querySelector('.prev');
let autoSlideInterval;

// Function to show the next slide
function showNextSlide() {
    const items = document.querySelectorAll('.item');
    document.querySelector('.slide').appendChild(items[0]);
}

// Function to show the previous slide
function showPrevSlide() {
    const items = document.querySelectorAll('.item');
    document.querySelector('.slide').prepend(items[items.length - 1]);
}

// Button click event listeners
$next.addEventListener('click', showNextSlide);
$prev.addEventListener('click', showPrevSlide);

// Start the auto-slide with a 1-second interval
function startAutoSlide() {
    autoSlideInterval = setInterval(showNextSlide, 9000);
}

// Stop the auto-slide
function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

// Start auto-slide on page load
startAutoSlide();

// Pause auto-slide on button hover
document.querySelector('.button_slide').addEventListener('mouseover', stopAutoSlide);
document.querySelector('.button_slide').addEventListener('mouseout', startAutoSlide);
