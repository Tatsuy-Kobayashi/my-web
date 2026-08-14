// ----------------------------------------------------------------------------
// ファイル名      : IdSearcher.js
// モジュール記号  :  / SearchId
// モジュール名    : ID検索 (SW302-APP-SEARCHID) Source File
// 内容            : ID検索ロジックを実装
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { PATHUTILS_BuildVisibleEdges } from './PathUtils.js';
import { VISLKMNG_ApplyVisualLock } from './VisualLockManager.js';
import { DOMWRITER_QuerySelector } from '../Middleware/DomWriter.js';
import { ADAPTNET_SetNetworkData } from '../Middleware/NetworkAdapter.js';
import { APPSTATE_SetState, APPSTATE_STATE } from '../Middleware/AppState.js';

/**
 * 名称     : ID検索実行
 * 内容     : 指定されたIDのノードを中心とした表示を直接再現
 * @param {number} id - ノードID
 * @param {Object} dom - DOM要素
 * @param {number} maxAvailableLevel - 最大利用可能レベル
 * @param {Object} edgeLayerState - エッジレイヤー状態
 * @param {Object[]} nodesData - ノードデータ
 * @param {Object[]} keywordEdgesData - キーワードエッジデータ
 * @param {Object[]} conceptsData - コンセプトデータ
 * @param {Object[]} relationsData - リレーションデータ
 * @param {Object[]} relationTypes - リレーションタイプデータ
 * @param {Object[]} rankingData - ランキングデータ
 * @param {Object} options - オプション: { fromHash: boolean } -- ハッシュ起動かどうかのフラグ
 * @returns {boolean} - 成功したかどうか
 */
export function SEARCHID_PerformIdSearch(id, dom, maxAvailableLevel, edgeLayerState, nodesData, keywordEdgesData, conceptsData, relationsData, relationTypes, rankingData, options = {}) {
    const data = { nodesData, keywordEdgesData, conceptsData, relationsData, relationTypes, rankingData };

    APPSTATE_SetState(APPSTATE_STATE.SEARCHING);
    console.log('[SEARCH] performIdSearch start, id=', id, 'options=', options);

    if (!Number.isFinite(id)) {
        alert('ID が不正です');
        APPSTATE_SetState(APPSTATE_STATE.IDLE);
        return false;
    }

    const target = nodesData.find(n => n.id === id);
    if (!target) {
        alert('指定したIDのノードが存在しません: ' + id);
        APPSTATE_SetState(APPSTATE_STATE.IDLE);
        return false;
    }

    const level = target.level;
    const min = Math.max(0, level - 1);
    let max = level + 1;
    // データの最大深さを超えている場合は clamp
    if (max > maxAvailableLevel) { max = maxAvailableLevel; }

    // 深さを更新（UI に反映）
    dom.minDepth.value = String(min);
    dom.maxDepth.value = String(max);

    // node/edge フィルタ
    const filteredNodes = nodesData.filter(n => (typeof n.level === 'number') && n.level >= min && n.level <= max);
    const filteredEdges = PATHUTILS_BuildVisibleEdges(filteredNodes, edgeLayerState, data);

    // カラーモードをデフォルトに変更
    const colorModeEl = DOMWRITER_QuerySelector('input[name="colorMode"]:checked');
    const colorMode = colorModeEl ? colorModeEl.value : 'default-color';

    // 描画
    ADAPTNET_SetNetworkData(filteredNodes, filteredEdges, colorMode, rankingData);

    // 見た目ロック（ID検索が適用されている状態を示す）
    VISLKMNG_ApplyVisualLock('id', dom);

    APPSTATE_SetState(APPSTATE_STATE.IDLE);
    console.log('[SEARCH] performIdSearch done');
    return true;
}
