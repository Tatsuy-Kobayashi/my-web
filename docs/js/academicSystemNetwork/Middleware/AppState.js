// ----------------------------------------------------------------------------
// ファイル名      : AppState.js
// モジュール記号  : APPSTATE / AppState
// モジュール名    : 状態管理 (SW203-MID-APPSTATE) Source File
// 内容            : 学問体系ネットワーク図の状態管理
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ------------------------
// 状態定義
// ------------------------
export const APPSTATE_STATE = {
    DOM_LOADING: 'DOM_LOADING',
    DATA_INITIALIZATION: 'DATA_INITIALIZATION',
    NETWORK_INITIALIZATION: 'NETWORK_INITIALIZATION',
    HASH_BOOTSTRAP: 'HASH_BOOTSTRAP',
    BOOTSTRAP_SEARCH: 'BOOTSTRAP_SEARCH',
    IDLE: 'IDLE',
    SEARCHING: 'SEARCHING',
    ERROR: 'ERROR'
};

// ------------------------
// エラーフラグ
// ------------------------
const AppState_ErrorFlags = {
    missingDom: false,
    visNotAvailable: false,
    invalidData: false,
    networkInitFailed: false
};

let AppState_CurrentState = APPSTATE_STATE.DOM_LOADING; // 「DOM読み込み中」で初期化

// ------------------------
// 状態設定
// ------------------------


/**
 * 名称     : 状態設定
 * 内容     : 学問体系ネットワーク図アプリの状態を設定する
 * @param {string} state - アプリケーションの状態
 */
export function APPSTATE_SetState(state) {
    AppState_CurrentState = state;
}

/**
 * 名称     : 状態取得
 * 内容     : 学問体系ネットワーク図アプリの状態を取得する
 * @returns {string} - アプリケーションの状態
 */
export function APPSTATE_GetState() {
    return AppState_CurrentState;
}

/**
 * 名称     : エラーフラグ設定
 * 内容     : エラーフラグを設定する
 * @param {string} key - エラーフラグのキー
 * @param {boolean} value - エラーフラグの値
 */
export function APPSTATE_SetErrorFlag(key, value = true) {
    if (key in AppState_ErrorFlags) {
        AppState_ErrorFlags[key] = value;
    }
}

/**
 * 名称     : エラーフラグ取得
 * 内容     : エラーフラグを取得する
 * @returns {Object} - エラーフラグのオブジェクト
 */
export function APPSTATE_GetErrorFlags() {
    return { ...AppState_ErrorFlags };
}

/**
 * 名称     : エラーフラグリセット
 * 内容     : エラーフラグをリセットする
 * @returns {void}
 */
export function APPSTATE_ResetErrorFlags() {
    for (const key of Object.keys(AppState_ErrorFlags)) {
        AppState_ErrorFlags[key] = false;
    }
}

/**
 * 名称     : デバッグ用状態取得
 * 内容     : デバッグ用の状態を取得する
 * @returns {Object} - デバッグ用の状態オブジェクト
 */
export function APPSTATE_GetDebugState() {
    return {
        AppState_CurrentState,
        AppState_ErrorFlags: { ...AppState_ErrorFlags }
    };
}
