import { createHierarchyIndex } from '../../common/siteHierarchy/Hierarchy.mjs';
import { clearSearchFragment } from '../Communication/SearchUrlState.js';
import { escapeHtml } from '../Middleware/HtmlHelper.js';
import { buildThumbnailHtml } from '../Middleware/PreviewLinkBuilder.js';
import { clearContainer, getById, setDisplay, writeToContainer } from '../Middleware/DomWriter.js';
import { parsePathIds } from './PathUtils.js';

export function displaySearchResults(results, queryInfo, siteData) {
    const safeResults = Array.isArray(results) ? results : [];
    const safeSiteData = Array.isArray(siteData) ? siteData : [];
    let html = '<div class="main search-results">';

    html += '<div style="margin-bottom: 20px;">';
    html += '<button id="backToSearchBtn" style="padding: 8px 16px; cursor: pointer;">← 検索画面に戻る</button>';
    html += '</div>';
    html += `<h1>検索結果 ( ${safeResults.length} 件がヒット)</h1>`;

    if (queryInfo) {
        const qstr = queryInfo.original || queryInfo.query || '';
        const frag = queryInfo.fragment ? '<code>' + escapeHtml(queryInfo.fragment) + '</code>' : '';
        if (qstr || frag) {
            const intentText = queryInfo.intent ? ` / 意図: ${escapeHtml(queryInfo.intent)}` : '';
            html += '<p class="search-query-info" style="overflow-wrap: break-word;">クエリ: ' +
                escapeHtml(qstr) + intentText + ' ' + frag + '</p>';
        }
    }

    if (safeResults.length === 0) {
        html += '<p>マッチする結果がありません。</p>';
    } else {
        html += '<div class="article-list">';
        safeResults.forEach(result => {
            const targetPage = safeSiteData.find(node => node && node.id === result.id) || result || {};
            html += '<div class="article-item">';
            html += `<a href="${escapeHtml(targetPage.url || '#')}" class="img-container-link">`;
            html += '<div id="" class="img-container">';
            html += buildThumbnailHtml(targetPage);
            html += '</div> <!-- img-container -->';
            html += '</a> <!-- img-container-link -->';
            html += '<div class="search-result-label">';
            html += '<div>';
            html += '<div class="search-result-breadcrumb_list"><div class="date">';
            html += buildSearchBreadcrumbs(safeSiteData, targetPage);
            html += '</div></div>';
            html += `<a href="${escapeHtml(targetPage.url || '#')}" class="search-result-title-link">`;
            html += `<strong> ${escapeHtml(targetPage.label || 'N/A')} </strong> (${escapeHtml(targetPage.labelEn || '')})`;
            html += '</a>';

            if (result.__intentScore != null) {
                const reasons = Array.isArray(result.__intentReasons) ? result.__intentReasons.join(' / ') : '';
                html += `<div class="search-result-intent-score" style="font-size: 0.85em; color: #555;">意図スコア: ${Number(result.__intentScore).toFixed(2)}${reasons ? ` <span>${escapeHtml(reasons)}</span>` : ''}</div>`;
            }

            html += '</div>';
            html += buildDateInfoHtml(targetPage);
            html += `<div style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; line-height: 1.3;">${escapeHtml(result.sections?.[0]?.text || '')}</div>`;
            html += '</div> <!-- search-result-label -->';
            html += '</div> <!-- article-item -->';
        });
        html += '</div>';
    }

    html += '</div>';
    writeToContainer('contentIntegSearchResult', html);
    window.scrollTo(0, 0);

    const backBtn = getById('backToSearchBtn', { warn: false });
    if (backBtn) backBtn.addEventListener('click', returnToSearchScreen);
}

export function buildSearchBreadcrumbs(allData, current) {
    const renderColumnFromPath = (pathStr, options = {}) => {
        const { includeHome = false, treatAsMain = false } = options;
        const parts = parsePathIds(pathStr);
        if (parts.length === 0) return '';

        let html = '<div class="breadcrumb_list_part">';
        if (includeHome) html += '<span>Home</span>';

        const lastIndexToRender = treatAsMain ? parts.length - 2 : parts.length - 1;
        for (let i = 0; i <= lastIndexToRender; i++) {
            const pathNode = allData.find(node => node && node.id === parts[i]);
            if (!pathNode) continue;
            html += '<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>';
            html += escapeHtml(pathNode.label || '');
        }

        if (treatAsMain) {
            html += '<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>';
            html += `<span>${escapeHtml(current.label || '')}</span>`;
        }

        html += '</div>';
        return html;
    };

    const [mainPath, ...auxPaths] = createHierarchyIndex(allData).getBreadcrumbs(current.id).map(ids => ids.join(':'));
    let finalHtml = '';

    if (mainPath) {
        finalHtml += renderColumnFromPath(mainPath, { includeHome: true, treatAsMain: true });
    } else {
        finalHtml += '<div class="breadcrumb_list_part">';
        finalHtml += '<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>';
        finalHtml += `<span>${escapeHtml(current.label || '')}</span></div>`;
    }

    auxPaths.forEach(path => {
        finalHtml += renderColumnFromPath(path, { includeHome: true, treatAsMain: true });
    });

    return finalHtml;
}

export function buildDateInfoHtml(current) {
    const pubDateObj = toDateSafe(current && current.datePublished);
    let revDateObj = toDateSafe(current && current.dateModified);

    if (pubDateObj && revDateObj && pubDateObj.getTime() > revDateObj.getTime()) {
        revDateObj = new Date(pubDateObj.getTime());
    }

    const pubDate = toISOStringSafe(pubDateObj);
    const revDate = toISOStringSafe(revDateObj);
    let html = '';

    if (pubDate) html += buildTimeHtml('fa-pencil', '公開日', pubDate);
    if (revDate) html += `<span style="margin-left:0.8em;">${buildTimeHtml('fa-refresh', '更新', revDate, true)}</span>`;
    return html;
}

export function returnToSearchScreen() {
    setDisplay('contentIntegSearch', 'block');
    setDisplay('contentIntegSearchResult', 'none');
    clearContainer('contentIntegSearchResult');
    clearSearchFragment();

    const input = getById('labelSubstringSearchInput', { warn: false });
    if (input) input.value = '';
}

function toDateSafe(value) {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value) ? null : value;
    const date = new Date(value);
    return isNaN(date) ? null : date;
}

function toISOStringSafe(date) {
    return date ? date.toISOString() : '';
}

function buildTimeHtml(iconClass, label, isoDate, updated = false) {
    const display = isoDate.split('T')[0];
    const parts = display.split('-');
    const y = parts[0] || '';
    const m = parts[1] || '';
    const d = parts[2] || '';
    const className = updated ? ' class="updated"' : '';
    return `<span><i class="fa ${iconClass}"></i>&ensp;<time datetime="${escapeHtml(isoDate)}" title="${escapeHtml(isoDate)}"${className}>${escapeHtml(label)}: <span class="date-year">${escapeHtml(y)}</span><span class="hyphen">年</span><span class="date-month">${escapeHtml(m)}</span><span class="hyphen">月</span><span class="date-day">${escapeHtml(d)}</span>日</time></span>`;
}
