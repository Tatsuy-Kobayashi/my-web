import { escapeHtml } from './HtmlHelper.js';

export function buildPreviewLinkHtml(node) {
    if (!node) return '';
    if (Number(node.released) !== 1) return escapeHtml(node.label || '');

    const desc = node.description || '説明はありません。';
    const img = node.imageUrl || '';
    let html = '<div class="link-container">';
    html += `<a href="${escapeHtml(node.url || '#')}" class="preview-link" data-title="${escapeHtml(node.label || '')}" data-description="${escapeHtml(desc)}" data-image="${escapeHtml(img)}">${escapeHtml(node.label || '')}</a>`;
    html += '<div class="link-preview">';
    html += `<a href="${escapeHtml(node.url || '#')}" class="link-preview-clickable">`;
    if (img) {
        html += `<img class="preview-image" src="${escapeHtml(img)}" alt="Preview image">`;
    } else {
        html += '<img class="preview-image" src="" alt="Preview image" style="display:none;">';
    }
    html += `<h3 class="preview-title">${escapeHtml(node.label || '')}</h3>`;
    html += `<p class="preview-description">${escapeHtml(desc)}</p>`;
    html += '</a></div></div>';
    return html;
}

export function buildThumbnailHtml(node, cssClass = 'search-result-thumb') {
    if (!node || !Array.isArray(node.thumbnailUrl) || !node.thumbnailUrl[1]) return '';
    const src = escapeHtml(node.thumbnailUrl[1]);
    return `<img class="${escapeHtml(cssClass)}" src="${src}" alt="" referrerpolicy="no-referrer" loading="lazy" decoding="async">`;
}
