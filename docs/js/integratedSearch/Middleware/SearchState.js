export const STATE = {
    DOM_LOADING: 'DOM_LOADING',
    DATA_INITIALIZATION: 'DATA_INITIALIZATION',
    NETWORK_INITIALIZATION: 'NETWORK_INITIALIZATION',
    HASH_BOOTSTRAP: 'HASH_BOOTSTRAP',
    BOOTSTRAP_SEARCH: 'BOOTSTRAP_SEARCH',
    IDLE: 'IDLE',
    SEARCHING: 'SEARCHING',
    ERROR: 'ERROR'
};

const errorFlags = {
    missingDom: false,
    visNotAvailable: false,
    invalidData: false,
    networkInitFailed: false
};

let currentState = STATE.DOM_LOADING;

export function setState(state) {
    currentState = state;
}

export function getState() {
    return currentState;
}

export function setErrorFlag(key, value = true) {
    if (Object.prototype.hasOwnProperty.call(errorFlags, key)) {
        errorFlags[key] = Boolean(value);
    }
}

export function getErrorFlags() {
    return { ...errorFlags };
}

export function resetErrorFlags() {
    Object.keys(errorFlags).forEach(key => {
        errorFlags[key] = false;
    });
}

export function getDebugState() {
    return {
        STATE,
        getCurrentState: getState,
        getErrorFlags
    };
}
