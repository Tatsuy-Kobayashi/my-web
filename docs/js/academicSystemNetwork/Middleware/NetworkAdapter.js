// ----------------------------------------------------------------------------
// ファイル名      : NetworkAdapter.js
// モジュール記号  : ADAPTNET / AdaptNet
// モジュール名    : ネットワーク適応 (SW202-MID-ADAPTNET) Source File
// 内容            : ネットワーク描画ライブラリを操作する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { COLORHLPR_ComputeNodeColorObj } from './ColorHelper.js';
import { APPSTATE_STATE, APPSTATE_SetState, APPSTATE_SetErrorFlag } from './AppState.js';

// ------------------------
// vis-network 管理（初回生成は1度だけ）
// ------------------------
let AdaptNet_Network = null; // vis-network インスタンス
let AdaptNet_NetworkInitialized = false; // 初期化済みフラグを失敗で初期化
let AdaptNet_RankingIdxCache = null; // ランキングスコアキャッシュ
let AdaptNet_CurrentNodeIds = []; // 現在表示中のノードID

/**
 * 名称     : ランキングスコアのインデックス化
 * 内容     : ランキングスコアをインデックス化する
 * @param {Array<object>} rankingData - ランキングデータの配列
 * @returns {Object} - ランキングスコアのインデックス
 */
function AdaptNet_BuildRankingIdx(rankingData) {
    if (AdaptNet_RankingIdxCache) return AdaptNet_RankingIdxCache;

    const scores = Array.isArray(rankingData)
        ? rankingData
        : (rankingData && Array.isArray(rankingData.scores) ? rankingData.scores : []);

    const bySiteId = new Map();
    scores.forEach((score, index) => {
        const siteId = Number(score && score.id);
        if (!Number.isFinite(siteId)) return;
        bySiteId.set(siteId, Object.assign({ __rankIndex: index }, score));
    });

    AdaptNet_RankingIdxCache = {
        bySiteId,
        maxRankIndex: Math.max(1, scores.length - 1)
    };
    return AdaptNet_RankingIdxCache;
}

/**
 * 名称     : ランキングノードサイズ算出
 * 内容     : ノードのサイズを計算する
 * @param {object} node - ノードオブジェクト
 * @param {Array<object>} rankingData - ランキングデータの配列
 * @returns {number} - ノードのサイズ
 */
function AdaptNet_ComputeRankingNodeSize(node, rankingData) {
    const index = AdaptNet_BuildRankingIdx(rankingData);
    const rankingScore = index.bySiteId.get(Number(node && node.id));
    const minSize = 18;
    const maxSize = 40;

    if (!rankingScore) return minSize;

    const rankIndex = Math.max(0, Number(rankingScore.__rankIndex) || 0);
    const denominator = Math.log1p(index.maxRankIndex + 1);
    const normalized = denominator > 0 ? 1 - (Math.log1p(rankIndex + 1) / denominator) : 0;

    return Math.round(minSize + Math.max(0, Math.min(1, normalized)) * (maxSize - minSize));
}

/**
 * 名称     : vis-network用ノードマッピング
 * 内容     : vis-network用のノードマッピングを行う
 * @param {object} node - ノードオブジェクト
 * @param {string} colorMode - 色モード
 * @param {Array<object>} rankingData - ランキングデータの配列
 * @returns {object} - vis-network用ノードオブジェクト
 */
function AdaptNet_MapNodeForNetwork(node, colorMode, rankingData) {
    const nodeCopy = Object.assign({}, node);
    const rankingScore = AdaptNet_BuildRankingIdx(rankingData).bySiteId.get(Number(node && node.id));
    nodeCopy.color = COLORHLPR_ComputeNodeColorObj(node, colorMode);
    nodeCopy.size = AdaptNet_ComputeRankingNodeSize(node, rankingData);

    if (rankingScore) {
        nodeCopy.rankingScore = rankingScore.overallScore;
        nodeCopy.rankingRank = rankingScore.__rankIndex + 1;
        nodeCopy.title = `${nodeCopy.title || nodeCopy.label || ''}\nランキング: ${nodeCopy.rankingRank}\n総合スコア: ${Number(rankingScore.overallScore || 0).toFixed(3)}`;
    }
    return nodeCopy;
}

/**
 * 名称     : vis-network 初期化処理
 * 内容     : vis-network が未初期化なら初期化を行う
 * @param {object} container - vis-network のコンテナ
 * @returns {boolean} - 初期化成功なら true、失敗または既にエラー状態なら false
 */
export function ADAPTNET_InitNetworkIfNeeded(container) {
    if (AdaptNet_NetworkInitialized) return true;
    if (typeof vis === 'undefined' || !vis.Network) {
        console.error('[ERROR] vis-network が読み込まれていません。');
        APPSTATE_SetErrorFlag('visNotAvailable', true);
        APPSTATE_SetState(APPSTATE_STATE.ERROR);
        return false;
    }

    try {
        const nodes = new vis.DataSet([]); // 空で初期化
        const edges = new vis.DataSet([]);
        const data = { nodes, edges };
        const options = {
            layout: { hierarchical: false },
            physics: {
                enabled: true,
                solver: "forceAtlas2Based",
                forceAtlas2Based: {
                    gravitationalConstant: -40,  // 反発力を弱める（デフォルト -200）
                    springLength: 65,            // エッジの自然長を短くする（重要）
                    springConstant: 0.2          // バネの硬さ、強すぎると暴れる
                },
                stabilization: {
                    enabled: true,
                    iterations: 200              // 少なすぎると変な形で止まりやすい
                }
            },
            interaction: { hover: true, zoomView: true },
            edges: {
                arrows: "to",
                smooth: { enabled: false }       // 変な曲がりをなくすため
            }
        };

        AdaptNet_Network = new vis.Network(container, data, options);
        AdaptNet_NetworkInitialized = true;
        console.log('[NETWORK] vis.Network 初期化完了');
        return true;
    } catch (e) {
        console.error('[ERROR] network 初期化に失敗しました:', e);
        APPSTATE_SetErrorFlag('networkInitFailed', true);
        APPSTATE_SetState(APPSTATE_STATE.ERROR);
        return false;
    }
}

/**
 * 名称     : vis-network インスタンスのデータ更新
 * 内容     : nodeList と edgeList を vis.DataSet を生成して AdaptNet_Network にセットする
 * @param {Array<object>} nodeList - ノードリスト配列
 * @param {Array<object>} edgeList - エッジリスト配列
 * @param {string} colorMode - 色モード
 * @param {Array<object>} rankingData - ランキングデータ
 * @returns {boolean} - 成功時は true、失敗時は false
 */
export function ADAPTNET_SetNetworkData(nodeList, edgeList, colorMode, rankingData) {
    console.log('[NETWORK] Updating network data...');
    if (!AdaptNet_NetworkInitialized) return;
    try {
        // Map nodeList to nodes for vis, applying color and ranking size.
        const mappedNodes = nodeList.map(n => AdaptNet_MapNodeForNetwork(n, colorMode, rankingData));

        const nodes = new vis.DataSet(mappedNodes);
        const edges = new vis.DataSet(edgeList);
        AdaptNet_Network.setData({ nodes, edges });
        // エッジレイヤー変更時に、直前に使った検索条件ではなく
        // 現在表示中のノード集合を再利用できるように保持する。
        AdaptNet_CurrentNodeIds = nodeList.map(n => n.id);
        console.log('[NETWORK] setData 実行: nodes=', nodeList.length, 'edges=', edgeList.length);
    } catch (e) {
        console.error('[ERROR] setNetworkData 失敗:', e);
    }
}

/**
 * 名称     : 現在表示中のノードID取得
 * 内容     : 最後にネットワークへ設定したノード集合のIDを取得する
 * @returns {Array<number|string>} - 現在表示中のノードID配列
 */
export function ADAPTNET_GetCurrentNodeIds() {
    return [...AdaptNet_CurrentNodeIds];
}

/**
 * 名称     : vis-network インスタンス取得
 * 内容     : vis-network インスタンスを取得する
 * @returns {vis.Network} - vis-network インスタンス
 */
export function ADAPTNET_GetNetwork() {
    return AdaptNet_Network;
}

/**
 * 名称     : vis-network インスタンスの初期化状態取得
 * 内容     : vis-network インスタンスが初期化状態かどうかを取得する
 * @returns {boolean} - vis-network インスタンスが初期化状態なら true、失敗または既にエラー状態なら false
 */
export function ADAPTNET_GetNetworkInitialized() {
    return AdaptNet_NetworkInitialized;
}

/**
 * 名称     : vis-network のカラー更新
 * 内容     : vis-network のカラーを更新する
 * @param {string} colorMode - 色モード
 * @param {Array<object>} rankingData - ランキングデータ
 * @returns {void}
 */
export function ADAPTNET_RefreshNetworkColors(colorMode, rankingData) {
    // 再レンダリング（現在表示中のノードの色だけを差分更新する。レイアウトは維持される）
    if (!AdaptNet_Network || !AdaptNet_Network.body || !AdaptNet_Network.body.data || !AdaptNet_Network.body.data.nodes) return;
    try {
        const currentNodes = AdaptNet_Network.body.data.nodes.get(); // 表示中のノード配列
        const updates = currentNodes.map(n => ({
            id: n.id,
            color: COLORHLPR_ComputeNodeColorObj(n, colorMode),
            size: AdaptNet_ComputeRankingNodeSize(n, rankingData)
        }));
        AdaptNet_Network.body.data.nodes.update(updates);
        console.log('[UI] refreshNetworkColors executed (in-place), nodes=', updates.length);
    } catch (e) {
        console.warn('[UI] refreshNetworkColors failed:', e);
    }
}
