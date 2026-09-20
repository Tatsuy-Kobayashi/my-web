// Pure hierarchy contract shared by the browser modules and Node generators.
export const HIERARCHY_SCHEMA_VERSION = 1;
export const RANKING_ALGORITHM_VERSION = 3;
const MAIN = 'main_path';
const AUX = 'aux_path';
const caches = new WeakMap();
const metadata = new WeakMap();
const validId = value => Number.isSafeInteger(value) && value >= 0;
function fail(id, field, reason) {
    throw new Error(`[siteHierarchy] id=${id}, ${field}: ${reason}`);
}

/**
 * 名称     : パス解析
 * 内容     : パスの正当性を検証する
 * @param {string} path - パス
 * @param {Set<number>} knownIds - 既知のIDのセット
 * @returns {Promise<void>}
 */
export function parsePath(path, knownIds) {
    if (typeof path !== 'string' || !/^(0|[1-9]\d*)(:(0|[1-9]\d*))*$/.test(path)) {
        fail('?', 'path', `invalid path ${JSON.stringify(path)}`);
    }
    const ids = path.split(':').map(Number);
    if (ids.some(id => !validId(id) || (knownIds && !knownIds.has(id)))) fail('?', 'path', 'unknown or unsafe ID');
    return ids;
}

/*
 * 名称     : 階層生成
 * 内容     : 階層を生成する
 */
export function compileHierarchy(source, { sourceHash = '', allowDerived = false } = {}) {
    if (!Array.isArray(source) || source.length === 0) fail('?', 'nodes', 'non-empty array required');
    const byId = new Map();
    const warnings = [];
    for (const node of source) {
        if (!node || !validId(node.id)) fail(node?.id, 'id', 'non-negative safe integer required');
        if (byId.has(node.id)) fail(node.id, 'id', 'duplicate');
        if (!allowDerived && ['mainPath', 'auxPath', 'auxPathOrder', 'level'].some(key => key in node)) {
            fail(node.id, 'paths', 'paths are generated; edit primaryParentId / auxParents');
        }
        byId.set(node.id, node);
    }
    if (!byId.has(0)) fail(0, 'root', 'root 0 is required');
    const edges = [];
    for (const node of source) {
        const { id, primaryParentId, primaryOrder, auxParents } = node;
        if (!validId(primaryOrder)) fail(id, 'primaryOrder', 'non-negative safe integer required');
        if (!Array.isArray(auxParents)) fail(id, 'auxParents', 'array required');
        if (id === 0) {
            if (primaryParentId !== null || primaryOrder !== 0 || auxParents.length) fail(id, 'root', 'root cannot have parents');
        } else {
            if (!validId(primaryParentId) || !byId.has(primaryParentId) || id === primaryParentId) fail(id, 'primaryParentId', 'existing distinct parent required');
            edges.push({ from: primaryParentId, to: id, type: MAIN, order: primaryOrder });
        }
        const parents = new Set([primaryParentId]);
        auxParents.forEach((parent, index) => {
            const field = `auxParents[${index}]`;
            if (!parent || !validId(parent.parentId) || !byId.has(parent.parentId) || parent.parentId === id) fail(id, field, 'existing distinct parent required');
            if (parents.has(parent.parentId)) fail(id, field, 'duplicate primary or auxiliary parent');
            if (!validId(parent.order)) fail(id, `${field}.order`, 'non-negative safe integer required');
            parents.add(parent.parentId);
            edges.push({ from: parent.parentId, to: id, type: AUX, order: parent.order });
        });
    }
    const children = new Map(source.map(n => [n.id, []]));
    for (const edge of edges) children.get(edge.from).push(edge);
    const color = new Map();
    function visit(id) {
        if (color.get(id) === 1) fail(id, 'parents', 'cycle in primary/auxiliary hierarchy');
        if (color.get(id) === 2) return;
        color.set(id, 1);
        for (const edge of children.get(id)) visit(edge.to);
        color.set(id, 2);
    }
    for (const node of source) visit(node.id);
    for (const [id, entries] of children) {
        const orders = new Set();
        for (const entry of entries) {
            if (orders.has(entry.order)) warnings.push({ id, field: 'order', reason: `duplicate sibling order ${entry.order}; primary first, then node ID` });
            orders.add(entry.order);
        }
    }
    const paths = new Map([[0, [0]]]);
    function mainPath(id) {
        if (!paths.has(id)) paths.set(id, [...mainPath(byId.get(id).primaryParentId), id]);
        return paths.get(id);
    }
    const nodes = source.map(node => ({
        id: node.id,
        mainPath: [mainPath(node.id).join(':')],
        auxPath: node.auxParents.map(parent => [...mainPath(parent.parentId), node.id].join(':')),
        level: mainPath(node.id).length - 1
    }));
    return { schemaVersion: HIERARCHY_SCHEMA_VERSION, sourceHash, rootId: 0, nodes, edges, warnings };
}

export function attachHierarchy(source, hierarchy, sourceHash) {
    if (!hierarchy || hierarchy.schemaVersion !== HIERARCHY_SCHEMA_VERSION || hierarchy.sourceHash !== sourceHash) {
        fail('?', 'sourceHash/schemaVersion', 'siteData and siteHierarchy versions differ');
    }
    const expected = compileHierarchy(source, { sourceHash });
    for (const key of ['rootId', 'nodes', 'edges', 'warnings']) {
        if (JSON.stringify(hierarchy[key]) !== JSON.stringify(expected[key])) fail('?', key, 'generated hierarchy is stale or invalid');
    }
    const derived = new Map(hierarchy.nodes.map(node => [node.id, node]));
    const nodes = source.map(node => ({ ...node, ...derived.get(node.id) }));
    metadata.set(nodes, { sourceHash, schemaVersion: hierarchy.schemaVersion });
    return nodes;
}

// Browser compatibility checks for a hash-verified publication. Full compilation stays offline.
export function attachPublishedHierarchy(source, hierarchy, manifest) {
    if (manifest?.contractVersion !== 1 || hierarchy?.schemaVersion !== HIERARCHY_SCHEMA_VERSION || hierarchy.sourceHash !== manifest.outputs?.['siteData.json']) fail('?', 'publication', 'unsupported or mixed data');
    if (!Array.isArray(source) || !source.length || !Array.isArray(hierarchy.nodes) || hierarchy.nodes.length !== source.length) fail('?', 'publication', 'invalid node arrays');
    const byId = new Map(hierarchy.nodes.map(n => [n?.id,n]));
    if (byId.size !== source.length || new Set(source.map(n=>n?.id)).size !== source.length) fail('?', 'publication', 'duplicate IDs');
    const nodes=source.map(n=>{
        const h=byId.get(n?.id);
        if (!validId(n?.id) || !h || !Array.isArray(n.auxParents) || !Array.isArray(h.mainPath) || h.mainPath.length!==1 || !Array.isArray(h.auxPath) || !validId(h.level)) fail(n?.id,'publication','invalid node shape');
        return {...n,...h};
    });
    metadata.set(nodes,{sourceHash:hierarchy.sourceHash,schemaVersion:hierarchy.schemaVersion,outputs:manifest.outputs});
    return nodes;
}
export function assertLoadedNodes(nodes) {
    if (!Array.isArray(nodes) || !nodes.length || !metadata.has(nodes)) fail('?','nodes','load a validated publication first');
}

export function validateRuntimeNodes(nodes) {
    const compiled = compileHierarchy(nodes, { allowDerived: true });
    compiled.nodes.forEach((expected, index) => {
        const actual = nodes[index];
        for (const key of ['mainPath', 'auxPath', 'level']) {
            if (JSON.stringify(actual[key]) !== JSON.stringify(expected[key])) fail(actual.id, key, 'does not match its declared parents');
        }
    });
    return compiled;
}

export function hierarchyMetadata(nodes) { return metadata.get(nodes); }

export function assertRankingVersion(ranking, nodes) {
    const info = hierarchyMetadata(nodes);
    if (!info || ranking?.hierarchySchemaVersion !== info.schemaVersion || ranking?.hierarchySourceHash !== info.sourceHash || ranking?.rankingAlgorithmVersion !== RANKING_ALGORITHM_VERSION) {
        fail('?', 'ranking', 'ranking and hierarchy versions differ');
    }
    const ids = new Set(nodes.map(node => node.id));
    if (!Array.isArray(ranking.scores) || ranking.scores.length !== ids.size || new Set(ranking.scores.map(s => s.id)).size !== ids.size || ranking.scores.some(s => !ids.has(s.id))) fail('?', 'ranking.scores', 'node IDs do not match');
}

// Works for a visible subset as well as a complete dataset. No path expansion.
export function directEdges(nodes, kinds = [MAIN, AUX]) {
    const edges = [];
    for (const node of nodes) {
        if (kinds.includes(MAIN) && node.primaryParentId !== null) edges.push({ from: node.primaryParentId, to: node.id, type: MAIN, order: node.primaryOrder });
        if (kinds.includes(AUX)) for (const parent of node.auxParents) edges.push({ from: parent.parentId, to: node.id, type: AUX, order: parent.order });
    }
    return edges;
}
export function getVisibleEdges(nodes, kinds) {
    const visible = new Set(nodes.map(node => node.id));
    return directEdges(nodes, kinds).filter(edge => visible.has(edge.from) && visible.has(edge.to));
}
export function createHierarchyIndex(nodes) {
    if (caches.has(nodes)) return caches.get(nodes);
    const byId = new Map(nodes.map(node => [node.id, node]));
    const children = new Map(), parents = new Map();
    for (const edge of directEdges(nodes)) {
        if (!byId.has(edge.from) || !byId.has(edge.to)) fail(edge.to, 'parents', 'unknown parent');
        if (!children.has(edge.from)) children.set(edge.from, []);
        if (!parents.has(edge.to)) parents.set(edge.to, []);
        children.get(edge.from).push(edge);
        parents.get(edge.to).push(edge);
    }
    for (const entries of children.values()) entries.sort((a, b) => a.order - b.order || (a.type === MAIN ? 0 : 1) - (b.type === MAIN ? 0 : 1) || a.to - b.to);
    const index = {
        byId,
        getChildren: (id, kinds = [MAIN, AUX]) => (children.get(id) || []).filter(edge => kinds.includes(edge.type)).map(edge => ({ ...edge, node: byId.get(edge.to) })),
        getParents: (id, kinds = [MAIN, AUX]) => (parents.get(id) || []).filter(edge => kinds.includes(edge.type)).map(edge => ({ ...edge })),
        getBreadcrumbs: id => { const n = byId.get(id); return n ? [...n.mainPath, ...n.auxPath].map(p => parsePath(p, byId)) : []; }
    };
    caches.set(nodes, index);
    return index;
}
