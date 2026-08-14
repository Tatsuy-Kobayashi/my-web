// ----------------------------------------------------------------------------
// ファイル名      : DepthSearcher.js
// モジュール記号  : SEARCHDEPTH / SearchDepth
// モジュール名    : 深さ検索 (SW303-APP-SEARCHDEPTH) Source File
// 内容            : 深さ検索ロジックを実装
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { PATHUTILS_BuildVisibleEdges } from './PathUtils.js';
import { VISLKMNG_ApplyVisualLock } from './VisualLockManager.js';
import { DOMWRITER_QuerySelector } from '../Middleware/DomWriter.js';
import { APPSTATE_SetState, APPSTATE_STATE } from '../Middleware/AppState.js';
import { ADAPTNET_SetNetworkData } from '../Middleware/NetworkAdapter.js';

// ------------------------
// SEARCH 処理（共通）
// ------------------------
/**
 * 名称     : 深さ検索実行
 * 内容     : 指定された深さ範囲のノードとエッジを検索し、ネットワーク図を更新する
 * @param {Object} dom - DOM要素
 * @param {number} maxAvailableLevel - 最大利用可能レベル
 * @param {Object} edgeLayerState - エッジレイヤー状態
 * @param {Object[]} nodesData - ノードデータ
 * @param {Object[]} keywordEdgesData - キーワードエッジデータ
 * @param {Object[]} conceptsData - コンセプトデータ
 * @param {Object[]} relationsData - リレーションデータ
 * @param {Object[]} relationTypes - リレーションタイプデータ
 * @param {Object[]} rankingData - ランキングデータ
 * @returns {void}
 */
export function SEARCHDEPTH_PerformDepthSearch(dom, maxAvailableLevel, edgeLayerState, nodesData, keywordEdgesData, conceptsData, relationsData, relationTypes, rankingData) {
    const data = { nodesData, keywordEdgesData, conceptsData, relationsData, relationTypes, rankingData };

    APPSTATE_SetState(APPSTATE_STATE.SEARCHING);
    console.log('[SEARCH] performDepthSearch start');

    // 深さ検証
    let min = Number(dom.minDepth.value);
    let max = Number(dom.maxDepth.value);

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        alert('数値を入力してください');
        APPSTATE_SetState(APPSTATE_STATE.IDLE);
        return;
    }

    // 整数かつ非負か確認
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < 0) {
        alert('0 以上の整数で入力してください');
        APPSTATE_SetState(APPSTATE_STATE.IDLE);
        return;
    }

    // min/max の整合
    if (min > max) {
        alert('最小深さは最大深さ以下にしてください');
        APPSTATE_SetState(APPSTATE_STATE.IDLE);
        return;
    }

    // データが持つ最大深さを超えていないか確認
    if (max > maxAvailableLevel) {
        alert(`指定した最大深さ [${max}] はデータの最大深さ [${maxAvailableLevel}] を超えています。表示可能な最大深さに合わせます。`);
        max = maxAvailableLevel;
        dom.maxDepth.value = String(max);
        if (min > max) {
            // min が超過してしまう場合は min を clamp
            min = Math.max(0, max);
            dom.minDepth.value = String(min);
        }
    }

    // filter nodes and edges
    const filteredNodes = nodesData.filter(n => (typeof n.level === 'number') && n.level >= min && n.level <= max);
    const filteredEdges = PATHUTILS_BuildVisibleEdges(filteredNodes, edgeLayerState, data);

    // 色モード
    const colorModeEl = DOMWRITER_QuerySelector('input[name="colorMode"]:checked');
    const colorMode = colorModeEl ? colorModeEl.value : 'default-color';

    // 描画
    ADAPTNET_SetNetworkData(filteredNodes, filteredEdges, colorMode, rankingData);

    // 見た目ロック（深さ検索が適用されている状態を示す）
    VISLKMNG_ApplyVisualLock('depth', dom);

    APPSTATE_SetState(APPSTATE_STATE.IDLE);
    console.log('[SEARCH] performDepthSearch done');
}

/**
 * 名称     : 深さ検索イベント設定
 * 内容     : 深さ検索に関連するイベントを設定する
 * @param {Object} dom - DOM要素
 * @param {Function} searchCallback - 検索コールバック関数
 * @returns {void}
 */
export function SEARCHDEPTH_BindDepthSearchEvents(dom, searchCallback) {
    // 深さ検索ボタン
    dom.updateBtn.addEventListener('click', () => {
        console.log('[UI] depth search clicked');
        // 実行時は id input をクリア（仕様）
        dom.labelSearchInput.value = '';
        dom.labelSearchSuggestions.style.display = 'none';

        searchCallback();
    });
}
