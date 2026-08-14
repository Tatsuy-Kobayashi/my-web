// ----------------------------------------------------------------------------
// ファイル名      : PageSearcher.js
// モジュール記号  : SEARCHPAGE / SearchPage
// モジュール名    : ページ内検索 (SW305-APP-SEARCHPAGE) Source File
// 内容            : ページ内検索ロジックを実装
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { DOMWRITER_QuerySelector, DOMWRITER_CreateElement } from '../Middleware/DomWriter.js';
import { ADAPTNET_GetNetwork, ADAPTNET_RefreshNetworkColors } from '../Middleware/NetworkAdapter.js';

// ------------------------
// ページ内検索ハイライト管理
// ------------------------
let SearchPage_HighlightTimer = null;   // ハイライトタイマー
let SearchPage_HighlightNodeId = null;  // ハイライトノードID
let SearchPage_DragListener = null;     // ドラッグリスナー
let SearchPage_ClickListener = null;    // クリックリスナー

/**
 * 名称     : デフォルト色への更新
 * 内容     : ページ内検索で、デフォルトのノード色を使用するようにする
 * @param {Object[]} rankingData - ランキングデータ (末端でコールされるノードサイズ計算で使用される)
 * @returns {void}
 */
function SearchPage_RefreshColors2Def(rankingData) {
    const defaultRadio = DOMWRITER_QuerySelector('input[name="colorMode"][value="default-color"]');
    if (defaultRadio && !defaultRadio.checked) {
        defaultRadio.checked = true;
        ADAPTNET_RefreshNetworkColors('default-color', rankingData);
    }
}

/**
 * 名称     : ページ内検索ハイライト解除
 * 内容     : 赤色ハイライトを解除し、デフォルト色に戻す
 * @returns {void}
 */
export function SEARCHPAGE_ClearPageSearchHighlight() {
    if (SearchPage_HighlightTimer) {
        clearTimeout(SearchPage_HighlightTimer);
        SearchPage_HighlightTimer = null;
    }
    const network = ADAPTNET_GetNetwork();
    if (SearchPage_HighlightNodeId !== null && network && network.body && network.body.data && network.body.data.nodes) {
        try {
            const existing = network.body.data.nodes.get(SearchPage_HighlightNodeId);
            if (existing) {
                network.body.data.nodes.update({
                    id: SearchPage_HighlightNodeId,
                    color: { background: '#97C2FC', border: '#2B7CE9', highlight: { background: '#D2E5FF', border: '#2B7CE9' } }
                });
            }
        } catch (e) {
            console.warn('[PAGE_SEARCH] clearHighlight failed:', e);
        }
    }
    // イベントリスナー解除
    if (SearchPage_ClickListener && network) {
        network.off('click', SearchPage_ClickListener);
        SearchPage_ClickListener = null;
    }
    if (SearchPage_DragListener && network) {
        network.off('dragStart', SearchPage_DragListener);
        SearchPage_DragListener = null;
    }
    SearchPage_HighlightNodeId = null;
    console.log('[PAGE_SEARCH] highlight cleared');
}

/**
 * 名称     : ページ内検索実行
 * 内容     : 完全一致でノードを検索し、ヒット時は赤色ハイライト+フォーカス
 * @param {string} label - 検索文字列
 * @param {Object[]} nodesData - ノードデータ
 * @param {Object[]} rankingData - ランキングデータ (末端でコールされるノードサイズ計算で使用される)
 * @returns {void}
 */
export function SEARCHPAGE_PerformPageSearch(label, nodesData, rankingData) {
    console.log('[PAGE_SEARCH] performPageSearch start, label=', label);

    // 既存ハイライトをクリア
    SEARCHPAGE_ClearPageSearchHighlight();

    if (!label || label.trim() === '') return;
    const trimmed = label.trim();

    // 完全一致検索
    const target = nodesData.find(n => n.label === trimmed);
    if (!target) {
        console.log('[PAGE_SEARCH] no exact match found for:', trimmed);
        return;
    }

    const nodeId = target.id;
    const network = ADAPTNET_GetNetwork();

    // 現在表示中のネットワークに存在するか確認
    if (!network || !network.body || !network.body.data || !network.body.data.nodes) return;

    const visNode = network.body.data.nodes.get(nodeId);
    if (!visNode) {
        console.log('[PAGE_SEARCH] node not in current network:', nodeId);
        return;
    }

    // カラーモードをデフォルトに変更
    SearchPage_RefreshColors2Def(rankingData);

    // ヒットノードを赤色に変更
    network.body.data.nodes.update({
        id: nodeId,
        color: { background: '#FF0000', border: '#CC0000', highlight: { background: '#FF3333', border: '#CC0000' } }
    });
    SearchPage_HighlightNodeId = nodeId;

    // フォーカス
    network.focus(nodeId, { scale: 1.2, animation: { duration: 500 } });

    // 10秒後に自動リセット
    SearchPage_HighlightTimer = setTimeout(() => {
        SEARCHPAGE_ClearPageSearchHighlight();
    }, 10000);

    // ユーザ操作でリセット
    SearchPage_ClickListener = function () { SEARCHPAGE_ClearPageSearchHighlight(); };
    SearchPage_DragListener = function () { SEARCHPAGE_ClearPageSearchHighlight(); };
    network.on('click', SearchPage_ClickListener);
    network.on('dragStart', SearchPage_DragListener);

    console.log('[PAGE_SEARCH] highlighted node:', nodeId);
}

/**
 * 名称     : 現在表示中のノードからラベル部分一致候補を返す
 * 内容     : 現在表示中のノードから、指定されたラベルに部分一致するノードの候補を返す
 * @param {string} label - 検索文字列
 * @returns {Object[]} ノード候補データ
 */
// 備考     : 最大10件まで返す
export function SEARCHPAGE_SuggestVisibleNodesByLabel(label) {
    if (!label || label.trim() === '') return [];
    const network = ADAPTNET_GetNetwork();
    if (!network || !network.body || !network.body.data || !network.body.data.nodes) return [];

    const trimmed = label.trim().toLowerCase();
    const visibleNodes = network.body.data.nodes.get(); // 表示中のノード配列
    return visibleNodes.filter(n => n.label && n.label.toLowerCase().includes(trimmed)).slice(0, 10); // 最大10件
}

/**
 * 名称     : ページ内検索イベント設定
 * 内容     : ページ内検索に関連するイベントを設定する
 * @param {Object} dom - DOM要素
 * @param {Function} searchCallback - 検索コールバック関数
 * @returns {void}
 */
export function SEARCHPAGE_BindPageSearchEvents(dom, searchCallback) {
    // ページ内検索ボタン
    dom.pageSearchBtn.addEventListener('click', () => {
        console.log('[UI] page search clicked');
        const label = String(dom.pageSearchInput.value);
        dom.pageSearchSuggestions.style.display = 'none';
        searchCallback(label);
    });

    // ページ内検索 Enter キー
    dom.pageSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const label = dom.pageSearchInput.value;
            dom.pageSearchSuggestions.style.display = 'none';
            searchCallback(label);
        }
    });

    // ページ内検索 サジェスト表示（表示中ノードのみから候補を列挙）
    dom.pageSearchInput.addEventListener('input', () => {
        const label = dom.pageSearchInput.value;
        const suggestions = SEARCHPAGE_SuggestVisibleNodesByLabel(label);

        if (suggestions.length === 0) {
            dom.pageSearchSuggestions.style.display = 'none';
            return;
        }

        // サジェスト一覧をクリア
        dom.pageSearchSuggestions.innerHTML = '';
        console.log('[UI] page search suggestions are cleared');

        // 候補を追加
        for (const node of suggestions) {
            const li = DOMWRITER_CreateElement('li');
            li.textContent = node.label;
            li.style.cssText = 'padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #eee;';
            li.addEventListener('mouseover', () => { li.style.backgroundColor = '#f0f0f0'; });
            li.addEventListener('mouseout', () => { li.style.backgroundColor = ''; });
            li.addEventListener('click', () => {
                dom.pageSearchInput.value = node.label;
                dom.pageSearchSuggestions.style.display = 'none';
                searchCallback(node.label);
            });
            dom.pageSearchSuggestions.appendChild(li);
        }
        dom.pageSearchSuggestions.style.display = 'block';
    });

    // 外クリックでページ内検索サジェスト非表示
    document.addEventListener('click', (e) => {
        if (!dom.pageSearchInput.contains(e.target) && !dom.pageSearchSuggestions.contains(e.target)) {
            dom.pageSearchSuggestions.style.display = 'none';
        }
    });
}
