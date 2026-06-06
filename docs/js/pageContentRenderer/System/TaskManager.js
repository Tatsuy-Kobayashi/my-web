// ----------------------------------------------------------------------------
// ファイル名     : TaskManager.js
// モジュール記号  : TSKMNG / TskMng
// モジュール名    : タスク管理 (SW001-SYS-TSKMNG) Source File
// 内容           : DOMContentLoaded 起点での初期化、状態遷移、エラーハンドリング
// Copyright(c) 2025-2026 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { FETCHDATA_FetchSiteData, FETCHDATA_FetchConcepts, FETCHDATA_FetchRelations, FETCHDATA_FetchRelationTypes, FETCHDATA_FetchViewStats } from '../Communication/FetchSiteData.js';
import { DEVICE_ResolveCurrentNode } from '../Communication/DeviceInfo.js';
import { PCR_renderAllParts } from '../Application/PcrCtrl.js';

/**
 * 名称     : システム起動
 * 内容     : ページコンテンツレンダラの初期化とメイン処理を実行する
 * 引数     : なし
 * @returns {Promise<void>}
 */
export async function TskMng_BootPgCntRndr() {
    // データの取得
    const TSKMNG_SiteData = await FETCHDATA_FetchSiteData();
    const TSKMNG_Concepts = await FETCHDATA_FetchConcepts();
    const TSKMNG_Relations = await FETCHDATA_FetchRelations();
    const TSKMNG_RelationTypes = await FETCHDATA_FetchRelationTypes();
    const TSKMNG_ViewStats = await FETCHDATA_FetchViewStats();

    // 現在の記事ノードを特定
    try {
        const TskMng_CurrentNode = DEVICE_ResolveCurrentNode(TSKMNG_SiteData);

        if (!TskMng_CurrentNode) {
            console.warn('Current node not found in siteData.');
            return;
        }

        // --- 各パーツの生成実行 ---
        PCR_renderAllParts(TSKMNG_SiteData, TSKMNG_Concepts, TSKMNG_Relations, TSKMNG_RelationTypes, TSKMNG_ViewStats, TskMng_CurrentNode);
    } catch (error) {
        console.error('Error initializing page components:', error);
    }
}

// エントリポイント: DOMContentLoaded で初期化を開始
document.addEventListener('DOMContentLoaded', async function () {
    await TskMng_BootPgCntRndr();
});
