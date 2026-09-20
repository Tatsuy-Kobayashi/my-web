import { ensureArray, escapeHtml } from '../Middleware/HtmlHelper.js';
import { getById, queryAll, writeToContainer } from '../Middleware/DomWriter.js';

export function renderTagList(allData, onTagSearch) {
    const tags = Array.from(new Set(
        ensureArray(allData).flatMap(item => Array.isArray(item.keywords) ? item.keywords : [])
            .map(tag => String(tag == null ? '' : tag).trim())
            .filter(Boolean)
    )).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    if (tags.length === 0) {
        writeToContainer('tagsList', '');
        return;
    }

    const html = tags.map((tag, idx) => (
        `<span class="tag-label" data-index="${idx}">` +
        `<a href="#" class="tag-search-link" data-tag="${escapeHtml(tag)}" title="タグ: ${escapeHtml(tag)}">` +
        `<span class="tag-label-text"># ${escapeHtml(tag)}</span></a></span>`
    )).join('');

    writeToContainer('tagsList', html);

    const container = getById('tagsList', { warn: false });
    queryAll('.tag-search-link', container).forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            onTagSearch(link.getAttribute('data-tag'));
        });
    });
}
