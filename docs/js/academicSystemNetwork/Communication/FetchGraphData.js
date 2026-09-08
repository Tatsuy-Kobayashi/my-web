// ----------------------------------------------------------------------------
// ファイル名      : FetchGraphData.js
// モジュール記号  : FETCHGRAPH / FetchGraph
// モジュール名    : 検索データ取得 (SW100-COM-FETCHGRAPH) Source File
// 内容            : JSONファイルから検索、サイトデータ、概念、関係、ランキングなどのデータをフェッチする
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

const FetchGraph_BASE_URL = 'https://tatsuy-kobayashi.github.io/my-web/docs/data/';

/**
 * 名称     : JSONファイル取得処理
 * 内容     : JSONファイルからデータを読み込む
 * @param {string} url - 取得先URL
 * @param {any} fallback - エラー時のフォールバック値
 * @returns {Promise<any>}
 */
async function FetchGraph_FetchJson(url, fallback) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (e) {
        console.warn(`[FetchGraphData] Failed to fetch ${url}. Using fallback.`, e);
        return fallback;
    }
}

/**
 * 名称     : ノードデータ取得
 * 内容     : JSONファイルからノードデータを読み込む
 * @returns {Promise<Array>}
 */
export async function FETCHGRAPH_FetchNodesData() {
    // ------------------------
    // データ（ノード）
    // ------------------------
    console.log('[INIT] Loading nodesData...');
    const FETCHGRAPH_NodesData = await FetchGraph_FetchJson(FetchGraph_BASE_URL + 'siteData.json', []);

    return FETCHGRAPH_NodesData;
}

/**
 * 名称     : キーワード関係データ取得
 * 内容     : JSONファイルからキーワード間の関係データを読み込む
 * @returns {Promise<Array>}
 */
export async function FETCHGRAPH_FetchKeywordEdges() {
    // ------------------------
    // キーワード間の関係
    // ------------------------
    console.log('[INIT] Loading keywordEdges...');
    const FETCHGRAPH_KeywordEdges = await FetchGraph_FetchJson(FetchGraph_BASE_URL + 'keywordEdges.json', []);

    return FETCHGRAPH_KeywordEdges;
}

/**
 * 名称     : 概念データ取得
 * 内容     : JSONファイルから概念エンティティを読み込む
 * @returns {Promise<Array>}
 */
export async function FETCHGRAPH_FetchConcepts() {
    // ------------------------
    // 概念エンティティ
    // ------------------------
    console.log('[INIT] Loading concepts...');
    const FETCHGRAPH_Concepts = await FetchGraph_FetchJson(FetchGraph_BASE_URL + 'concepts.json', []);

    return FETCHGRAPH_Concepts;
}

/**
 * 名称     : 関係データ取得
 * 内容     : JSONファイルから型付き関係を読み込む
 * @returns {Promise<Array>}
 */
export async function FETCHGRAPH_FetchRelations() {
    // ------------------------
    // 型付き辺
    // ------------------------
    console.log('[INIT] Loading relations...');
    const FETCHGRAPH_Relations = await FetchGraph_FetchJson(FetchGraph_BASE_URL + 'relations.json', []);

    return FETCHGRAPH_Relations;
}

/**
 * 名称     : 関係タイプデータ取得
 * 内容     : JSONファイルから関係タイプのデータを読み込む
 * @returns {Promise<Array>}
 */
export async function FETCHGRAPH_FetchRelationTypes() {
    // ------------------------
    // 関係タイプ
    // ------------------------
    console.log('[INIT] Loading relationTypes...');
    const expectedSchemaVersion = 1;
    const FETCHGRAPH_RelationTypesData = await FetchGraph_FetchJson(FetchGraph_BASE_URL + 'relationTypes.json', null);

    if (!FETCHGRAPH_RelationTypesData || typeof FETCHGRAPH_RelationTypesData !== 'object' || Array.isArray(FETCHGRAPH_RelationTypesData)) {
        throw new Error('[FetchGraphData] relationTypes.json must be an object.');
    }
    if (FETCHGRAPH_RelationTypesData.schemaVersion !== expectedSchemaVersion) {
        throw new Error(`[FetchGraphData] Unsupported relationTypes schemaVersion: ${FETCHGRAPH_RelationTypesData.schemaVersion}`);
    }
    if (!Array.isArray(FETCHGRAPH_RelationTypesData.relationTypes)) {
        throw new Error('[FetchGraphData] relationTypes.json must contain a relationTypes array.');
    }

    return FETCHGRAPH_RelationTypesData.relationTypes;
}

/**
 * 名称     : ランキングデータ取得
 * 内容     : JSONファイルから検索ランキングのスコアデータを読み込む
 * @returns {Promise<Array>}
 */
export async function FETCHGRAPH_FetchRankingData() {
    // ------------------------
    // ランキングスコア
    // ------------------------
    console.log('[INIT] Loading ranking...');
    const FetchGraph_RankingData = await FetchGraph_FetchJson(FetchGraph_BASE_URL + 'ranking.json', { scores: [] });
    const FETCHGRAPH_RankingData = Array.isArray(FetchGraph_RankingData.scores) ? FetchGraph_RankingData.scores : [];

    return FETCHGRAPH_RankingData;
}
