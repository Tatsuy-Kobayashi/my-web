import { assertLoadedNodes } from '../../common/siteHierarchy/Hierarchy.mjs';
import { requireElements, setDisplay } from '../Middleware/DomWriter.js';
import { setErrorFlag, setState, STATE } from '../Middleware/SearchState.js';
import { ensureLevelsFromPaths } from './PathUtils.js';
import { renderCategorySearchResult } from './CategorySearchRenderer.js';
import { renderTagList } from './TagSearchRenderer.js';
import { renderIconButtonList } from './IconSearchRenderer.js';
import { initializeNetworkGraph, resetNetwork, setNetworkData } from './NetworkGraphRenderer.js';
import { initializeTocToggle } from './TocController.js';
import { renderIntentSelect } from './IntentSelectRenderer.js';
import {
    bindHistoryEvents,
    bindSearchEvents,
    bootstrapSearchFromHash,
    handleIconSearch,
    handleTagSearch
} from './SearchEventController.js';

export function initializeIntegratedSearch(data) {
    const required = requireElements([
        'contentIntegSearch',
        'labelSubstringSearchSuggestions',
        'contentIntegSearchResult'
    ]);
    if (!required) {
        setErrorFlag('missingDom');
        setState(STATE.ERROR);
        return false;
    }

    setState(STATE.DATA_INITIALIZATION);
    setDisplay('contentIntegSearchResult', 'none');
    required.contentIntegSearchResult.innerHTML = '';

    if (!validateData(data.siteData)) return false;

    const context = { data };
    initializeSearchScreen(context);

    setState(STATE.NETWORK_INITIALIZATION);
    if (!initializeNetwork(data.siteData)) return false;

    bindHistoryEvents(context);
    try {
        bootstrapSearchFromHash(context);
    } catch (e) {
        console.error('[MAIN] bootstrapSearchFromHash error:', e);
    }

    setState(STATE.IDLE);
    return true;
}

export function initializeSearchScreen(context) {
    const data = context.data;
    initializeTocToggle();

    const useNode = data.siteData.find(node => node && node.useId === 0) || data.siteData[0];
    if (!useNode) {
        console.warn('Current node not found in siteData.');
        return false;
    }

    const computedMax = ensureLevelsFromPaths(data.siteData);
    renderCategorySearchResult(data.siteData, useNode, computedMax + 1);
    renderTagList(data.searchSource, tag => handleTagSearch(tag, context));
    renderIconButtonList(data.searchSource, icon => handleIconSearch(icon, context));
    renderIntentSelect(data.queryIntents);
    bindSearchEvents(context);
    return true;
}

export function validateData(siteData) {
    setState(STATE.DATA_INITIALIZATION);
    try {
        assertLoadedNodes(siteData);
        return true;
    } catch (error) {
        console.error(error);
        setErrorFlag('invalidData');
        setState(STATE.ERROR);
        return false;
    }
}

function initializeNetwork(siteData) {
    resetNetwork();
    if (!initializeNetworkGraph()) return false;

    // 現行実装に合わせ、初期描画は2層までを表示する。
    const maxInitialLevel = 2;
    const ok = setNetworkData(siteData, 0, maxInitialLevel);
    if (!ok) return false;

    setState(STATE.IDLE);
    return true;
}
