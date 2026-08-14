// ----------------------------------------------------------------------------
// ファイル名      : HashState.js
// モジュール記号  : HASHSTATE / HashState
// モジュール名    : ハッシュ状態管理 (SW101-COM-HASHSTATE) Source File
// 内容            : ハッシュの解析と状態遷移
// Copyright(c) 2025-2026 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { APPSTATE_STATE, APPSTATE_SetState } from '../Middleware/AppState.js';

// ------------------------
// HASH_BOOTSTRAP / BOOTSTRAP_SEARCH
// ------------------------
export function HASHSTATE_ParseHashNodeId() {
    APPSTATE_SetState(APPSTATE_STATE.HASH_BOOTSTRAP);
    console.log('[STATE] HASH_BOOTSTRAP');

    const raw = HashState_GetCurrentHash();
    if (!raw) {
        console.log('[HASH] fragment が存在しません');
        return null;
    }

    // パターン: #id_30
    if (/^#id_\d+$/.test(raw)) {
        const idFromHash = Number(raw.replace('#id_', ''));
        if (Number.isFinite(idFromHash)) {
            return idFromHash;
        }
    }

    console.log('[HASH] 未対応のハッシュ形式または数値抽出失敗:', raw);
    return null;
}

export function HashState_GetCurrentHash() {
    return window.location.hash || '';
}
