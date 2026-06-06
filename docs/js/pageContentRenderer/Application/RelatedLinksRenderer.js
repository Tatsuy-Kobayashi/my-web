// ----------------------------------------------------------------------------
// ファイル名    : RelatedLinksRenderer.js
// 名称          : 関連記事リンク生成
// 内容          : タグ一致で関連記事カードを描画する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { ensureArray } from '../Middleware/HtmlHelper.js';
import { writeToContainer } from '../Middleware/DomWriter.js';

/**
 * 関連記事リンクをレンダリングする
 * @param {Array} allData - サイトデータの配列
 * @param {Object} current - 現在の記事ノード
 */
export function renderRelatedLinks(allData, current) {
    // allData を配列に統一
    allData = ensureArray(allData);

    // 現在のノードがタグを持つか確認
    const currentKeywords = Array.isArray(current && current.keywords) ? current.keywords : [];
    if (currentKeywords.length === 0) {
        writeToContainer('related-entries', '');

        return;
    }

    // 同じタグを持つ記事をプール（ただし current 自身は除外）
    const relatedPool = allData.filter(item => {
        // 自身は除外
        if (item.id === current.id) return false;
        // リリースされていない記事は除外
        if (Number(item.released) !== 1) return false;
        // タグがない場合は除外
        const itemKeywords = Array.isArray(item.keywords) ? item.keywords : [];
        if (itemKeywords.length === 0) return false;

        // 一つでも同じタグがあるか確認
        return itemKeywords.some(kw => currentKeywords.includes(kw));
    });

    // 関連記事がない場合は何も表示しない
    if (relatedPool.length === 0) {
        writeToContainer('related-entries', '');

        return;
    }

    // ランダムに最大6件をシャッフル
    const shuffled = relatedPool.sort(() => Math.random() - 0.5).slice(0, 6);

    // HTML 生成
    let html = `<h1 class="related-entry-heading">関連記事</h1>`;
    html += `<div class="related-list">`;

    shuffled.forEach(related => {
        const thumbUrl = Array.isArray(related.thumbnailUrl) && related.thumbnailUrl[1]
            ? related.thumbnailUrl[1] : '';
        // タグリストを表示（最初のタグのみ使用）
        const tagLabel = Array.isArray(related.keywords) && related.keywords.length > 0
            ? related.keywords[0] : '';
        const relatedDesc = related.description || '';

        html += `<a href="${related.url}" class="related-entry-card-wrap a-wrap border-element cf" title="${related.label}" data-nodal="">`;
        html += `<article class="related-entry-card e-card cf post type-post status-publish format-standard has-post-thumbnail hentry category-css-post">`;
        html += `<figure class="related-entry-card-thumb card-thumb e-card-thumb">`;
        if (thumbUrl) {
            html += `<img width="160" height="90" src="${thumbUrl}" class="related-entry-card-thumb-image card-thumb-image wp-post-image lazyautosizes lazyloaded" alt="" decoding="async" data-sizes="auto" data-eio-rwidth="160" data-eio-rheight="90" sizes="160px">`;
        } else {
            html += `<img width="160" height="90" src="" class="related-entry-card-thumb-image card-thumb-image wp-post-image" alt="" decoding="async" style="display:none;">`;
        }
        if (tagLabel) {
            html += `<span class="cat-label cat-label-81">${tagLabel}</span>`;
        }
        html += `</figure> <!-- /.related-entry-thumb -->`;
        html += `<div class="related-entry-card-content card-content e-card-content">`;
        html += `<h3 class="related-entry-card-title card-title e-card-title">${related.label}${relatedDesc ? `：${relatedDesc}` : ''}</h3>`;
        html += `</div> <!-- /.related-entry-card-content -->`;
        html += `</article> <!-- /.related-entry-card -->`;
        html += `</a> <!-- /.related-entry-card-wrap -->`;
    });

    html += `</div> <!-- /related-list -->`;
    writeToContainer('related-entries', html);
}
