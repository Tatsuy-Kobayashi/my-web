import { escapeHtml } from '../Middleware/HtmlHelper.js';
import { getById, query } from '../Middleware/DomWriter.js';

const DEFAULT_INTENTS = [
    { name: 'definition_lookup', description: '概念の定義や意味を確認するための検索意図。' },
    { name: 'learning_roadmap', description: '学習順序を探す検索意図。' },
    { name: 'related_concepts', description: '関連概念を探す検索意図。' },
    { name: 'application_or_method', description: '応用先を探す検索意図。' },
    { name: 'history_lookup', description: '歴史を探す検索意図。' }
];

const LABELS = {
    definition_lookup: '定義を知りたい',
    learning_roadmap: '学習順序を知りたい',
    related_concepts: '関連概念を知りたい',
    application_or_method: '応用先を知りたい',
    history_lookup: '歴史を知りたい',
    dependency_search: '前提概念を知りたい',
    hierarchy_lookup: '階層を知りたい',
    lexicon_navigation: '用語から探したい'
};

export function renderIntentSelect(intents) {
    if (getById('queryIntentSelect', { warn: false })) return;

    const searchInput = getById('labelSubstringSearchInput', { warn: false });
    const host = searchInput ? searchInput.closest('.control-substringSearch') : query('.control-substringSearch');
    if (!host) return;

    const intentOptions = Array.isArray(intents) && intents.length > 0 ? intents : DEFAULT_INTENTS;
    const wrapper = document.createElement('div');
    wrapper.className = 'control-group control-queryIntent';
    wrapper.style.marginBottom = '12px';
    wrapper.innerHTML = `
        <label class="control-substringSearch-label" for="queryIntentSelect">検索意図</label>
        <select id="queryIntentSelect" title="検索結果の並び替えに使う意図を選択します" style="width: 100%; max-width: 320px; padding: 8px;">
            ${intentOptions.map(intent => {
                const value = intent.name || intent.intentId || '';
                const label = LABELS[value] || intent.description || value;
                return `<option value="${escapeHtml(value)}" title="${escapeHtml(intent.description || '')}">${escapeHtml(label)}</option>`;
            }).join('')}
        </select>
    `;

    host.insertBefore(wrapper, host.firstChild);
}

export function getSelectedIntentName() {
    const select = getById('queryIntentSelect', { warn: false });
    return select && select.value ? select.value : 'definition_lookup';
}
