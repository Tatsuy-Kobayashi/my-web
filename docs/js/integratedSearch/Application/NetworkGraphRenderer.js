import { getById } from '../Middleware/DomWriter.js';
import { setErrorFlag, setState, STATE } from '../Middleware/SearchState.js';
import { buildEdgesFromPaths } from './PathUtils.js';

let network = null;
let networkInitialized = false;

export function initializeNetworkGraph(visLib = window.vis) {
    const container = getById('network');
    if (!container) {
        setErrorFlag('missingDom');
        setState(STATE.ERROR);
        return false;
    }

    if (networkInitialized) return true;

    if (!visLib || !visLib.Network) {
        console.error('[ERROR] vis-network が読み込まれていません。');
        setErrorFlag('visNotAvailable');
        setState(STATE.ERROR);
        return false;
    }

    try {
        const nodes = new visLib.DataSet([]);
        const edges = new visLib.DataSet([]);
        const options = {
            layout: { hierarchical: false },
            physics: {
                enabled: true,
                solver: 'forceAtlas2Based',
                forceAtlas2Based: {
                    gravitationalConstant: -40,
                    springLength: 60,
                    springConstant: 0.2
                },
                stabilization: { enabled: true, iterations: 200 }
            },
            interaction: { hover: true, zoomView: true },
            edges: { arrows: 'to', smooth: { enabled: false } }
        };

        network = new visLib.Network(container, { nodes, edges }, options);
        networkInitialized = true;
        console.log('[NETWORK] vis.Network 初期化完了');
        return true;
    } catch (e) {
        console.error('[ERROR] network 初期化に失敗しました:', e);
        setErrorFlag('networkInitFailed');
        setState(STATE.ERROR);
        return false;
    }
}

export function setNetworkData(siteData, min = 0, max = 0, visLib = window.vis) {
    if (!initializeNetworkGraph(visLib)) return false;

    const filteredNodes = (Array.isArray(siteData) ? siteData : [])
        .filter(node => typeof node.level === 'number' && node.level >= min && node.level <= max);
    const filteredEdges = buildEdgesFromPaths(filteredNodes);

    try {
        const nodes = new visLib.DataSet(filteredNodes);
        const edges = new visLib.DataSet(filteredEdges);
        network.setData({ nodes, edges });
        console.log('[NETWORK] setData 実行: nodes=', filteredNodes.length, 'edges=', filteredEdges.length);
        return true;
    } catch (e) {
        console.error('[ERROR] setNetworkData 失敗:', e);
        return false;
    }
}

export function isNetworkInitialized() {
    return networkInitialized;
}

export function resetNetwork() {
    network = null;
    networkInitialized = false;
}
