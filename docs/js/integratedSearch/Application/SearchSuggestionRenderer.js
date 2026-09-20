import { clearContainer } from '../Middleware/DomWriter.js';

export function suggestNodesByLabel(label, searchSource) {
    if (!label || label.trim() === '') return [];
    const trimmed = label.trim().toLowerCase();
    return (Array.isArray(searchSource) ? searchSource : [])
        .filter(node => node && node.label && node.label.toLowerCase().includes(trimmed))
        .slice(0, 10);
}

export function renderSearchSuggestions(suggestions, options) {
    const { input, container, siteData } = options;
    if (!container) return;

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
        hideSearchSuggestions(container);
        return;
    }

    container.innerHTML = '';
    suggestions.forEach(node => {
        const li = document.createElement('li');
        li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #eee; transition: background-color 0.2s;';

        const textSpan = document.createElement('span');
        textSpan.textContent = node.label;
        textSpan.style.cssText = 'flex-grow: 1; cursor: pointer;';
        textSpan.addEventListener('click', event => {
            event.stopPropagation();
            input.value = node.label;
            hideSearchSuggestions(container);
        });

        const iconLink = document.createElement('a');
        const siteNode = (Array.isArray(siteData) ? siteData : []).find(sn => sn.label === node.label);
        iconLink.href = siteNode ? siteNode.url : '#';
        iconLink.className = 'icon-arrow-left-to-line';
        iconLink.style.cssText = 'margin-left: 10px; text-decoration: none; color: #555; font-size: 1.2em; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px;';
        iconLink.addEventListener('mouseover', function () { this.style.backgroundColor = '#ddd'; });
        iconLink.addEventListener('mouseout', function () { this.style.backgroundColor = 'transparent'; });
        iconLink.addEventListener('click', event => event.stopPropagation());

        li.appendChild(textSpan);
        li.appendChild(iconLink);
        li.addEventListener('mouseover', () => { li.style.backgroundColor = '#f0f0f0'; });
        li.addEventListener('mouseout', () => { li.style.backgroundColor = ''; });
        container.appendChild(li);
    });

    container.style.display = 'block';
}

export function hideSearchSuggestions(container) {
    if (!container) return;
    container.style.display = 'none';
}

export function clearSearchSuggestions() {
    clearContainer('labelSubstringSearchSuggestions');
}
