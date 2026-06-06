// ----------------------------------------------------------------------------
// ファイル名      : FetchSiteData.js
// モジュール記号  : FETCHDATA / FetchData
// モジュール名    : サイトデータ取得 (SW100-COM-FETCHDATA) Source File
// 内容           : JSONファイルからサイトデータ、概念、関係などのデータをフェッチする
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

/**
 * 名称     : JSONファイル取得処理
 * 内容     : JSONファイルからサイトデータ、概念、関係などのデータを読み込む
 * @param {string} url - 取得先URL
 * @param {any} fallback - エラー時のフォールバック値
 * @returns {Promise<any>}
 */
async function FetchData_FetchJson(url, fallback) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        console.warn(`[FetchSiteData] Failed to fetch ${url}. Using fallback.`, e);
        return fallback;
    }
}

/**
 * 名称     : 全データ取得
 * 内容     : サイトのレンダリングに必要な全データを非同期で読み込む
 * @returns {Promise<{ FETCHDATA_SiteData: Array, FETCHDATA_Concepts: Array, FETCHDATA_Relations: Array, FETCHDATA_RelationTypes: Array, FETCHDATA_ViewStats: Array }>}
 */
export async function FETCHDATA_FetchAllData() {
    // ------------------------
    // データ（ノード）
    // ------------------------
    console.log('[INIT] Loading siteData...');
    const FETCHDATA_SiteData = await FetchData_FetchJson('https://tatsuy-kobayashi.github.io/my-web/docs/data/siteData.json', []);

    // ------------------------
    // 概念エンティティ
    // ------------------------
    // conceptId: 概念ID（siteData.json から生成）
    // siteRef: 関連サイトデータ
    //      id: サイトID（siteData.json から生成）
    //      label: サイトラベル（siteData.json から生成）
    //      labelEn: サイト英語ラベル（siteData.json から生成）
    //      mainPath: ルートからのパス情報（siteData.json から生成）
    //      url: サイトURL（siteData.json から生成）
    //      released: 公開フラグ（siteData.json から生成）
    //      isPaid: 有料フラグ（siteData.json から生成）
    // labels: 概念ラベル配列
    //      ja: 日本語ラベル（siteData.json から生成）
    //      en: 英語ラベル（siteData.json から生成）
    // kind: 概念種別（固有データ）
    // description: 概念説明文（固有データ）
    // aliases: 概念の別名配列（固有データ）
    // tags: 概念タグ配列（固有データ）
    // parentConceptIds: 親概念ID配列（siteData.json のツリー構造そのもの）
    // childConceptIds: 子概念ID配列（siteData.json のツリー構造そのもの）
    // searchHints: 検索ヒント配列（固有データ）
    // notes: 備考（固有データ）
    // ------------------------
    console.log('[INIT] Loading concepts...');
    const FETCHDATA_Concepts = await FetchData_FetchJson('https://tatsuy-kobayashi.github.io/my-web/docs/data/concepts.json', []);

    // ------------------------
    // 型付き辺
    // ------------------------
    // relationId: 概念同士の関連ID
    // from: 前提ID（関連の出発点となる概念）
    // to: 支援ID（関連の到着点となる概念）
    // type: 関係の種別
    // inverseType: 逆関係の種別（存在する場合）
    // confidence: 確信度（0.0～1.0の数値、存在する場合）
    // weight: 重み（0.0～1.0の数値、存在する場合）
    // evidence: 確認情報（複数可）
    //      sitePath: サイトのパス情報
    //      siteId: サイトID
    // note: 備考
    // ------------------------
    console.log('[INIT] Loading relations...');
    const FETCHDATA_Relations = await FetchData_FetchJson('https://tatsuy-kobayashi.github.io/my-web/docs/data/relations.json', []);

    // ------------------------
    // 型付き辺の種別（Webページの変化に依存せず、（基本）固定の資産として保存）
    // ------------------------
    console.log('[INIT] Loading relationTypes...');
    const FetchData_RelationTypesData = await FetchData_FetchJson('https://tatsuy-kobayashi.github.io/my-web/docs/data/relationTypes.json', { relationTypes: [] });
    const FETCHDATA_RelationTypes = Array.isArray(FetchData_RelationTypesData.relationTypes) ? FetchData_RelationTypesData.relationTypes : [];

    // 本来はここで fetch('/api/stats/popular') 等を行う
    // ------------------------
    // データ（記事閲覧数）
    // ------------------------
    const FETCHDATA_ViewStats = [
        { id: 3011, label: "集合論", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/set_theory.html", totalViews: 90210, weeklyViews: 420, monthlyViews: 1800 },
        { id: 304022, label: "特殊関数", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_functions/special_functions/special_functions.html", totalViews: 80123, weeklyViews: 380, monthlyViews: 1600 }
    ];

    return { FETCHDATA_SiteData, FETCHDATA_Concepts, FETCHDATA_Relations, FETCHDATA_RelationTypes, FETCHDATA_ViewStats };
}
