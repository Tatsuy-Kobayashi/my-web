// ----------------------------------------------------------------------------
// ファイル名      : PreviewLinkBuilder.js
// モジュール記号  : PREVLINK / PrevLink
// モジュール名    : プレビューリンク生成 (SW201-MID-PREVLINK) Source File
// 内容            : preview-link および link-preview 構造の HTML を生成する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { HTMLHLPR_EscapeHtml } from './HtmlHelper.js';

/**
 * 名称     : プレビューリンク生成
 * 内容     : ノードからプレビューリンク付きのHTML片を生成する
 * @param {Object} pathNode - 対象ノード
 * @param {Object} options - オプション (asLink: true)
 * @returns {string} HTML文字列
 */
export const PREVLINK_BuildPreviewLinkHtml = (pathNode, options = {}) => {
    const { asLink = true } = options;
    if (!pathNode) return '';

    let nodeHtml = '<span class="link-container">';
    // iタグ（iconClass がある場合のみ）
    let icon = '';

    if (pathNode.iconClass) {
        icon += `<i class="fa fa-solid ${HTMLHLPR_EscapeHtml(pathNode.iconClass)}" style="margin-right:5px;"></i>`;
    } else if (pathNode.iconUrl) {
        icon += `<span class="icon ${HTMLHLPR_EscapeHtml(pathNode.iconClass)}" style="margin-right:5px;"></span>`;
    }

    // aタグ: preview-link 属性
    const desc = pathNode.description || '説明はありません。';
    const img = pathNode.imageUrl || '';

    if (asLink && Number(pathNode.released) === 1 && pathNode.url) {
        nodeHtml += `<a href="${HTMLHLPR_EscapeHtml(pathNode.url)}" class="preview-link" data-title="${HTMLHLPR_EscapeHtml(pathNode.label)}" data-description="${HTMLHLPR_EscapeHtml(desc)}" data-image="${HTMLHLPR_EscapeHtml(img)}">${icon}${HTMLHLPR_EscapeHtml(pathNode.label)}</a>`;
        // link-preview div
        nodeHtml += `<div class="link-preview"><a href="${HTMLHLPR_EscapeHtml(pathNode.url)}" class="link-preview-clickable">${img ? `<img class="preview-image" src="${HTMLHLPR_EscapeHtml(img)}" alt="Preview image">` : `<img class="preview-image" src="" alt="Preview image" style="display:none;">`}`
        nodeHtml += `<h3 class="preview-title">${HTMLHLPR_EscapeHtml(pathNode.label)}</h3><p class="preview-description">${HTMLHLPR_EscapeHtml(desc)}</p></a></div></span>`;
        return nodeHtml;
    } else {
        // 非公開 or リンク無しはプレーン表示（アイコン含む）
        return `${icon}${HTMLHLPR_EscapeHtml(pathNode.label)}`;
    }
};

/**
 * 名称     : プレビューカード生成
 * 内容     : ノードから下層記事一覧向けのカードHTMLを生成する
 * @param {Object} node - 対象ノード
 * @returns {string} HTML文字列
 */
export const PREVLINK_BuildPreviewCardHtml = (node) => {
    if (Number(node.released) === 1) {
        const desc = node.description || '説明はありません。';
        const img = node.imageUrl || '';
        let s = `<div class="link-container">`;
        s += `<a href="${HTMLHLPR_EscapeHtml(node.url)}" class="preview-link" data-title="${(node.label || '').replace(/\"/g, '&quot;')}" data-description="${(desc || '').replace(/\"/g, '&quot;')}" data-image="${HTMLHLPR_EscapeHtml(img)}">${HTMLHLPR_EscapeHtml(node.label)}</a>`;
        s += `<div class="link-preview">`;
        s += `<a href="${HTMLHLPR_EscapeHtml(node.url)}" class="link-preview-clickable">`;
        if (img) s += `<img class="preview-image" src="${HTMLHLPR_EscapeHtml(img)}" alt="Preview image">`;
        else s += `<img class="preview-image" src="" alt="Preview image" style="display:none;">`;
        s += `<h3 class="preview-title">${HTMLHLPR_EscapeHtml(node.label)}</h3>`;
        s += `<p class="preview-description">${HTMLHLPR_EscapeHtml(desc)}</p>`;
        s += `</a>`;
        s += `</div>`;
        s += `</div>`;
        return s;
    } else {
        return `${HTMLHLPR_EscapeHtml(node.label)}`;
    }
};

/**
 * 名称     : サムネイル生成
 * 内容     : ノードからサムネイル `<figure>` HTMLを生成する
 * @param {Object} node - 対象ノード
 * @param {string} cssClass - 付与するCSSクラス名
 * @returns {string} サムネイルHTML（存在しない場合は空文字）
 */
export const PREVLINK_BuildThumbHtml = (node, cssClass = '') => {
    if (!node) return '';
    if (Array.isArray(node.thumbnailUrl) && node.thumbnailUrl.length > 0 && node.thumbnailUrl[0]) {
        const src = node.thumbnailUrl[0];
        return `<figure class="${HTMLHLPR_EscapeHtml(cssClass)} card-thumb"><img width="120" height="68" src="${HTMLHLPR_EscapeHtml(src)}" class="attachment-thumb120 size-thumb120 wp-post-image lazyautosizes ls-is-cached lazyloaded" alt="" decoding="async"></figure>`;
    }
    return '';      // サムネイルが無ければ空
};
