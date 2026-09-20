export function getById(id, options = {}) {
    const { warn = true } = options;
    const el = document.getElementById(id);
    if (!el && warn) console.warn(`[WARN] DOM element not found: #${id}`);
    return el;
}

export function query(selector, root = document) {
    return root ? root.querySelector(selector) : null;
}

export function queryAll(selector, root = document) {
    return root ? Array.from(root.querySelectorAll(selector)) : [];
}

export function writeToContainer(elementId, html) {
    const container = getById(elementId);
    if (!container) return false;
    container.innerHTML = html;
    return true;
}

export function setDisplay(elementId, display) {
    const el = getById(elementId, { warn: false });
    if (!el) return false;
    el.style.display = display;
    return true;
}

export function clearContainer(elementId) {
    const el = getById(elementId, { warn: false });
    if (!el) return false;
    el.innerHTML = '';
    return true;
}

export function requireElements(ids) {
    const result = {};
    let ok = true;

    ids.forEach(id => {
        const el = getById(id);
        result[id] = el;
        if (!el) ok = false;
    });

    return ok ? result : null;
}
