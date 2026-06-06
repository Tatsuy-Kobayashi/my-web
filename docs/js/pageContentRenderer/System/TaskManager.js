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
import { FETCHDATA_FetchAllData } from '../Communication/FetchSiteData.js';
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
    const TskMng_Data = await FETCHDATA_FetchAllData();

    // 現在の記事ノードを特定
    try {
        const TskMng_CurrentNode = DEVICE_ResolveCurrentNode(TskMng_Data.FETCHDATA_SiteData);

        if (!TskMng_CurrentNode) {
            console.warn('Current node not found in siteData.');
            return;
        }

        // --- 各パーツの生成実行 ---
        PCR_renderAllParts(TskMng_Data, TskMng_CurrentNode);
    } catch (error) {
        console.error('Error initializing page components:', error);
    }
}

// エントリポイント: DOMContentLoaded で初期化を開始
document.addEventListener('DOMContentLoaded', async function () {
    await TskMng_BootPgCntRndr();
});
