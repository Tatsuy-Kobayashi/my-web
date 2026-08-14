// ----------------------------------------------------------------------------
// ファイル名      : DomWriter.js
// モジュール記号  : DOMWRITER / DomWriter
// モジュール名    : DOM出力ラッパー (SW200-MID-DOMWRITER) Source File
// 内容            : DOM要素への出力、取得、挿入を共通化する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

// ------------------------
// DOM要素参照（安全に取得）
// ------------------------
export function $id(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`[WARN] DOM element not found: #${id}`);
    return el;
}

/**
 * 名称     : 要素保持判定
 * 内容     : 指定したIDのコンテナ要素の存在チェック用で、警告を出さずに真偽値を返す
 * @param {string} id - DOM要素のID
 * @returns {boolean} - DOM要素が存在する場合はtrue、存在しない場合はfalse
 */
export function DOMWRITER_HasElement(id) {
    return !!document.getElementById(id);
}

/**
 * 名称     : 必須要素保持判定
 * 内容     : 指定したIDのコンテナ要素の存在チェック用で、警告を出さずに真偽値を返す
 * @param {string[]} ids - DOM要素のIDの配列
 * @returns {Object} - IDをキー、DOM要素を値とするオブジェクト
 */
export function DOMWRITER_RequireElements(ids) {
    const elements = {};
    for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) {
            console.error(`[ERROR] Required DOM element not found: #${id}`);
            return null;
        }
        elements[id] = el;
    }
    return elements;
}

export function DOMWRITER_GetByName(name) {
    return document.getElementsByName(name);
}

export function DOMWRITER_QuerySelector(selector, root = document) {
    return root.querySelector(selector);
}

export function DOMWRITER_CreateElement(tag) {
    return document.createElement(tag);
}
