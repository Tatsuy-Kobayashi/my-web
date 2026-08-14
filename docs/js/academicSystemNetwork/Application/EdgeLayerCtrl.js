// ----------------------------------------------------------------------------
// ファイル名      : EdgeLayerCtrl.js
// モジュール記号  : EDGELYRCTRL / EdgeLyrCtrl
// モジュール名    : エッジレイヤー制御 (SW307-APP-EDGELYRCTRL) Source File
// 内容            : エッジレイヤー制御ロジックを実装
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { $id, DOMWRITER_HasElement, DOMWRITER_QuerySelector, DOMWRITER_CreateElement } from '../Middleware/DomWriter.js';

/**
 * 名称     : エッジレイヤー状態
 * 内容     : エッジレイヤーの状態を保持する
 * @enum {Object}
 * @property {boolean} hierarchy - 階層エッジの表示
 * @property {boolean} keyword - 共通タグエッジの表示
 * @property {boolean} typed - 型付きエッジの表示
 */
let EdgeLyrCtrl_EdgeLayerState = {
    hierarchy: true,
    keyword: false,
    typed: false
};

/**
 * 名称     : エッジレイヤー状態取得
 * 内容     : エッジレイヤー状態を取得する
 * @returns {Object} - エッジレイヤー状態
 */
export function EDGELYRCTRL_GetEdgeLayerState() {
    return EdgeLyrCtrl_EdgeLayerState;
}

/**
 * 名称     : エッジレイヤーコントロール描画
 * 内容     : エッジレイヤーコントロールを描画する
 * @param {Function} onUpdate - エッジレイヤー状態変更時のコールバック関数
 * @returns {void}
 */
export function EDGELYRCTRL_RenderEdgeLyrCtrls(onUpdate) {
    if (DOMWRITER_HasElement('edgeLayerControls')) return;

    const panel = $id('controlsPanel');
    const anchor = panel ? DOMWRITER_QuerySelector('.controls-body', panel) || panel : null;
    if (!anchor) return;

    const fieldset = DOMWRITER_CreateElement('fieldset');
    fieldset.id = 'edgeLayerControls';
    fieldset.className = 'control-group edge-layer-controls';
    fieldset.style.marginTop = '10px';
    fieldset.innerHTML = `
        <legend title="表示するエッジの種類を選択してください">エッジ表示:</legend>
        <label title="mainPath と auxPath から生成される階層エッジ">
            <input type="checkbox" id="showHierarchyEdges" checked>
            階層
        </label>
        <label title="siteData.keywords が共通するページ同士の双方向エッジ">
            <input type="checkbox" id="showKeywordEdges">
            共通タグ
        </label>
        <label title="relations.json に定義された概念間の型付き辺">
            <input type="checkbox" id="showTypedEdges">
            型付き辺
        </label>
    `;

    anchor.appendChild(fieldset);

    const bind = (id, key) => {
        const checkbox = $id(id);
        if (!checkbox) return;
        checkbox.addEventListener('change', () => {
            EdgeLyrCtrl_EdgeLayerState[key] = checkbox.checked;
            onUpdate();
        });
    };

    bind('showHierarchyEdges', 'hierarchy');
    bind('showKeywordEdges', 'keyword');
    bind('showTypedEdges', 'typed');
}
