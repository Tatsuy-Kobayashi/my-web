import { createHierarchyIndex } from '../../common/siteHierarchy/Hierarchy.mjs';
// ----------------------------------------------------------------------------
// ファイル名      : PagerRenderer.js
// モジュール記号  : PAGRRENDR / PagrRendr
// モジュール名    : 前後記事リンク生成
// 内容            : 同一親の兄弟ノードから前後ナビを描画する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { HTMLHLPR_EnsureArray } from '../Middleware/HtmlHelper.js';
import { PREVLINK_BuildThumbHtml } from '../Middleware/PreviewLinkBuilder.js';
import { DOMWRITER_WriteToContainer } from '../Middleware/DomWriter.js';

/**
 * 前後記事へのリンク（ページャー）をレンダリングする
 * @param {Array} allData - サイトデータの配列
 * @param {Object} current - 現在の記事ノード
 */
export function PAGRRENDR_RenderPager(allData, current) {
    // allData を配列に統一
    allData = HTMLHLPR_EnsureArray(allData);

    if (current.primaryParentId === null) return;
    const siblings = createHierarchyIndex(allData)
        .getChildren(current.primaryParentId, ['main_path']).map(entry => entry.node);

    const currentIndex = siblings.findIndex(item => item.url === current.url);
    if (currentIndex === -1) {
        console.warn('Current node not found among siblings.');
        DOMWRITER_WriteToContainer('pager-post-navi', '');
        return;
    }
    const prev = siblings[currentIndex - 1];
    const next = siblings[currentIndex + 1];

    // HTML 生成
    let html = '';
    if (prev && Number(prev.released) === 1) {
        const prevThumb = PREVLINK_BuildThumbHtml(prev, 'prev-post-thumb');
        const prevDesc = prev.description || '';
        html += `<a href="${prev.url}" class="prev-post a-wrap border-element cf" data-nodal=""><div class="fa fa-chevron-left iconfont" aria-hidden="true"></div>${prevThumb}<div class="prev-post-title">${prev.label}${prevDesc ? `：${prevDesc}` : ''}</div></a>`;
    } else {
        html += `<span class="prev-post-placeholder">前の記事はありません</span>`;
    }

    if (next && Number(next.released) === 1) {
        const nextThumb = PREVLINK_BuildThumbHtml(next, 'next-post-thumb');
        const nextDesc = next.description || '';
        html += `<a href="${next.url}" class="next-post a-wrap cf" data-nodal=""><div class="fa fa-chevron-right iconfont" aria-hidden="true"></div>${nextThumb}<div class="next-post-title">${next.label}${nextDesc ? `：${nextDesc}` : ''}</div></a>`;
    } else {
        html += `<span class="next-post-placeholder">次の記事はありません</span>`;
    }

    DOMWRITER_WriteToContainer('pager-post-navi', html);
}
