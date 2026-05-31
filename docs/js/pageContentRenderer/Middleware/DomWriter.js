// ----------------------------------------------------------------------------
// ファイル名    : DomWriter.js
// 名称          : DOM出力ラッパー
// 内容          : DOM要素への出力、取得、挿入を共通化する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

/**
 * 指定したIDのコンテナにHTMLを書き込む
 * @param {string} elementId - コンテナの要素ID
 * @param {string} html - 書き込むHTML
 * @returns {boolean} 成功した場合はtrue、コンテナが存在しない場合はfalse
 */
export function writeToContainer(elementId, html) {
    const container = document.getElementById(elementId);
    if (!container) return false;
    container.innerHTML = html;
    return true;
}

/**
 * 指定したIDのコンテナ要素を取得する
 * @param {string} elementId - 取得する要素のID
 * @returns {HTMLElement | null} 要素、または存在しない場合はnull
 */
export function getContainer(elementId) {
    return document.getElementById(elementId);
}

/**
 * 指定した基準要素の直後に新しい要素を挿入する
 * @param {HTMLElement} referenceEl - 基準となる要素
 * @param {HTMLElement} newEl - 挿入する新しい要素
 */
export function insertAfterElement(referenceEl, newEl) {
    if (referenceEl && referenceEl.parentNode) {
        referenceEl.insertAdjacentElement('afterend', newEl);
    }
}
