// ----------------------------------------------------------------------------
// ファイル名      : AsnCtrl.js
// モジュール記号  : ASNCTRL / AsnCtrl
// モジュール名    : アプリケーション制御 (SW300-APP-ASNCTRL) Source File
// 内容            : 学問体系ネットワーク図のアプリケーション制御
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { assertLoadedNodes } from '../../common/siteHierarchy/Hierarchy.mjs';
import { PATHUTILS_BuildVisibleEdges } from './PathUtils.js';
import { SEARCHDEPTH_BindDepthSearchEvents, SEARCHDEPTH_PerformDepthSearch } from './DepthSearcher.js';
import { SEARCHLABEL_BindLabelSearchEvents, SEARCHLABEL_PerformLabelSearch } from './LabelSearcher.js';
import { SEARCHPAGE_ClearPageSearchHighlight, SEARCHPAGE_BindPageSearchEvents, SEARCHPAGE_PerformPageSearch } from './PageSearcher.js';
import { NODEFOCUS_PerformNodeFocus } from './NodeFocus.js';
import { EDGELYRCTRL_GetEdgeLayerState, EDGELYRCTRL_RenderEdgeLyrCtrls } from './EdgeLayerCtrl.js';
import { NODEINFPNL_RegisterNodeClickHandler } from './NodeInfoPanel.js';
import { CTRLPNLMNG_InitPanelDrag, CTRLPNLMNG_InitPanelToggle } from './ControlsPanelManager.js';
import { VISLKMNG_BindFocusResetEvents } from './VisualLockManager.js';
import { APPSTATE_STATE, APPSTATE_SetState, APPSTATE_SetErrorFlag, APPSTATE_GetErrorFlags } from '../Middleware/AppState.js';
import { ADAPTNET_GetCurrentNodeIds, ADAPTNET_RefreshNetworkColors, ADAPTNET_SetNetworkData, ADAPTNET_SetDisplayMode, ADAPTNET_GetDisplayMode } from '../Middleware/NetworkAdapter.js';
import { DOMWRITER_QuerySelector } from '../Middleware/DomWriter.js';

// ------------------------
// STATE 1: DATA_INITIALIZATION
// （ここでは簡単なバリデーションを行う）
// ------------------------
/**
 * 名称     : データ検証
 * 内容     : データの検証を行う
 * @param {Array<Object>} nodesData - ノードデータの配列
 * @returns {boolean} - 検証結果
 */
export function ASNCTRL_ValidateData(nodesData) {
    APPSTATE_SetState(APPSTATE_STATE.DATA_INITIALIZATION);
    console.log('[STATE] DATA_INITIALIZATION');
    APPSTATE_SetErrorFlag('invalidData', false);
    try {
        assertLoadedNodes(nodesData);
        return true;
    } catch (error) {
        console.error(error);
        APPSTATE_SetErrorFlag('invalidData', true);
        return false;
    }
}

// ------------------------
// クリック／イベントハンドラの初期登録（APPSTATE_STATE.IDLE で動く）
// ------------------------
/**
 * 名称     : 学問体系ネットワーク図の初期化
 * 内容     : 学問体系ネットワーク図の初期化を行う
 * @param {Array<Object>} nodesData - ノードデータの配列
 * @param {Array<Object>} keywordEdgesData - キーワードエッジデータの配列
 * @param {Array<Object>} conceptsData - コンセプトデータの配列
 * @param {Array<Object>} relationsData - リレーションデータの配列
 * @param {Array<Object>} relationTypes - リレーションタイプの配列
 * @param {Array<Object>} rankingData - ランキングデータの配列
 * @param {Object} dom - DOM要素
 * @param {number} maxAvailableLevel - 最大利用可能レベル
 */
// 備考     : これはメイン制御やループでコールされる関数ではないが、
//            各種イベントハンドラが登録され、外部入力による状態遷移が生じる。
export function ASNCTRL_InitAsn(nodesData, keywordEdgesData, conceptsData, relationsData, relationTypes, rankingData, dom, maxAvailableLevel) {
    const data = { nodesData, keywordEdgesData, conceptsData, relationsData, relationTypes, rankingData };

    // 将来的に EDGELYRCTRL_GetEdgeLayerState() が毎回新しいオブジェクト（イミュータブルな状態）を返すように改修された場合、
    // 各所で直接関数をコールする設計に切り替えるべき
    const edgeLayerState = EDGELYRCTRL_GetEdgeLayerState();

    // エッジレイヤーコントロールの初期描画
    EDGELYRCTRL_RenderEdgeLyrCtrls(() => {
        // エッジ表示の切り替えは、直前に実行された検索機能ではなく
        // 現在ネットワークに表示されているノード集合を基準にする。
        const currentNodeIds = new Set(ADAPTNET_GetCurrentNodeIds());
        const currentNodes = nodesData.filter(node => currentNodeIds.has(node.id));
        const currentEdges = PATHUTILS_BuildVisibleEdges(currentNodes, EDGELYRCTRL_GetEdgeLayerState(), data);
        const colorModeEl = DOMWRITER_QuerySelector('input[name="colorMode"]:checked');
        const colorMode = colorModeEl ? colorModeEl.value : 'default-color';

        ADAPTNET_SetNetworkData(currentNodes, currentEdges, colorMode, rankingData);
    });

    // 深さ検索ボタン
    SEARCHDEPTH_BindDepthSearchEvents(dom, () => {
        SEARCHDEPTH_PerformDepthSearch(dom, maxAvailableLevel, edgeLayerState, nodesData, keywordEdgesData, conceptsData, relationsData, relationTypes, rankingData);
    });

    // label 検索機能
    SEARCHLABEL_BindLabelSearchEvents(dom, nodesData, (label) => {
        SEARCHLABEL_PerformLabelSearch(label, dom, maxAvailableLevel, edgeLayerState, nodesData, keywordEdgesData, conceptsData, relationsData, relationTypes, rankingData);
    });

    // ページ内検索機能
    SEARCHPAGE_BindPageSearchEvents(dom, (label) => {
        SEARCHPAGE_PerformPageSearch(label, nodesData, rankingData);
    });

    // ノードクリック時の動作
    NODEINFPNL_RegisterNodeClickHandler(dom, (nodeId, up, down) => {
        NODEFOCUS_PerformNodeFocus(nodeId, up, down, nodesData, dom, edgeLayerState, data);
    });

    // カラーモードラジオの変更を検知して再描画（レインボー適用）
    if (dom.colorModeRadios && dom.colorModeRadios.length) {
        for (const r of dom.colorModeRadios) {
            r.addEventListener('change', () => {
                console.log('[UI] colorMode changed ->', DOMWRITER_QuerySelector('input[name="colorMode"]:checked').value);
                // ページ内検索ハイライトをクリア
                SEARCHPAGE_ClearPageSearchHighlight();
                const colorMode = DOMWRITER_QuerySelector('input[name="colorMode"]:checked').value;
                // 現在表示しているノード/エッジを再取得して色を再適用
                ADAPTNET_RefreshNetworkColors(colorMode, rankingData);
            });
        }
    }

    // 2D / 3D表示モードの変更。ラジオボタンは同じnameで排他的に維持する。
    if (dom.graphModeRadios && dom.graphModeRadios.length) {
        for (const r of dom.graphModeRadios) {
            r.addEventListener('change', () => {
                const requestedMode = DOMWRITER_QuerySelector('input[name="graphMode"]:checked')?.value || '2d';
                if (ADAPTNET_SetDisplayMode(requestedMode, dom.networkContainer)) {
                    console.log('[UI] graphMode changed ->', requestedMode);
                    return;
                }

                // 3Dライブラリが利用できない場合は、直前のモードへ戻す。
                const activeMode = ADAPTNET_GetDisplayMode();
                for (const modeRadio of dom.graphModeRadios) {
                    modeRadio.checked = modeRadio.value === activeMode;
                }
                console.warn('[UI] graphMode change rejected ->', requestedMode);
            });
        }
    }

    // ------------------------
    // パネル ドラッグ移動
    // ------------------------
    CTRLPNLMNG_InitPanelDrag();
    // ------------------------
    // パネル 縮小/拡大トグル
    // ------------------------
    CTRLPNLMNG_InitPanelToggle();
    // ------------------------
    // 再フォーカス時の解除
    // ------------------------
    // エッジ表示トグル
    VISLKMNG_BindFocusResetEvents(dom);
}
