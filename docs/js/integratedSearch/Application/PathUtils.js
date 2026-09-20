import { parsePath, getVisibleEdges } from '../../common/siteHierarchy/Hierarchy.mjs';
export function getFirstPath(node) {
    if (!node) return '';
    if (Array.isArray(node.mainPath) && node.mainPath.length > 0) return node.mainPath[0];
    if (typeof node.mainPath === 'string') return node.mainPath;
    return '';
}

export function parsePathIds(pathStr) {
    return parsePath(pathStr);
}

export function ensureLevelsFromPaths(nodes) {
    let maxAvailableLevel = 0;
    if (!Array.isArray(nodes)) return maxAvailableLevel;

    for (const node of nodes) {
        if (!node) continue;
        const paths = Array.isArray(node.mainPath)
            ? node.mainPath
            : (typeof node.mainPath === 'string' ? [node.mainPath] : []);
        if (paths.length === 0) continue;

        const depths = paths
            .map(path => String(path).split(':').length - 1)
            .filter(n => Number.isFinite(n));
        if (depths.length === 0) continue;

        node.level = Math.min(...depths);
        maxAvailableLevel = Math.max(maxAvailableLevel, node.level);
    }

    return maxAvailableLevel;
}

export function buildEdgesFromPaths(filteredNodes) {
    // Keep the existing main-only vis-network demo.
    return getVisibleEdges(filteredNodes, ['main_path']).map(({ from, to }) => ({ from, to }));
}

export function getAuxPaths(node, mainPath) {
    if (!node || !node.auxPath) return [];
    const auxPaths = Array.isArray(node.auxPath) ? node.auxPath : [node.auxPath];
    return auxPaths.filter(path => path && path !== mainPath);
}
