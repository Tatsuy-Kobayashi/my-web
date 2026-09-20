function buildSearchText(item) {
    const sectionsText = Array.isArray(item.sections)
        ? item.sections.map(section => `${section.h2 || ''} ${section.text || ''}`).join(' ')
        : '';
    return `${item.label || ''} ${item.labelEn || ''} ${sectionsText}`.toLowerCase();
}

function regexMatches(regex, text) {
    regex.lastIndex = 0;
    return regex.test(text);
}

export function performPlainTextSearch(searchQuery, source) {
    const results = [];
    const queryLower = String(searchQuery || '').toLowerCase();
    if (!queryLower) return results;

    for (const item of Array.isArray(source) ? source : []) {
        if (buildSearchText(item).includes(queryLower)) {
            results.push(item);
        }
    }

    return results;
}

export function performLogicalOperatorsSearch(parsedQuery, source) {
    const results = [];

    for (const item of Array.isArray(source) ? source : []) {
        if (evaluateLogicalExpression(item, parsedQuery)) {
            results.push(item);
        }
    }

    return results;
}

export function evaluateLogicalExpression(item, expression) {
    if (!expression || !expression.operands || expression.operands.length === 0) {
        return false;
    }

    const itemText = buildSearchText(item);
    const matches = expression.operands.map(operand => {
        if (operand.type === 'term') {
            return itemText.includes(String(operand.value || '').toLowerCase());
        }
        return false;
    });

    let result = matches[0];
    for (let i = 0; i < expression.operators.length; i++) {
        const op = expression.operators[i];
        const nextMatch = matches[i + 1];

        if (op === 'and') result = result && nextMatch;
        else if (op === 'or') result = result || nextMatch;
    }

    if (expression.operators.length > 0 && expression.operators[0] === 'not') {
        result = !result;
    }

    return Boolean(result);
}

export function performRegexSearch(regexInfo, source) {
    const regex = new RegExp(regexInfo.pattern, regexInfo.flags);
    const results = [];

    for (const item of Array.isArray(source) ? source : []) {
        const label = item.label || '';
        const labelEn = item.labelEn || '';
        let matches = regexMatches(regex, label) || regexMatches(regex, labelEn);

        if (!matches && Array.isArray(item.sections)) {
            for (const section of item.sections) {
                const sectionText = (section.h2 || '') + ' ' + (section.text || '');
                if (regexMatches(regex, sectionText)) {
                    matches = true;
                    break;
                }
            }
        }

        if (matches) results.push(item);
    }

    return results;
}

export function performTagSearch(tag, source) {
    const results = [];
    const target = String(tag || '').trim();

    for (const item of Array.isArray(source) ? source : []) {
        const keywords = Array.isArray(item.keywords) ? item.keywords : [item.keywords];
        if (keywords.some(keyword => String(keyword || '').trim() === target)) {
            results.push(item);
        }
    }

    return results;
}

export function performIconSearch(iconClass, source) {
    const results = [];
    const target = String(iconClass || '').trim();

    for (const item of Array.isArray(source) ? source : []) {
        const icons = Array.isArray(item.iconClass) ? item.iconClass : [item.iconClass];
        if (icons.some(icon => String(icon || '').trim() === target)) {
            results.push(item);
        }
    }

    return results;
}
