// ----------------------------------------------------------------------------
// ファイル名      : NodeInfoPanel.js
// モジュール記号  : NODEINFPNL / NodeInfPnl
// モジュール名    : ノード情報パネル (SW308-APP-NODEINFPNL) Source File
// 内容            : ノード情報パネルの制御ロジックを実装
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { $id, DOMWRITER_GetByName } from '../Middleware/DomWriter.js';
import { ADAPTNET_AddInteractionListener } from '../Middleware/NetworkAdapter.js';

/**
 * 名称     : typeset 実行
 * 内容     : MathJax の typeset を実行する（二重レンダリング防止付き）
 * @param {HTMLElement} element - typeset 対象の要素
 */
function NodeInfPnl_DoTypeset(element) {
    if (typeof MathJax !== 'undefined' && typeof MathJax.typesetClear === 'function') {
        MathJax.typesetClear([element]);
    }
    if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
        MathJax.typesetPromise([element])
            .catch(err => console.error('[MathJax] typeset error:', err));
    }
}

/**
 * 名称     : typeset 待機
 * 内容     : MathJax が利用可能になるまで待機し、対象要素を typeset する。
 *            CDN の読み込み遅延や MathJax 内部の非同期初期化を吸収する。
 * @param {HTMLElement} element - typeset 対象の要素
 */
function NodeInfPnl_TypesetWhenReady(element) {
    // 既に ready なら即座に実行
    if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
        NodeInfPnl_DoTypeset(element);
        return;
    }

    // MathJax.startup.promise が存在すれば、それを待つ
    if (typeof MathJax !== 'undefined' && MathJax.startup && MathJax.startup.promise) {
        MathJax.startup.promise
            .then(() => NodeInfPnl_DoTypeset(element))
            .catch(err => console.error('[MathJax] startup error:', err));
        return;
    }

    // CDN がまだロードされていない → ポーリングで待機（最大 10 秒）
    let elapsed = 0;
    const interval = 100;
    const maxWait = 10000;
    const timer = setInterval(() => {
        elapsed += interval;
        if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
            clearInterval(timer);
            NodeInfPnl_DoTypeset(element);
        } else if (elapsed >= maxWait) {
            clearInterval(timer);
            console.warn('[MathJax] MathJax did not become available after', maxWait, 'ms. TeX will not be rendered.');
        }
    }, interval);
}

// ------------------------
// ノード説明パネル
// ------------------------
/**
 * 名称     : ノード説明パネル表示
 * 内容     : ノード説明パネルを表示する
 * @param {Object} node - ノードオブジェクト
 */
export function NODEINFPNL_ShowNodeInfo(node) {
    const panel = $id('nodeInfoPanel');
    const title = $id('nodeInfoTitle');
    const titleEn = $id('nodeInfoTitleEn');
    const body = $id('nodeInfoBody');

    title.textContent = node.label;
    titleEn.textContent = node.labelEn || '';

    // ノード説明：node.description が無いなら空文字
    // innerHTML を使用して TeX デリミタ ($...$) を MathJax が認識できるようにする
    const desc = node.description || "説明はありません。";
    body.innerHTML = desc;

    // MathJax による数式レンダリング（動的に挿入されたコンテンツ用）
    // MathJax 3 の CDN スクリプトは defer + 内部非同期初期化があるため、
    // typesetPromise が利用可能になるまでポーリングで待機する
    NodeInfPnl_TypesetWhenReady(body);

    // パネルを表示
    panel.classList.remove('hidden');
}

/**
 * 名称     : ノード説明パネル非表示
 * 内容     : ノード説明パネルを非表示にする
 * @returns {void}
 */
export function NODEINFPNL_HideNodeInfo() {
    const panel = $id('nodeInfoPanel');
    if (panel) panel.classList.add('hidden');
}

/**
 * 名称     : クリックモードの取得
 * 内容     : クリックモードを取得する
 * @returns {string} - クリックモード ('select', 'nodeFocus', 'link')
 */
export function NODEINFPNL_GetClickMode() {
    const radios = DOMWRITER_GetByName('clickMode');
    for (const r of radios) {
        if (r.checked) return r.value;
    }
    return 'select';
}

/**
 * 名称     : ノードクリックハンドラの登録
 * 内容     : ノードクリックハンドラを登録する
 * @param {Object} dom - DOM要素
 * @param {function(number): void} onNodeFocus - ノードフォーカス時のコールバック関数
 */
export function NODEINFPNL_RegisterNodeClickHandler(dom, onNodeFocus) {
    // ノードクリック判定用タイムスタンプ（短時間の document.click を無視する）
    let __lastNodeClickAt = 0;
    // タッチによる操作タイムスタンプ（スマホ用）
    let __lastTouchAt = 0;

    // スマホのタッチは click に遅延でフォールバックが来るため
    // network 上での touchstart を記録して、直後の document.click による誤閉じを防ぐ
    if (dom.networkContainer) {
        dom.networkContainer.addEventListener('touchstart', function () {
            __lastTouchAt = Date.now();
        }, { passive: true });
    }

    document.addEventListener('click', function (e) {
        const panel = $id('nodeInfoPanel');

        // 既にパネルが hidden なら無視
        if (!panel || panel.classList.contains('hidden')) return;

        // パネルをクリックした場合 → 閉じない
        if (panel.contains(e.target)) return;

        // ノードクリック直後の document click は無視（Canvasのクリックとdocument.clickが同時発火するため）
        // タッチ操作の場合は遅延が大きめなので余裕を持たせる
        const now = Date.now();
        if ((__lastNodeClickAt && (now - __lastNodeClickAt) < 500) ||
            (__lastTouchAt && (now - __lastTouchAt) < 700)) {
            return;
        }
        // その他の場所をクリック → 閉じる
        NODEINFPNL_HideNodeInfo();
    });

    // Force-Graphはノードオブジェクトを直接コールバックへ渡すため、
    // 描画ライブラリ内部のDataSet/bodyへアクセスせずに処理する。
    ADAPTNET_AddInteractionListener('nodeClick', (node) => {
        try {
            if (!node) return;
            const nodeId = node.id;
            const clickMode = NODEINFPNL_GetClickMode();
            console.log('[NETWORK] node clicked', nodeId, node, 'clickMode=', clickMode);

            // ノードクリック時刻を記録（document.click 側の誤閉じ防止）
            __lastNodeClickAt = Date.now();

            if (clickMode === 'select') {
                try {
                    console.log('[click] Selecting node:', node.label);
                    NODEINFPNL_ShowNodeInfo(node);
                } catch (e) {
                    console.warn('[NETWORK] select failed:', e);
                }
            } else if (clickMode === 'nodeFocus') {
                const up = dom.focusUp ? Number(dom.focusUp.value) : 1;
                const down = dom.focusDown ? Number(dom.focusDown.value) : 1;
                onNodeFocus(node.id, up, down);
            } else {
                // link モード: released フラグを確認 (存在しなければ 0 扱い)
                const releasedFlag = Number(node.released) === 1 ? 1 : 0;
                if (releasedFlag !== 1) {
                    console.log('[NETWORK] node is not released, blocking link open:', nodeId);
                    NODEINFPNL_ShowNodeInfo(node);
                    return;
                }
                if (node.url) {
                    window.open(node.url, '_blank');
                } else {
                    console.warn('[NETWORK] node has no URL:', node);
                }
            }
        } catch (e) {
            console.error('[NETWORK] click handler error:', e);
        }
    });

    const hidePanel = () => {
        console.log('[NETWORK] background/link clicked - hiding panel');
        NODEINFPNL_HideNodeInfo();
    };
    ADAPTNET_AddInteractionListener('backgroundClick', hidePanel);
    ADAPTNET_AddInteractionListener('linkClick', hidePanel);
}
