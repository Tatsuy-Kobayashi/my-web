document.addEventListener('DOMContentLoaded', function () {
    const stickyToggle = document.getElementById("stickyToggle");
    const header = document.querySelector("header");

    stickyToggle.addEventListener('click', function () {
        if (this.checked) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });
});
