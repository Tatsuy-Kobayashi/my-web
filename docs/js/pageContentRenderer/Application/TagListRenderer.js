// ----------------------------------------------------------------------------
// ファイル名    : TagListRenderer.js
// 名称          : タグ一覧生成
// 内容          : keywords をタグラベルとして描画し出力する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { buildSearchUrl } from '../Middleware/HtmlHelper.js';
import { writeToContainer } from '../Middleware/DomWriter.js';

/**
 * タグ一覧をレンダリングする
 * @param {Object} current - 現在の記事ノード
 */
export function renderTagList(current) {
    const keywords = Array.isArray(current && current.keywords) ? current.keywords : [];
    if (keywords.length === 0) {
        writeToContainer('article-page-topic', '');
        return;
    }

    // HTML 生成
    let html = '';
    html += '<dl>';
    html += '<dt>関連タグ</dt>';
    html += '<dd>';

    keywords.forEach((kw, idx) => {
        const tagUrl = buildSearchUrl(kw, 'tag');
        html += `<span class="topic-label" data-index="${idx}">`;
        html += `<a href="${tagUrl}"><span class="topic-label-text"># ${String(kw)}</span></a>`;
        html += `</span>`;
    });

    html += '</dd>';
    html += '</dl>';

    writeToContainer('article-page-topic', html);
}
