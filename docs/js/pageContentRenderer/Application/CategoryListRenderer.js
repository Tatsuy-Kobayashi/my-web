// ----------------------------------------------------------------------------
// ファイル名    : CategoryListRenderer.js
// 名称          : カテゴリー一覧生成
// 内容          : 全タグを収集し、カテゴリーリストとして描画する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { escapeHtml, ensureArray, buildSearchUrl } from '../Middleware/HtmlHelper.js';
import { writeToContainer } from '../Middleware/DomWriter.js';

/**
 * カテゴリー一覧をレンダリングする
 * @param {Array} allData - サイトデータの配列
 */
export function renderCategoryList(allData) {
    allData = ensureArray(allData);

    const pool = new Set();
    allData.forEach(item => {
        if (!item) return;
        const kws = Array.isArray(item.keywords) ? item.keywords : [];
        kws.forEach(k => {
            if (k == null) return;
            const s = String(k).trim();
            if (s) pool.add(s);
        });
    });

    const tags = Array.from(pool);
    if (tags.length === 0) {
        writeToContainer('categories', '');
        return;
    }

    // 文字コード順（UTF-16 code unit）で辞書順ソート
    tags.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    let html = '<ul>';
    tags.forEach((tag, idx) => {
        const tagId = idx;
        const url = buildSearchUrl(tag, 'tag');
        html += `<li class="cat-item cat-item-${tagId}">`;
        html += `<a href="${url}" data-nodal=""><span class="list-item-caption">${escapeHtml(tag)}</span></a>`;
        html += `</li>`;
    });
    html += '</ul>';

    writeToContainer('categories', html);
}
