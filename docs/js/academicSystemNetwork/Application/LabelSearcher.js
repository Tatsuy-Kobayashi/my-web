// ----------------------------------------------------------------------------
// ファイル名      : LabelSearcher.js
// モジュール記号  : SEARCHLABEL / SearchLabel
// モジュール名    : ラベル検索 (SW304-APP-SEARCHLABEL) Source File
// 内容            : ラベル検索ロジックを実装
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { PATHUTILS_BuildVisibleEdges } from './PathUtils.js';
import { VISLKMNG_ApplyVisualLock } from './VisualLockManager.js';
import { DOMWRITER_CreateElement, DOMWRITER_QuerySelector } from '../Middleware/DomWriter.js';
import { ADAPTNET_SetNetworkData } from '../Middleware/NetworkAdapter.js';
import { APPSTATE_SetState, APPSTATE_STATE } from '../Middleware/AppState.js';

/**
 * 名称     : ラベルからノード検索
 * 内容     : 指定されたラベルを含むノードを検索する
 * @param {string} label - ラベル名
 * @param {Object[]} nodesData - ノードデータ
 * @returns {Object|undefined} ノードデータ
 */
// 備考     : 複数マッチした場合は最初のものを返す
export function SearchLabel_FindNodeByLabel(label, nodesData) {
    if (!label || label.trim() === '') {
        // 無記入の場合は id: 0 (学問)
        return nodesData.find(n => n.id === 0);
    }
    const trimmed = label.trim().toLowerCase();
    return nodesData.find(n => n.label.toLowerCase().includes(trimmed));
}

/**
 * 名称     : ラベルからノード候補検索
 * 内容     : （全ノードデータから）指定されたラベルを含むノードの候補を検索する
 * @param {string} label - ラベル名
 * @param {Object[]} nodesData - ノードデータ
 * @returns {Object[]} ノード候補データ
 */
// 備考     : 最大10件まで返す
export function SearchLabel_SuggestNodesByLabel(label, nodesData) {
    if (!label || label.trim() === '') {
        return [];
    }
    const trimmed = label.trim().toLowerCase();
    return nodesData.filter(n => n.label.toLowerCase().includes(trimmed)).slice(0, 10); // 最大10件
}

/**
 * 名称     : ラベル検索実行
 * 内容     : 指定されたラベルのノードを検索し、ネットワーク図を更新する
 * @param {string} label - ラベル名
 * @param {Object} dom - DOM要素
 * @param {number} maxAvailableLevel - 最大利用可能レベル
 * @param {Object} edgeLayerState - エッジレイヤー状態
 * @param {Object[]} nodesData - ノードデータ
 * @param {Object[]} keywordEdgesData - キーワードエッジデータ
 * @param {Object[]} conceptsData - コンセプトデータ
 * @param {Object[]} relationsData - リレーションデータ
 * @param {Object[]} relationTypes - リレーションタイプデータ
 * @param {Object[]} rankingData - ランキングデータ
 * @returns {boolean} - 成功: true, 失敗: false
 */
export function SEARCHLABEL_PerformLabelSearch(label, dom, maxAvailableLevel, edgeLayerState, nodesData, keywordEdgesData, conceptsData, relationsData, relationTypes, rankingData) {
    const data = { nodesData, keywordEdgesData, conceptsData, relationsData, relationTypes, rankingData };

    APPSTATE_SetState(APPSTATE_STATE.SEARCHING);
    console.log('[SEARCH] performLabelSearch start, label=', label);

    const target = SearchLabel_FindNodeByLabel(label, nodesData);
    if (!target) {
        alert('指定した学問「' + label + '」が見つかりません');
        APPSTATE_SetState(APPSTATE_STATE.IDLE);
        return false;
    }

    const level = target.level;
    const min = Math.max(0, level - 1);
    let max = level + 1;
    // データの最大深さを超えている場合は clamp
    if (max > maxAvailableLevel) { max = maxAvailableLevel; }

    // 深さを更新（UI に反映）
    dom.minDepth.value = String(min);
    dom.maxDepth.value = String(max);

    // node/edge フィルタ
    const filteredNodes = nodesData.filter(n => (typeof n.level === 'number') && n.level >= min && n.level <= max);
    const filteredEdges = PATHUTILS_BuildVisibleEdges(filteredNodes, edgeLayerState, data);

    // 色モード
    const colorModeEl = DOMWRITER_QuerySelector('input[name="colorMode"]:checked');
    const colorMode = colorModeEl ? colorModeEl.value : 'default-color';

    //描画
    ADAPTNET_SetNetworkData(filteredNodes, filteredEdges, colorMode, rankingData);

    // 見た目ロック（label 検索が適用されている状態を示す）
    VISLKMNG_ApplyVisualLock('id', dom);

    APPSTATE_SetState(APPSTATE_STATE.IDLE);
    console.log('[SEARCH] performLabelSearch done');
    return true;
}

/**
 * 名称     : ラベル検索イベント設定
 * 内容     : ラベル検索に関連するイベントを設定する
 * @param {Object} dom - DOM要素
 * @param {Object[]} nodesData - ノードデータ
 * @param {Function} searchCallback - 検索コールバック関数
 * @returns {void}
 */
export function SEARCHLABEL_BindLabelSearchEvents(dom, nodesData, searchCallback) {
    // label 検索ボタン
    dom.labelSearchBtn.addEventListener('click', () => {
        console.log('[UI] label search clicked');
        const label = String(dom.labelSearchInput.value);
        searchCallback(label);
    });

    // label input でのリアルタイム候補表示
    dom.labelSearchInput.addEventListener('input', () => {
        const label = dom.labelSearchInput.value;
        const suggestions = SearchLabel_SuggestNodesByLabel(label, nodesData);

        if (suggestions.length === 0) {
            dom.labelSearchSuggestions.style.display = 'none';
            return;
        }

        // サジェスト一覧をクリア
        dom.labelSearchSuggestions.innerHTML = '';
        console.log('[UI] label search suggestions are cleared');

        // 候補を追加
        for (const node of suggestions) {
            const li = DOMWRITER_CreateElement('li');
            li.style.cssText = 'padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #eee;';
            li.textContent = node.label;
            li.addEventListener('mouseover', () => { li.style.backgroundColor = '#f0f0f0'; });
            li.addEventListener('mouseout', () => { li.style.backgroundColor = ''; });
            li.addEventListener('click', () => {
                dom.labelSearchInput.value = node.label;
                dom.labelSearchSuggestions.style.display = 'none';
                searchCallback(node.label);
            });
            dom.labelSearchSuggestions.appendChild(li);
        }
        dom.labelSearchSuggestions.style.display = 'block';
    });

    // Enter キーで検索
    dom.labelSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const label = dom.labelSearchInput.value;
            dom.labelSearchSuggestions.style.display = 'none';
            searchCallback(label);
        }
    });

    // 外クリックで候補を非表示（学問検索）
    document.addEventListener('click', (e) => {
        if (!dom.labelSearchInput.contains(e.target) && !dom.labelSearchSuggestions.contains(e.target)) {
            dom.labelSearchSuggestions.style.display = 'none';
        }
    });
}
