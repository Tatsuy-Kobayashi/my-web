export const SEARCH_INPUT_TYPES = {
    PLAIN_TEXT: 'plainText',
    LOGICAL_OPERATORS: 'logicalOps',
    REGEX: 'regex',
    UNKNOWN: 'unknown'
};

export function determineInputType(query) {
    if (!query || typeof query !== 'string') {
        return {
            type: SEARCH_INPUT_TYPES.UNKNOWN,
            original: query,
            normalized: '',
            isValid: false,
            error: '入力が空です'
        };
    }

    const trimmed = query.trim();
    const regexMatch = trimmed.match(/^\/(.*)\/([a-zA-Z]*)$/);

    if (regexMatch) {
        const pattern = regexMatch[1];
        const flags = regexMatch[2] || '';
        try {
            new RegExp(pattern, flags);
            return {
                type: SEARCH_INPUT_TYPES.REGEX,
                original: trimmed,
                normalized: { pattern, flags, regexStr: trimmed },
                isValid: true,
                error: null
            };
        } catch (e) {
            return {
                type: SEARCH_INPUT_TYPES.REGEX,
                original: trimmed,
                normalized: { pattern, flags },
                isValid: false,
                error: '正規表現のパースに失敗しました: ' + e.message
            };
        }
    }

    if (/\b(AND|OR|NOT)\b/i.test(trimmed)) {
        return {
            type: SEARCH_INPUT_TYPES.LOGICAL_OPERATORS,
            original: trimmed,
            normalized: parseLogicalOperators(trimmed),
            isValid: true,
            error: null
        };
    }

    return {
        type: SEARCH_INPUT_TYPES.PLAIN_TEXT,
        original: trimmed,
        normalized: trimmed,
        isValid: true,
        error: null
    };
}

export function parseLogicalOperators(query) {
    const tokens = String(query || '').trim().split(/\s+/).filter(Boolean);
    const result = {
        type: 'expression',
        original: query,
        operands: [],
        operators: []
    };
    let currentTerm = [];

    for (const rawToken of tokens) {
        const token = rawToken.toUpperCase();
        if (token === 'AND' || token === 'OR' || token === 'NOT') {
            if (currentTerm.length > 0) {
                result.operands.push({ type: 'term', value: currentTerm.join(' ') });
                currentTerm = [];
            }
            result.operators.push(token.toLowerCase());
        } else {
            currentTerm.push(rawToken);
        }
    }

    if (currentTerm.length > 0) {
        result.operands.push({ type: 'term', value: currentTerm.join(' ') });
    }

    return result;
}
