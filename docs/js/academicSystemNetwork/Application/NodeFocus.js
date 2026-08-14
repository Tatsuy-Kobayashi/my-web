// ----------------------------------------------------------------------------
// ファイル名      : NodeFocus.js
// モジュール記号  : NODEFOCUS / NodeFocus
// モジュール名    : ノードフォーカス検索 (SW306-APP-NODEFOCUS) Source File
// 内容            : ノードフォーカス検索ロジックを実装
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { PATHUTILS_BuildVisibleEdges, PATHUTILS_BuildParentChildMaps, PATHUTILS_ComputeFocusSet } from './PathUtils.js';
import { VISLKMNG_ApplyVisualLock } from './VisualLockManager.js';
import { DOMWRITER_QuerySelector } from '../Middleware/DomWriter.js';
import { APPSTATE_STATE, APPSTATE_SetState } from '../Middleware/AppState.js';
import { ADAPTNET_SetNetworkData } from '../Middleware/NetworkAdapter.js';

// build parent/child maps from nodesData.paths
let NodeFocus_ParentsMap = null;   // childId -> Set(parentIds)
let NodeFocus_ChildrenMap = null;  // parentId -> Set(childIds)

/**
 * 名称     : ノードフォーカス検索
 * 内容     : 指定したノードを中心にして、指定した階層数のノードを表示する
 * @param {string} nodeId - ノードID
 * @param {number} up - 上方向の階層数
 * @param {number} down - 下方向の階層数
 * @param {Object[]} nodesData - ノードデータ
 * @param {Object} dom - DOMオブジェクト
 * @param {Object} edgeLayerState - エッジレイヤー状態
 * @param {Object} data - データ
 * @returns {boolean} - 成功した場合はtrue
 */
export function NODEFOCUS_PerformNodeFocus(nodeId, up, down, nodesData, dom, edgeLayerState, data) {
    APPSTATE_SetState(APPSTATE_STATE.SEARCHING);
    console.log('[SEARCH] performNodeFocus start, id=', nodeId, 'up=', up, 'down=', down);

    const target = nodesData.find(n => n.id === nodeId);
    if (!target) {
        alert('指定したノードが見つかりません: ' + nodeId);
        APPSTATE_SetState(APPSTATE_STATE.IDLE);
        return false;
    }

    if (!NodeFocus_ParentsMap || !NodeFocus_ChildrenMap) {
        const maps = PATHUTILS_BuildParentChildMaps(nodesData);
        NodeFocus_ParentsMap = maps.parentsMap;
        NodeFocus_ChildrenMap = maps.childrenMap;
    }

    const focusSet = PATHUTILS_ComputeFocusSet(nodeId, Math.max(0, Math.floor(Number(up) || 0)), Math.max(0, Math.floor(Number(down) || 0)), NodeFocus_ParentsMap, NodeFocus_ChildrenMap);
    const filteredNodes = nodesData.filter(n => focusSet.has(n.id));
    const filteredEdges = PATHUTILS_BuildVisibleEdges(filteredNodes, edgeLayerState, data);

    // カラーモードをデフォルトに変更
    const colorModeEl = DOMWRITER_QuerySelector('input[name="colorMode"]:checked');
    const colorMode = colorModeEl ? colorModeEl.value : 'default-color';

    ADAPTNET_SetNetworkData(filteredNodes, filteredEdges, colorMode, data.rankingData);
    VISLKMNG_ApplyVisualLock('id', dom); // reuse id-lock (visual effect)

    APPSTATE_SetState(APPSTATE_STATE.IDLE);
    console.log('[SEARCH] performNodeFocus done, nodes=', filteredNodes.length);
    return true;
}
