// ----------------------------------------------------------------------------
// ファイル名      : VisualLockManager.js
// モジュール記号  : VISLKMNG / VisLkMng
// モジュール名    : ロック表示管理 (SW310-APP-VISLKMNG) Source File
// 内容            : ロック表示の制御ロジックを実装
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

// ------------------------
// 見た目ロック（disabled は使わず、.dimmed のみで示す）
// ------------------------
let VisLkMng_CurrentLock = null; // null | 'id' | 'depth'

/**
 * 名称     : 見た目ロック適用
 * 内容     : 指定されたモードに応じて、関連する UI 要素を dimmed にする
 * @param {string} searchMode - 検索モード
 * @param {Object} dom - DOM要素
 */
export function VISLKMNG_ApplyVisualLock(searchMode, dom) {
    // searchMode: 'id' or 'depth'
    VisLkMng_CurrentLock = searchMode;
    console.log('[UI] applyVisualLock:', searchMode);

    // 要素群（存在チェックしてから扱う）
    const depthInputControls = [dom.minDepth, dom.maxDepth].filter(Boolean);
    const depthBtnControls = [dom.updateBtn].filter(Boolean);
    const labelInputControls = [dom.labelSearchInput, dom.labelSearchSuggestions].filter(Boolean);
    const labelBtnControls = [dom.labelSearchBtn].filter(Boolean);

    // いったん全要素から dimmed を除去
    [...depthInputControls, ...depthBtnControls, ...labelInputControls, ...labelBtnControls].forEach(el => {
        if (el && el.classList) {
            el.classList.remove('dimmed');
            el.classList.remove('btn-dim');
        }
    });

    if (searchMode === 'id') {
        // ラベル（id）検索モードでは深さ操作を弱める
        depthInputControls.forEach(el => { if (el && el.classList) el.classList.add('dimmed'); });
        depthBtnControls.forEach(el => { if (el && el.classList) el.classList.add('btn-dim'); });
    } else if (searchMode === 'depth') {
        // 深さモードではラベル操作を弱める
        labelInputControls.forEach(el => { if (el && el.classList) el.classList.add('dimmed'); });
        labelBtnControls.forEach(el => { if (el && el.classList) el.classList.add('btn-dim'); });
    }
}

/**
 * 名称     : 見た目ロック解除処理
 * 内容     : 現在の見た目ロックを解除する
 * @param {Object} dom - DOM要素
 * @returns {void}
 */
export function VISLKMNG_ClearVisualLock(dom) {
    if (!VisLkMng_CurrentLock) return;
    console.log('[UI] clearVisualLock from', VisLkMng_CurrentLock);
    VisLkMng_CurrentLock = null;

    const depthControls = [dom.minDepth, dom.maxDepth, dom.updateBtn].filter(Boolean);
    const labelControls = [dom.labelSearchInput, dom.labelSearchBtn, dom.labelSearchSuggestions].filter(Boolean);

    [...depthControls, ...labelControls].forEach(el => {
        if (el && el.classList) {
            el.classList.remove('dimmed');
            el.classList.remove('btn-dim');
        }
    });
}

/**
 * 名称     : 再フォーカス時リセット
 * 内容     : ユーザがどれかに focus したら見た目を戻す
 * @param {Object} dom - DOM要素
 * @returns {void}
 */
export function VISLKMNG_BindFocusResetEvents(dom) {
    [dom.labelSearchInput, dom.minDepth, dom.maxDepth].forEach(el => {
        if (el) {
            el.addEventListener('focus', () => {
                if (VisLkMng_CurrentLock) VISLKMNG_ClearVisualLock(dom);
            });
        }
    });
}
