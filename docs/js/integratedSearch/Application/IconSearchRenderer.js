import { ensureArray, escapeHtml } from '../Middleware/HtmlHelper.js';
import { getById, queryAll, writeToContainer } from '../Middleware/DomWriter.js';

export function renderIconButtonList(allData, onIconSearch) {
    const icons = Array.from(new Set(
        ensureArray(allData).flatMap(item => {
            if (!item || item.iconClass == null) return [];
            return Array.isArray(item.iconClass) ? item.iconClass : [item.iconClass];
        }).map(icon => String(icon == null ? '' : icon).trim()).filter(Boolean)
    )).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    let html = '<span class="icon-label" data-index="home"><a href="https://tatsuy-kobayashi.github.io/my-web/docs/"><span class="icon-label-content"><i class="fa fa-home fa-fw" aria-hidden="true"></i></span></a></span>';
    html += icons.map((icon, idx) => (
        `<span class="icon-label" data-index="${idx}">` +
        `<a href="#" class="icon-search-link" data-icon="${escapeHtml(icon)}" title="アイコン: ${escapeHtml(icon)}">` +
        `<span class="icon-label-content"><i class="fa ${escapeHtml(icon)}"></i></span></a></span>`
    )).join('');

    writeToContainer('iconBtnList', html);

    const container = getById('iconBtnList', { warn: false });
    queryAll('.icon-search-link', container).forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            onIconSearch(link.getAttribute('data-icon'));
        });
    });
}
