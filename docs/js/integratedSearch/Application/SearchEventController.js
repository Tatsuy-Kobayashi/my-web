import { getCurrentHash, onHashChange, onPopState, pushSearchFragment } from '../Communication/SearchUrlState.js';
import { generateSearchFragment, parseSearchFragment } from '../Middleware/HtmlHelper.js';
import { getById, setDisplay } from '../Middleware/DomWriter.js';
import { applyIntentRanking } from './IntentRanker.js';
import { getSelectedIntentName } from './IntentSelectRenderer.js';
import { determineInputType, SEARCH_INPUT_TYPES } from './QueryParser.js';
import {
    evaluateLogicalExpression,
    performIconSearch,
    performLogicalOperatorsSearch,
    performPlainTextSearch,
    performRegexSearch,
    performTagSearch
} from './SearchExecutor.js';
import { displaySearchResults, returnToSearchScreen } from './SearchResultRenderer.js';
import { hideSearchSuggestions, renderSearchSuggestions, suggestNodesByLabel } from './SearchSuggestionRenderer.js';

export function bindSearchEvents(context) {
    const substringInput = getById('labelSubstringSearchInput', { warn: false });
    const substringBtn = getById('labelSubstringSearchBtn', { warn: false });
    const suggestionsContainer = getById('labelSubstringSearchSuggestions', { warn: false });

    if (!substringInput || !substringBtn) {
        console.warn('[UI] Substring search input or button element not found');
        return;
    }

    if (substringBtn.dataset.searchBound !== 'true') {
        substringBtn.dataset.searchBound = 'true';
        substringBtn.addEventListener('click', () => handleSearchInput(context));
    }

    if (substringInput.dataset.searchBound !== 'true') {
        substringInput.dataset.searchBound = 'true';
        substringInput.addEventListener('keypress', event => {
            if (event.key === 'Enter') handleSearchInput(context);
        });

        substringInput.addEventListener('input', () => {
            const suggestions = suggestNodesByLabel(substringInput.value, context.data.searchSource);
            renderSearchSuggestions(suggestions, {
                input: substringInput,
                container: suggestionsContainer,
                siteData: context.data.siteData
            });
        });
    }

    if (suggestionsContainer && suggestionsContainer.dataset.outsideClickBound !== 'true') {
        suggestionsContainer.dataset.outsideClickBound = 'true';
        document.addEventListener('click', event => {
            if (!substringInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
                hideSearchSuggestions(suggestionsContainer);
            }
        });
    }
}

export function bindHistoryEvents(context) {
    if (window.__IntegratedSearchHistoryBound) return;
    window.__IntegratedSearchHistoryBound = true;

    onHashChange(() => {
        try {
            bootstrapSearchFromHash(context);
        } catch (e) {
            console.error('[HASH] bootstrap failed:', e);
        }
    });

    onPopState(() => {
        if (!location.hash) {
            returnToSearchScreen();
        } else {
            bootstrapSearchFromHash(context);
        }
    });
}

export function handleSearchInput(context) {
    const inputElement = getById('labelSubstringSearchInput');
    if (!inputElement) return false;

    const analysis = determineInputType(inputElement.value);
    if (!analysis.isValid) {
        alert('入力エラー: ' + analysis.error);
        return false;
    }

    const queryInfo = {
        type: analysis.type,
        original: analysis.original,
        normalized: analysis.normalized,
        intent: getSelectedIntentName()
    };
    const results = executeSearchByAnalysis(analysis, context.data.searchSource);
    showSearchResultsWithFragment(results, queryInfo, context);
    return true;
}

export function handleTagSearch(tag, context) {
    const queryInfo = {
        type: 'tag',
        original: tag,
        normalized: tag,
        intent: getSelectedIntentName()
    };
    showSearchResultsWithFragment(performTagSearch(tag, context.data.searchSource), queryInfo, context);
}

export function handleIconSearch(iconClass, context) {
    const queryInfo = {
        type: 'icon',
        original: iconClass,
        normalized: iconClass,
        intent: getSelectedIntentName()
    };
    showSearchResultsWithFragment(performIconSearch(iconClass, context.data.searchSource), queryInfo, context);
}

export function showSearchResultsWithFragment(results, queryInfo, context) {
    const ranked = applyIntentRanking(results, queryInfo, context.data);
    const fragment = generateSearchFragment(queryInfo, getSelectedIntentName());
    pushSearchFragment(fragment);

    setDisplay('contentIntegSearch', 'none');
    setDisplay('contentIntegSearchResult', 'block');
    displaySearchResults(ranked, Object.assign({}, queryInfo, { fragment }), context.data.siteData);
}

export function bootstrapSearchFromHash(context) {
    const hash = getCurrentHash();
    if (!hash) return false;

    const params = parseSearchFragment(hash);
    if (!params || !params.q) return false;

    const q = decodeURIComponent(params.q || '');
    const searchType = params.type ? decodeURIComponent(params.type) : '';
    const intent = params.intent ? decodeURIComponent(params.intent) : getSelectedIntentName();
    const intentSelect = getById('queryIntentSelect', { warn: false });
    if (intentSelect && intent) intentSelect.value = intent;

    let results = [];
    let normalized = q;
    let effectiveType = searchType;

    if (searchType === 'tag') {
        results = performTagSearch(q, context.data.searchSource);
    } else if (searchType === 'icon') {
        results = performIconSearch(q, context.data.searchSource);
    } else {
        const analysis = determineInputType(q);
        if (!analysis.isValid) {
            console.warn('[BOOTSTRAP] invalid query in fragment:', analysis.error);
            return false;
        }
        normalized = analysis.normalized;
        effectiveType = analysis.type;
        results = executeSearchByAnalysis(analysis, context.data.searchSource);
    }

    setDisplay('contentIntegSearch', 'none');
    setDisplay('contentIntegSearchResult', 'block');

    const queryInfo = {
        original: q,
        type: effectiveType,
        normalized,
        intent,
        fragment: params.raw
    };
    const ranked = applyIntentRanking(results, queryInfo, context.data);
    displaySearchResults(ranked, queryInfo, context.data.siteData);
    return true;
}

function executeSearchByAnalysis(analysis, source) {
    switch (analysis.type) {
        case SEARCH_INPUT_TYPES.PLAIN_TEXT:
            return performPlainTextSearch(analysis.normalized, source);
        case SEARCH_INPUT_TYPES.LOGICAL_OPERATORS:
            return performLogicalOperatorsSearch(analysis.normalized, source);
        case SEARCH_INPUT_TYPES.REGEX:
            return performRegexSearch(analysis.normalized, source);
        default:
            return [];
    }
}

export function restoreLogicalExpressionSearch(parsedQuery, source) {
    return (Array.isArray(source) ? source : []).filter(item => evaluateLogicalExpression(item, parsedQuery));
}
