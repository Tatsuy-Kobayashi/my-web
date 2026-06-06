// ----------------------------------------------------------------------------
// ファイル名    : PreviewLinkBuilder.js
// 名称          : プレビューリンク生成
// 内容          : preview-link および link-preview 構造の HTML を生成する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
import { escapeHtml } from './HtmlHelper.js';

/**
 * ノードからプレビューリンク付きのHTML片を生成する
 * @param {Object} pathNode - 対象ノード
 * @param {Object} options - オプション (asLink: true)
 * @returns {string} HTML文字列
 */
export const buildPreviewLinkHtml = (pathNode, options = {}) => {
    const { asLink = true } = options;
    if (!pathNode) return '';

    let nodeHtml = '<span class="link-container">';
    // iタグ（iconClass がある場合のみ）
    let icon = '';

    if (pathNode.iconClass) {
        icon += `<i class="fa fa-solid ${escapeHtml(pathNode.iconClass)}" style="margin-right:5px;"></i>`;
    } else if (pathNode.iconUrl) {
        icon += `<span class="icon ${escapeHtml(pathNode.iconClass)}" style="margin-right:5px;"></span>`;
    }

    // aタグ: preview-link 属性
    const desc = pathNode.description || '説明はありません。';
    const img = pathNode.imageUrl || '';

    if (asLink && Number(pathNode.released) === 1 && pathNode.url) {
        nodeHtml += `<a href="${escapeHtml(pathNode.url)}" class="preview-link" data-title="${escapeHtml(pathNode.label)}" data-description="${escapeHtml(desc)}" data-image="${escapeHtml(img)}">${icon}${escapeHtml(pathNode.label)}</a>`;
        // link-preview div
        nodeHtml += `<div class="link-preview"><a href="${escapeHtml(pathNode.url)}" class="link-preview-clickable">${img ? `<img class="preview-image" src="${escapeHtml(img)}" alt="Preview image">` : `<img class="preview-image" src="" alt="Preview image" style="display:none;">`}`
        nodeHtml += `<h3 class="preview-title">${escapeHtml(pathNode.label)}</h3><p class="preview-description">${escapeHtml(desc)}</p></a></div></span>`;
        return nodeHtml;
    } else {
        // 非公開 or リンク無しはプレーン表示（アイコン含む）
        return `${icon}${escapeHtml(pathNode.label)}`;
    }
};

/**
 * ノードから下層記事一覧向けのカードHTMLを生成する
 * @param {Object} node - 対象ノード
 * @returns {string} HTML文字列
 */
export const buildPreviewCardHtml = (node) => {
    if (Number(node.released) === 1) {
        const desc = node.description || '説明はありません。';
        const img = node.imageUrl || '';
        let s = `<div class="link-container">`;
        s += `<a href="${escapeHtml(node.url)}" class="preview-link" data-title="${(node.label || '').replace(/\"/g, '&quot;')}" data-description="${(desc || '').replace(/\"/g, '&quot;')}" data-image="${escapeHtml(img)}">${escapeHtml(node.label)}</a>`;
        s += `<div class="link-preview">`;
        s += `<a href="${escapeHtml(node.url)}" class="link-preview-clickable">`;
        if (img) s += `<img class="preview-image" src="${escapeHtml(img)}" alt="Preview image">`;
        else s += `<img class="preview-image" src="" alt="Preview image" style="display:none;">`;
        s += `<h3 class="preview-title">${escapeHtml(node.label)}</h3>`;
        s += `<p class="preview-description">${escapeHtml(desc)}</p>`;
        s += `</a>`;
        s += `</div>`;
        s += `</div>`;
        return s;
    } else {
        return `${escapeHtml(node.label)}`;
    }
};

/**
 * ノードからサムネイル `<figure>` HTMLを生成する
 * @param {Object} node - 対象ノード
 * @param {string} cssClass - 付与するCSSクラス名
 * @returns {string} サムネイルHTML（存在しない場合は空文字）
 */
export const buildThumbHtml = (node, cssClass = '') => {
    if (!node) return '';
    if (Array.isArray(node.thumbnailUrl) && node.thumbnailUrl.length > 0 && node.thumbnailUrl[0]) {
        const src = node.thumbnailUrl[0];
        return `<figure class="${escapeHtml(cssClass)} card-thumb"><img width="120" height="68" src="${escapeHtml(src)}" class="attachment-thumb120 size-thumb120 wp-post-image lazyautosizes ls-is-cached lazyloaded" alt="" decoding="async"></figure>`;
    }
    return '';      // サムネイルが無ければ空
};
