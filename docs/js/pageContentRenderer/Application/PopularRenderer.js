// ----------------------------------------------------------------------------
// ファイル名    : PopularRenderer.js
// 名称          : 人気記事セクション生成
// 内容          : viewStatsから人気記事カードを描画する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { escapeHtml, ensureArray } from '../Middleware/HtmlHelper.js';
import { buildThumbHtml } from '../Middleware/PreviewLinkBuilder.js';
import { writeToContainer } from '../Middleware/DomWriter.js';

/**
 * 人気記事セクションをレンダリングする
 * @param {Array} allData - サイトデータの配列
 * @param {Array} viewStats - 閲覧統計データの配列
 */
export function renderPopularSection(allData, viewStats) {
    // allData を配列に統一
    allData = ensureArray(allData);
    // viewStats を配列に統一
    viewStats = ensureArray(viewStats);

    const findNode = (id) => allData.find(n => n && n.id === id);

    // HTML 生成
    let html = `<div class="popular-entry-cards widget-entry-cards no-icon cf border-partition viewStats-visible">`;

    viewStats.forEach(item => {
        const node = findNode(item.id) || {};
        const viewStatsThumb = buildThumbHtml(node, 'popular-entry-card-thumb widget-entry-card-thumb');

        html += `<a href="${item.url}" class="popular-entry-card-link widget-entry-card-link a-wrap no-1" title="${escapeHtml(item.label||'')}" data-nodal="">`;
        html += `<div class="post-${item.id} popular-entry-card widget-entry-card e-card cf post type-post status-publish format-standard has-post-thumbnail hentry category-python-post">`;
        html += `${viewStatsThumb}`;
        html += `<div class="popular-entry-card-content widget-entry-card-content card-content">`;
        html += `<div class="popular-entry-card-title widget-entry-card-title card-title">${escapeHtml(item.label||node.label||'')}</div>`;
        html += `<div class="popular-entry-card-date widget-entry-card-date display-none">`;
        html += `<span class="popular-entry-card-post-date widget-entry-card-post-date post-date">${escapeHtml(node.datePublished||'')}</span>`;
        html += `<span class="popular-entry-card-update-date widget-entry-card-update-date post-update">${escapeHtml(node.dateModified||'')}</span>`;
        html += `</div>`;
        html += `</div> <!-- /.popular-entry-content -->`;
        html += `</div> <!-- /.popular-entry-card -->`;
        html += `</a> <!-- /.popular-entry-card-link -->`;
    });

    html += `</div>`;
    writeToContainer('popular_entries', html);
}
