import { query, queryAll } from '../Middleware/DomWriter.js';
import { buildPreviewLinkHtml } from '../Middleware/PreviewLinkBuilder.js';
import { renderHierarchyList } from '../../common/siteHierarchy/HierarchyList.mjs';

export function renderCategorySearchResult(allData, current, maxDepth) {
    renderHierarchyList(query('#category-list'), allData, current?.id, maxDepth, buildPreviewLinkHtml, updatePulldownWidth);
    bindPulldownWidthUpdater();
}

function bindPulldownWidthUpdater() {
    const wrapper = query('.pulldown_list_wrapper');
    if (!wrapper || wrapper.dataset.widthUpdaterBound === 'true') {
        updatePulldownWidth();
        return;
    }

    wrapper.dataset.widthUpdaterBound = 'true';
    wrapper.addEventListener('toggle', event => {
        if (event.target.tagName === 'DETAILS') updatePulldownWidth();
    }, true);

    updatePulldownWidth();
}

function updatePulldownWidth() {
    const wrapper = query('.pulldown_list_wrapper');
    if (!wrapper) return;

    const BASE_WIDTH = 500;
    const MIN_CHILD_WIDTH = 230;
    const openDetails = queryAll('details[open]', wrapper);
    if (openDetails.length === 0) {
        wrapper.style.setProperty('--pulldown-width', BASE_WIDTH + 'px');
        return;
    }

    wrapper.style.transition = 'none';
    wrapper.style.setProperty('--pulldown-width', BASE_WIDTH + 'px');
    void wrapper.offsetWidth;

    let minChildWidth = Infinity;
    openDetails.forEach(details => {
        const childLis = queryAll(
            ':scope > .li_pulldownList, :scope > .ul_pulldownList > .li_pulldownList, :scope > div > .ul_pulldownList > .li_pulldownList',
            details
        );
        childLis.forEach(li => {
            const rect = li.getBoundingClientRect();
            if (rect.width > 0) minChildWidth = Math.min(minChildWidth, rect.width);
        });
    });

    let requiredWidth = BASE_WIDTH;
    if (minChildWidth !== Infinity && minChildWidth < MIN_CHILD_WIDTH) {
        requiredWidth = BASE_WIDTH + (MIN_CHILD_WIDTH - minChildWidth);
    }

    wrapper.style.transition = '';
    void wrapper.offsetWidth;
    wrapper.style.setProperty('--pulldown-width', requiredWidth + 'px');
}
