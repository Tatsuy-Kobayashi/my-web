// ----------------------------------------------------------------------------
// ファイル名      : TagListRenderer.js
// モジュール記号  : TLISTRENDR / TListRendr
// モジュール名    : タグ一覧生成
// 内容            : keywords をタグラベルとして描画し出力する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { HTMLHLPR_BuildSearchUrl } from '../Middleware/HtmlHelper.js';
import { DOMWRITER_WriteToContainer } from '../Middleware/DomWriter.js';

/**
 * タグ一覧をレンダリングする
 * @param {Object} current - 現在の記事ノード
 */
export function TLISTRENDR_RenderTagList(current) {
    const keywords = Array.isArray(current && current.keywords) ? current.keywords : [];
    if (keywords.length === 0) {
        DOMWRITER_WriteToContainer('article-page-topic', '');
        return;
    }

    // HTML 生成
    let html = '';
    html += '<dl>';
    html += '<dt>関連タグ</dt>';
    html += '<dd>';

    keywords.forEach((kw, idx) => {
        const tagUrl = HTMLHLPR_BuildSearchUrl(kw, 'tag');
        html += `<span class="topic-label" data-index="${idx}">`;
        html += `<a href="${tagUrl}"><span class="topic-label-text"># ${String(kw)}</span></a>`;
        html += `</span>`;
    });

    html += '</dd>';
    html += '</dl>';

    DOMWRITER_WriteToContainer('article-page-topic', html);
}
