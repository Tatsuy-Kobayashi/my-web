import { fetchAllSearchData } from '../Communication/SearchDataFetcher.js';
import { initializeIntegratedSearch } from '../Application/IntegSearchCtrl.js';
import { getDebugState, setState, STATE } from '../Middleware/SearchState.js';

export async function initIntegratedSearch() {
    setState(STATE.DOM_LOADING);

    try {
        const data = await fetchAllSearchData();
        initializeIntegratedSearch(data);
    } catch (error) {
        console.error('[MAIN] unexpected error:', error);
        setState(STATE.ERROR);
    }
}

document.addEventListener('DOMContentLoaded', initIntegratedSearch);

window.__SiteGraph = Object.assign({}, getDebugState(), {
    reinitNetwork: initIntegratedSearch
});
