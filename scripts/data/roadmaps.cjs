// Pedagogical maps are independent of ontology relations and ranking edges.
const ORDER_TYPES = new Set(['requires_before', 'recommended_before', 'helpful_before']);
const SYMMETRIC_TYPES = new Set(['alternative_to', 'can_learn_with']);
function validateRoadmaps(data, sites, { publishedOnly = false } = {}) {
    const siteById = new Map(sites.map(site => [site.id, site]));
    const ids = new Set();
    const check = (ok, message) => { if (!ok) throw new Error('Roadmap: ' + message); };
    for (const map of data.roadmaps) {
        check(!ids.has(map.id), 'duplicate map ID ' + map.id); ids.add(map.id);
        check(!publishedOnly || map.status === 'published', 'draft in public data');
        const nodes = new Map(map.nodes.map(n => [n.id, n]));
        check(nodes.size === map.nodes.length, map.id + ': duplicate node');
        const lanes = new Set(map.lanes.map(l => l.id)), stages = new Map(map.stages.map((s, i) => [s.id, i]));
        check(lanes.size === map.lanes.length && stages.size === map.stages.length, map.id + ': duplicate lane/stage');
        const positions = new Set(), articleIds = new Set();
        for (const node of map.nodes) {
            check(lanes.has(node.laneId) && stages.has(node.stageId), node.id + ': unknown lane/stage');
            const position = JSON.stringify([node.laneId, node.stageId]);
            check(!positions.has(position), node.id + ': occupied position'); positions.add(position);
            if (node.siteId !== undefined) {
                check(siteById.has(node.siteId), node.id + ': unknown article');
                check(!articleIds.has(node.siteId), node.id + ': duplicate article'); articleIds.add(node.siteId);
            }
        }
        check(articleIds.size > 0, map.id + ': at least one article required');
        check(map.durationMinutes.min <= map.durationMinutes.max, map.id + ': duration range');
        const edges = new Set(), edgeIds = new Set(), next = new Map(map.nodes.map(n => [n.id, []]));
        for (const edge of map.edges) {
            check(!edgeIds.has(edge.id), map.id + ': duplicate edge ID'); edgeIds.add(edge.id);
            check(nodes.has(edge.from) && nodes.has(edge.to) && edge.from !== edge.to, edge.id + ': unknown/self endpoint');
            if (SYMMETRIC_TYPES.has(edge.type)) check(edge.from < edge.to, edge.id + ': symmetric endpoints must use ID order');
            const key = JSON.stringify([edge.type, edge.from, edge.to]);
            check(!edges.has(key), edge.id + ': duplicate edge'); edges.add(key);
            if (ORDER_TYPES.has(edge.type)) next.get(edge.from).push(edge.to);
        }
        // Only ordering edges form a DAG; parallel/alternative edges do not assert order.
        const state = new Map();
        function visit(id) {
            check(state.get(id) !== 1, map.id + ': ordering cycle');
            if (state.get(id) === 2) return;
            state.set(id, 1); for (const to of next.get(id)) visit(to); state.set(id, 2);
        }
        for (const id of nodes.keys()) visit(id);
        for (const edge of map.edges.filter(e => ORDER_TYPES.has(e.type))) {
            check(stages.get(nodes.get(edge.from).stageId) < stages.get(nodes.get(edge.to).stageId), edge.id + ': ordering must advance stage');
        }
        if (map.status === 'published') {
            const review = map.review;
            check(review?.version === map.version, map.id + ': review must match map version');
            check(review?.expert?.decision === 'approved' && review?.learnerTrial?.decision === 'approved', map.id + ': expert and learner review required');
            check(review.learnerTrial.participants > 0 && review.learnerTrial.completed <= review.learnerTrial.participants, map.id + ': invalid trial counts');
            check(review.learnerTrial.completed >= 0, map.id + ': invalid completion count');
        }
    }
    return data.roadmaps.length;
}
function projectRoadmaps(data) {
    return { schemaVersion: data.schemaVersion, roadmaps: data.roadmaps.filter(map => map.status === 'published') };
}
module.exports = { validateRoadmaps, projectRoadmaps };
