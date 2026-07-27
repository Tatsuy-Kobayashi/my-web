// ----------------------------------------------------------------------------
// ファイル名      : CategoryListRenderer.js
// モジュール記号  : CTLISTRENDR / CtListRendr
// モジュール名    : カテゴリー一覧生成
// 内容            : 全タグを収集し、カテゴリーリストとして描画する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { HTMLHLPR_EscapeHtml, HTMLHLPR_EnsureArray, HTMLHLPR_BuildSearchUrl } from '../Middleware/HtmlHelper.js';
import { DOMWRITER_WriteToContainer } from '../Middleware/DomWriter.js';

/**
 * カテゴリー一覧をレンダリングする
 * @param {Array} allData - サイトデータの配列
 */
export function CTLISTRENDR_RenderCategoryList(allData) {
    // allData を配列に統一
    allData = HTMLHLPR_EnsureArray(allData);

    // キーワードをプール（重複除去）
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
        DOMWRITER_WriteToContainer('categories', '');
        return;
    }

    // 文字コード順（UTF-16 code unit）で辞書順ソート
    tags.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    // HTML 生成
    let html = '<ul>';
    tags.forEach((tag, idx) => {
        const tagId = idx;
        const url = HTMLHLPR_BuildSearchUrl(tag, 'tag');
        html += `<li class="cat-item cat-item-${tagId}">`;
        html += `<a href="${url}" data-nodal=""><span class="list-item-caption">${HTMLHLPR_EscapeHtml(tag)}</span></a>`;
        html += `</li>`;
    });
    html += '</ul>';

    DOMWRITER_WriteToContainer('categories', html);
}
