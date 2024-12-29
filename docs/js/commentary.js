$(document).ready(function () {
    document.querySelector('.toc-toggle-button').addEventListener('click', function() {
        const tocContent = document.querySelector('.toc-content');
        const toggleButton = document.querySelector('.toc-toggle-button');
        if (tocContent.style.display === 'none' || tocContent.style.display === '') {
            tocContent.style.display = 'block';
            toggleButton.textContent = '隠す';
        } else {
            tocContent.style.display = 'none';
            toggleButton.textContent = '表示';
        }
    });
});
