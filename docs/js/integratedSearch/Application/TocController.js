import { query } from '../Middleware/DomWriter.js';

export function initializeTocToggle() {
    const tocContent = query('.toc-content');
    if (!tocContent) {
        console.warn('[TOC] .toc-content not found');
        return;
    }

    const toggleButton = query('.toc-toggle-button');
    if (!toggleButton) {
        console.warn('[TOC] .toc-toggle-button not found');
        return;
    }

    if (toggleButton.dataset.tocBound === 'true') return;
    toggleButton.dataset.tocBound = 'true';
    tocContent.dataset.open = 'true';

    toggleButton.addEventListener('click', () => {
        if (tocContent.style.display === 'none' || tocContent.style.display === '') {
            tocContent.style.display = 'block';
            toggleButton.textContent = '隠す';
        } else {
            tocContent.style.display = 'none';
            toggleButton.textContent = '表示';
        }
    });
}
