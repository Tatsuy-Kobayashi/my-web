// ----------------------------------------------------------------------------
// ファイル名      : PathUtils.js
// モジュール記号  : PATHUTILS / PathUtils
// モジュール名    : パス解析共通処理
// 内容            : mainPath や auxPath のパース・比較を行う共通ユーティリティ
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

/**
 * mainPath の先頭パスを取得する
 * @param {Object} node - siteData のノード
 * @returns {string} パス文字列（例: "1:2:3"）
 */
export function PATHUTILS_GetFirstPath(node) {
    if (!node) return '';
    if (Array.isArray(node.mainPath) && node.mainPath.length > 0) return node.mainPath[0];
    if (typeof node.mainPath === 'string') return node.mainPath;
    return '';
}

/**
 * パスの最後のセグメントを除去して親パスを返す
 * @param {string} path - パス文字列（例: "1:2:3"）
 * @returns {string} 親パス（例: "1:2"）
 */
export function PATHUTILS_GetParentPath(path) {
    const parts = path.split(':').filter(Boolean);
    if (parts.length <= 1) return ''; // ルートレベルには親がない
    return parts.slice(0, -1).join(':');
}

/**
 * ":" 区切り文字列を数値配列に変換する
 * @param {string} pathStr - パス文字列（例: "1:2:3"）
 * @returns {number[]} 数値配列（例: [1, 2, 3]）
 */
export function PATHUTILS_ParsePathIds(pathStr) {
    if (!pathStr || typeof pathStr !== 'string') return [];
    return pathStr.split(':').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
}

/**
 * auxPath から mainPath と重複しないパスを配列で返す
 * @param {Object} node - siteData のノード
 * @param {string} mainPath - メインパス文字列
 * @returns {string[]} 補助パスの配列
 */
export function PATHUTILS_GetAuxPaths(node, mainPath) {
    const auxPaths = [];
    if (node && node.auxPath) {
        if (Array.isArray(node.auxPath)) {
            node.auxPath.forEach(p => { if (p && p !== mainPath) auxPaths.push(p); });
        } else if (typeof node.auxPath === 'string' && node.auxPath !== mainPath) {
            auxPaths.push(node.auxPath);
        }
    }
    return auxPaths;
}
