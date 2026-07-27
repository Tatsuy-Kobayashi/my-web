// ----------------------------------------------------------------------------
// ファイル名      : HtmlHelper.js
// モジュール記号  : HTMLHLPR / HtmlHlpr
// モジュール名    : HTML生成ヘルパ (SW200-MID-HTMLHLPR) Source File
// 内容            : HTMLエスケープ、ハッシュ生成、検索URL生成、配列化などの共通処理
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

/**
 * 名称     : HTMLエスケープ
 * 内容     : 文字列の & < > " ' を実体参照にエスケープする
 * @param {string} str - エスケープ対象の文字列
 * @returns {string} エスケープ後の文字列
 */
export function HTMLHLPR_EscapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

/**
 * 名称     : djb2ハッシュ生成
 * 内容     : 文字列からdjb2ハッシュ（16進文字列）を生成する
 * @param {string} str - ハッシュ化対象の文字列
 * @returns {string} 16進文字列のハッシュ
 */
export function HtmlHlpr_Djb2Hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h) + str.charCodeAt(i);
        h = h & 0xFFFFFFFF;
    }
    return (h >>> 0).toString(16);
}

/**
 * 名称     : 検索URL生成
 * 内容     : 統合検索ページへのフラグメント付きURLを生成する
 * @param {string} keyword - 検索キーワード
 * @param {string} type - 検索タイプ（デフォルト: 'tag'）
 * @returns {string} 検索URL
 */
export function HTMLHLPR_BuildSearchUrl(keyword, type = 'tag') {
    const base = keyword;
    const normalized = keyword;
    const payload = String(base) + '|' + type + '|' + JSON.stringify(normalized);
    const hash = HtmlHlpr_Djb2Hash(payload);
    const ts = Date.now();
    const frag = 'q=' + encodeURIComponent(String(base)) + '&type=' + encodeURIComponent(type) + '&h=' + hash + '&ts=' + ts;
    return `https://tatsuy-kobayashi.github.io/my-web/docs/search/integratedSearch.html#${frag}`;
}

/**
 * 名称     : 配列化
 * 内容     : データが配列でなければObject.valuesで配列化する。失敗時は空配列を返す。
 * @param {any} data - 配列化するデータ
 * @returns {Array} 配列
 */
export function HTMLHLPR_EnsureArray(data) {
    if (Array.isArray(data)) return data;
    try {
        return Object.values(data);
    } catch (e) {
        return [];
    }
}
