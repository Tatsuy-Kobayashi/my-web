export function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, s => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[s]));
}

export function djb2Hash(str) {
    let h = 5381;
    const text = String(str == null ? '' : str);
    for (let i = 0; i < text.length; i++) {
        h = ((h << 5) + h) + text.charCodeAt(i);
        h = h & 0xFFFFFFFF;
    }
    return (h >>> 0).toString(16);
}

export function ensureArray(data) {
    if (Array.isArray(data)) return data;
    if (data == null) return [];
    if (typeof data === 'object') {
        try {
            return Object.values(data);
        } catch (e) {
            return [];
        }
    }
    return [data];
}

export function generateSearchFragment(queryInfo, selectedIntentName = 'definition_lookup') {
    const base = typeof queryInfo === 'string'
        ? queryInfo
        : (queryInfo && (queryInfo.original || queryInfo.query)) || '';
    const type = queryInfo && queryInfo.type ? queryInfo.type : '';
    const normalized = queryInfo && queryInfo.normalized ? queryInfo.normalized : '';
    const intent = queryInfo && queryInfo.intent ? queryInfo.intent : selectedIntentName;
    const payload = String(base) + '|' + type + '|' + JSON.stringify(normalized);
    const hash = djb2Hash(payload);
    const ts = Date.now();

    return 'q=' + encodeURIComponent(String(base)) +
        '&type=' + encodeURIComponent(type) +
        '&intent=' + encodeURIComponent(intent) +
        '&h=' + hash +
        '&ts=' + ts;
}

export function parseSearchFragment(hash) {
    if (!hash) return null;
    const raw = String(hash).replace(/^#/, '');
    const params = {};

    for (const pair of raw.split('&')) {
        const idx = pair.indexOf('=');
        if (idx === -1) continue;
        const key = pair.substring(0, idx);
        const value = pair.substring(idx + 1);
        params[key] = value;
    }

    params.raw = raw;
    return params;
}
