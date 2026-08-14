// ----------------------------------------------------------------------------
// ファイル名      : ColorHelper.js
// モジュール記号  : COLORHLPR / ColorHlpr
// モジュール名    : 色計算ヘルパー (SW201-MID-COLORHLPR) Source File
// 内容            : 色計算ヘルパー
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

/**
 * 名称     : 色値の範囲制限
 * 内容     : 色計算ヘルパー
 * @param {number} v - 色値
 * @returns {number} - 範囲制限された色値
 */
export function ColorHlpr_Clamp(v) {
    return Math.max(0, Math.min(255, Math.round(v)));
}

/**
 * 名称     : 16進数への変換
 * 内容     : 色計算ヘルパー
 * @param {number} v - 数値
 * @returns {string} - 16進数に変換された文字列
 */
export function ColorHlpr_ToHex(v) {
    return ('0' + ColorHlpr_Clamp(v).toString(16)).slice(-2);
}

/**
 * 名称     : ノードからカテゴリ検出
 * 内容     : ノードからカテゴリを検出する
 * @param {object} n - ノード
 * @returns {number} - カテゴリ
 */
export function COLORHLPR_DetectCategoryFromNode(n) {
    // カテゴリ判定は mainPath のみを使用する（auxPathによる汚染を防ぐ）
    const paths = n.mainPath;
    // mainPath は ASNCTRL_ValidateData で必須チェック済みだが、念のためガード
    if (!paths || !paths.length) return null;
    // 最初の mainPath を正とする
    for (const p of paths) {
        const parts = p.split(':').map(Number);

        // 配列の要素数が2以上（ルートと大カテゴリを含む）であり、かつ先頭（ルート）が確実に '0' であることを確認（データの整合性チェック）
        if (parts.length >= 2 && parts[0] === 0) {
            // 「そのノードがどの『大カテゴリ（分野）』に属しているか」を知るために2番目の要素（インデックス1）を返す
            return parts[1]; // 1..6 expected
        }
    }
    return null;
}

/**
 * 名称     : レインボーカラー算出
 * 内容     : レインボーカラーを計算する
 * @param {object} n - ノード
 * @returns {string} - レインボーカラー
 */
export function COLORHLPR_ComputeRainbowHex(n) {
    const l = (typeof n.level === 'number' && Number.isFinite(n.level)) ? n.level : 0;
    const cat = COLORHLPR_DetectCategoryFromNode(n);
    if (n.id === 0 || l === 0) { // 「学問」ノード
        return `#${ColorHlpr_ToHex(255)}${ColorHlpr_ToHex(255)}${ColorHlpr_ToHex(255)}`; // white
    }
    const level = l;
    const inRange = (level >= 1 && level <= 8);
    let r = 255, g = 255, b = 255;
    switch (cat) {
        case 1: // 人文科学
            if (inRange) { r = 255; g = 256 - 32 * level; b = 256 - 32 * level; }
            else { r = 255; g = 0; b = 0; }
            break;
        case 2: // 社会科学
            if (inRange) { r = 255; g = 255; b = 256 - 32 * level; }
            else { r = 255; g = 255; b = 0; }
            break;
        case 3: // 形式科学
            if (inRange) { r = 256 - 32 * level; g = 255; b = 256 - 32 * level; }
            else { r = 0; g = 255; b = 0; }
            break;
        case 4: // 自然科学
            if (inRange) { r = 256 - 32 * level; g = 255; b = 255; }
            else { r = 0; g = 255; b = 255; }
            break;
        case 5: // 応用科学
            if (inRange) { r = 256 - 32 * level; g = 256 - 32 * level; b = 255; }
            else { r = 0; g = 0; b = 255; }
            break;
        case 6: // 学際領域
            if (inRange) { r = 255; g = 256 - 32 * level; b = 255; }
            else { r = 255; g = 0; b = 255; }
            break;
        default:
            // unknown category: fallback to grey-ish by level
            if (inRange) { const v = 256 - 16 * level; r = v; g = v; b = v; }
            else { r = 200; g = 200; b = 200; }
    }
    // clamp and form hex
    return `#${ColorHlpr_ToHex(r)}${ColorHlpr_ToHex(g)}${ColorHlpr_ToHex(b)}`;
}

/**
 * 名称     : 暗色の16進数
 * 内容     : 16進数の色を暗くする
 * @param {string} hex - 16進数の色
 * @param {number} amount - 暗くする量
 * @returns {string} - 暗くなった16進数の色
 */
export function COLORHLPR_DarkenHex(hex, amount = 30) {
    // border darker
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `#${ColorHlpr_ToHex(r - amount)}${ColorHlpr_ToHex(g - amount)}${ColorHlpr_ToHex(b - amount)}`;
}

/**
 * 名称     : ノード適用の色オブジェクト算出
 * 内容     : ノードに適用する色オブジェクトを計算する
 * @param {object} n - ノード
 * @param {string} colorMode - 色モード
 * @returns {object} - ノードに適用する色オブジェクト
 */
export function COLORHLPR_ComputeNodeColorObj(n, colorMode) {
    if (colorMode === 'rainbow') {
        const bg = COLORHLPR_ComputeRainbowHex(n);
        const border = COLORHLPR_DarkenHex(bg, 30);
        return { background: bg, border: border, highlight: { background: bg, border: border } };
    }
    // colorMode === 'default-color': 共通のデフォルトカラーを明示的に適用（古い色を上書き）
    return { background: '#97C2FC', border: '#2B7CE9', highlight: { background: '#D2E5FF', border: '#2B7CE9' } };
}
