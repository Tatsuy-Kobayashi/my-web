// ----------------------------------------------------------------------------
// ファイル名    : PagerRenderer.js
// 名称          : 前後記事リンク生成
// 内容          : 同一親の兄弟ノードから前後ナビを描画する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { getFirstPath, getParentPath } from './PathUtils.js';
import { ensureArray } from '../Middleware/HtmlHelper.js';
import { buildThumbHtml } from '../Middleware/PreviewLinkBuilder.js';
import { writeToContainer } from '../Middleware/DomWriter.js';

/**
 * 前後記事へのリンク（ページャー）をレンダリングする
 * @param {Array} allData - サイトデータの配列
 * @param {Object} current - 現在の記事ノード
 */
export function renderPager(allData, current) {
    allData = ensureArray(allData);

    const currentPath = getFirstPath(current);
    if (!currentPath) return;

    const parentPath = getParentPath(currentPath);
    if (!parentPath) return;

    const siblings = allData.filter(item => {
        const itemPath = getFirstPath(item);
        return getParentPath(itemPath) === parentPath;
    });

    siblings.sort((a, b) => {
        const aPath = getFirstPath(a);
        const bPath = getFirstPath(b);
        const aId = parseInt(aPath.split(':').pop(), 10);
        const bId = parseInt(bPath.split(':').pop(), 10);
        return aId - bId;
    });

    const currentIndex = siblings.findIndex(item => item.url === current.url);
    if (currentIndex === -1) {
        console.warn('Current node not found among siblings.');
        writeToContainer('pager-post-navi', '');
        return;
    }
    const prev = siblings[currentIndex - 1];
    const next = siblings[currentIndex + 1];

    let html = '';
    if (prev && Number(prev.released) === 1) {
        const prevThumb = buildThumbHtml(prev, 'prev-post-thumb');
        const prevDesc = prev.description || '';
        html += `<a href="${prev.url}" class="prev-post a-wrap border-element cf" data-nodal=""><div class="fa fa-chevron-left iconfont" aria-hidden="true"></div>${prevThumb}<div class="prev-post-title">${prev.label}${prevDesc ? `：${prevDesc}` : ''}</div></a>`;
    } else {
        html += `<span class="prev-post-placeholder">前の記事はありません</span>`;
    }

    if (next && Number(next.released) === 1) {
        const nextThumb = buildThumbHtml(next, 'next-post-thumb');
        const nextDesc = next.description || '';
        html += `<a href="${next.url}" class="next-post a-wrap cf" data-nodal=""><div class="fa fa-chevron-right iconfont" aria-hidden="true"></div>${nextThumb}<div class="next-post-title">${next.label}${nextDesc ? `：${nextDesc}` : ''}</div></a>`;
    } else {
        html += `<span class="next-post-placeholder">次の記事はありません</span>`;
    }

    writeToContainer('pager-post-navi', html);
}
