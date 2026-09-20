export function pushSearchFragment(fragment) {
    try {
        const newUrl = location.pathname + '#' + fragment;
        history.pushState(null, '', newUrl);
    } catch (e) {
        location.hash = fragment;
    }
}

export function clearSearchFragment() {
    try {
        history.pushState(null, '', location.pathname);
    } catch (e) {
        location.hash = '';
    }
}

export function getCurrentHash() {
    return location.hash || '';
}

export function onHashChange(handler) {
    window.addEventListener('hashchange', handler);
}

export function onPopState(handler) {
    window.addEventListener('popstate', handler);
}
