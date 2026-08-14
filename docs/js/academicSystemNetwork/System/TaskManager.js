// ----------------------------------------------------------------------------
// ファイル名      : TaskManager.js
// モジュール記号  : TSKMNG / TskMng
// モジュール名    : タスク管理 (SW001-SYS-TSKMNG) Source File
// 内容            : DOMContentLoaded 起点での初期化、状態遷移、エラーハンドリング
// Copyright(c) 2025-2026 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { FETCHGRAPH_FetchNodesData, FETCHGRAPH_FetchKeywordEdges, FETCHGRAPH_FetchConcepts, FETCHGRAPH_FetchRelations, FETCHGRAPH_FetchRelationTypes, FETCHGRAPH_FetchRankingData } from '../Communication/FetchGraphData.js';
import { HASHSTATE_ParseHashNodeId } from '../Communication/HashState.js';
import { $id, DOMWRITER_RequireElements, DOMWRITER_GetByName } from '../Middleware/DomWriter.js';
import { APPSTATE_STATE, APPSTATE_SetState, APPSTATE_SetErrorFlag, APPSTATE_GetErrorFlags, APPSTATE_GetDebugState } from '../Middleware/AppState.js';
import { ADAPTNET_InitNetworkIfNeeded } from '../Middleware/NetworkAdapter.js';
import { ASNCTRL_ValidateData, ASNCTRL_InitAsn } from '../Application/AsnCtrl.js';
import { PATHUTILS_EnsureLevelsFromPaths } from '../Application/PathUtils.js';
import { SEARCHID_PerformIdSearch } from '../Application/IdSearcher.js';
import { SEARCHDEPTH_PerformDepthSearch } from '../Application/DepthSearcher.js';
import { SEARCHLABEL_PerformLabelSearch } from '../Application/LabelSearcher.js';
import { EDGELYRCTRL_GetEdgeLayerState } from '../Application/EdgeLayerCtrl.js';
import { VISLKMNG_ClearVisualLock } from '../Application/VisualLockManager.js';

let dom = {};

async function TSKMNG_MainTask() {
    console.log('[MAIN] start state machine');

    dom = DOMWRITER_RequireElements([
        'network', 'minDepth', 'maxDepth', 'updateBtn',
        'labelSearchInput', 'labelSearchBtn', 'labelSearchSuggestions',
        'pageSearchInput', 'pageSearchBtn', 'pageSearchSuggestions'
    ]);

    // DOM 要素が揃っているか簡易チェック
    if (!dom) {
        console.error('[ERROR] 必要な DOM 要素が見つかりません。処理を中止します。');
        APPSTATE_SetErrorFlag('missingDom', true);
        APPSTATE_SetState(APPSTATE_STATE.ERROR);
        return;
    }

    dom.networkContainer = dom.network;
    dom.focusUp = $id('focusUp');
    dom.focusDown = $id('focusDown');
    dom.clickModeRadios = DOMWRITER_GetByName('clickMode');
    dom.colorModeRadios = DOMWRITER_GetByName('colorMode');

    // ------------------------
    // 初期化フロー（状態遷移順）
    // ------------------------
    try {
        // データの取得
        const TSKMNG_NodesData = await FETCHGRAPH_FetchNodesData();
        const TSKMNG_KeywordEdgesData = await FETCHGRAPH_FetchKeywordEdges();
        const TSKMNG_ConceptsData = await FETCHGRAPH_FetchConcepts();
        const TSKMNG_RelationsData = await FETCHGRAPH_FetchRelations();
        const TSKMNG_RelationTypesData = await FETCHGRAPH_FetchRelationTypes();
        const TSKMNG_RankingData = await FETCHGRAPH_FetchRankingData();

        // STATE 1: データ検証
        ASNCTRL_ValidateData(TSKMNG_NodesData);
        if (APPSTATE_GetErrorFlags().invalidData) {
            console.error('[MAIN] data validation failed - abort');
            APPSTATE_SetState(APPSTATE_STATE.ERROR);
            return;
        }

        // グローバル: データが持つ最大の depth（level）
        // ensure levels are present/consistent かつ最大深さを計算（mainPath 優先で計算）
        const maxAvailableLevel = PATHUTILS_EnsureLevelsFromPaths(TSKMNG_NodesData);
        console.log('[DATA] computed maxAvailableLevel =', maxAvailableLevel);

        // STATE 2: ネットワーク初期化
        // ------------------------
        // STATE 2: NETWORK_INITIALIZATION
        // ------------------------
        APPSTATE_SetState(APPSTATE_STATE.NETWORK_INITIALIZATION);
        console.log('[STATE] NETWORK_INITIALIZATION');

        if (!ADAPTNET_InitNetworkIfNeeded(dom.networkContainer)) {
            console.error('[MAIN] network initialization failed - abort');
            return;
        }

        // register UI handlers after network ready
        ASNCTRL_InitAsn(TSKMNG_NodesData, TSKMNG_KeywordEdgesData, TSKMNG_ConceptsData, TSKMNG_RelationsData, TSKMNG_RelationTypesData, TSKMNG_RankingData, dom, maxAvailableLevel);

        // STATE 3: hash bootstrap (if any)
        const idFromHash = HASHSTATE_ParseHashNodeId();
        let hashHandled = false;

        // ここで入力フォームへ値を自動セット（ID に対応する label を取得して表示）
        if (idFromHash !== null) {
            console.log('[HASH] ID from fragment:', idFromHash);
            const targetNode = TSKMNG_NodesData.find(n => n.id === idFromHash);
            if (targetNode) {
                dom.labelSearchInput.value = targetNode.label;  // ID ではなく label を代入
                console.log('input successed:', targetNode.label);
            } else {
                console.warn('Node not found for id:', idFromHash);
            }

            // BOOTSTRAP_SEARCH 実行（成功時は true）
            hashHandled = SEARCHID_PerformIdSearch(idFromHash, dom, maxAvailableLevel, EDGELYRCTRL_GetEdgeLayerState(), TSKMNG_NodesData, TSKMNG_KeywordEdgesData, TSKMNG_ConceptsData, TSKMNG_RelationsData, TSKMNG_RelationTypesData, TSKMNG_RankingData, { fromHash: true });
        } else {
            // 何も実行しない
        }

        if (hashHandled) {
            // BOOTSTRAP_SEARCH did internal drawing
            console.log('[MAIN] bootstrap handled, entering IDLE');
            APPSTATE_SetState(APPSTATE_STATE.IDLE);
            return;
        } else {
            // 何も実行しない
        }

        // otherwise draw default graph according to selects
        APPSTATE_SetState(APPSTATE_STATE.IDLE);
        console.log('[MAIN] entering IDLE state');
        // initial draw (respect current min/max selects)
        SEARCHDEPTH_PerformDepthSearch(dom, maxAvailableLevel, EDGELYRCTRL_GetEdgeLayerState(), TSKMNG_NodesData, TSKMNG_KeywordEdgesData, TSKMNG_ConceptsData, TSKMNG_RelationsData, TSKMNG_RelationTypesData, TSKMNG_RankingData);

        // ------------------------
        // 公開（デバッグ用）
        // ------------------------
        window.__SiteGraph = {
            APPSTATE_STATE,
            DEBUG_GetCurrentState: () => APPSTATE_GetDebugState().AppState_CurrentState,
            DEBUG_GetErrorFlags: () => APPSTATE_GetErrorFlags(),
            DEBUG_ReinitNetwork: () => initNetworkIfNeeded(dom.networkContainer),
            DEBUG_PerformDepthSearch: () => SEARCHDEPTH_PerformDepthSearch(dom, maxAvailableLevel, EDGELYRCTRL_GetEdgeLayerState(), TSKMNG_NodesData, TSKMNG_KeywordEdgesData, TSKMNG_ConceptsData, TSKMNG_RelationsData, TSKMNG_RelationTypesData, TSKMNG_RankingData),
            // __SiteGraph.DEBUG_PerformLabelSearch('物理学'): 「物理学」で検索した状態を直接再現
            DEBUG_PerformLabelSearch: (label) => SEARCHLABEL_PerformLabelSearch(label, dom, maxAvailableLevel, EDGELYRCTRL_GetEdgeLayerState(), TSKMNG_NodesData, TSKMNG_KeywordEdgesData, TSKMNG_ConceptsData, TSKMNG_RelationsData, TSKMNG_RelationTypesData, TSKMNG_RankingData),
            // __SiteGraph.DEBUG_PerformIdSearch(10): ID 10 のノードを中心とした表示を直接再現
            DEBUG_PerformIdSearch: (id) => SEARCHID_PerformIdSearch(id, dom, maxAvailableLevel, EDGELYRCTRL_GetEdgeLayerState(), TSKMNG_NodesData, TSKMNG_KeywordEdgesData, TSKMNG_ConceptsData, TSKMNG_RelationsData, TSKMNG_RelationTypesData, TSKMNG_RankingData),
            // __SiteGraph.DEBUG_ClearVisualLock(): UIの薄暗くする見た目ロックを手動解除
            DEBUG_ClearVisualLock: () => VISLKMNG_ClearVisualLock(dom)
        };

    } catch (e) {
        console.error('[MAIN] unexpected error:', e);
        APPSTATE_SetState(APPSTATE_STATE.ERROR);
    }
}

document.addEventListener('DOMContentLoaded', TSKMNG_MainTask);
