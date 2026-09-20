const { validateRegistry, validateRelationInstances } = require('./validateRelations.js');
const { readSiteHierarchy } = require('./generateSiteHierarchy.js');
const fs = require('fs');
const path = require('path');
const { createHash } = require('node:crypto');

const DATA_DIR = __dirname;
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

const moduleFiles = {
    siteData: path.join(DATA_DIR, 'siteData.json'),
    hierarchy: path.join(DATA_DIR, 'siteHierarchy.json'),
    concepts: path.join(DATA_DIR, 'concepts.json'),
    relations: path.join(DATA_DIR, 'relations.json'),
    relationTypes: path.join(DATA_DIR, 'relationTypes.json'),
    rankingConfig: path.join(DATA_DIR, 'rankingConfig.json'),
    keywordEdges: path.join(DATA_DIR, 'keywordEdges.json'),
    searchSource: path.join(DATA_DIR, 'searchSource.json'),
    viewStats: path.join(DATA_DIR, 'viewStats.json'),
    output: path.join(DATA_DIR, 'ranking.json')
};

function readJson(filePath, fallback) {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
    const temporary = filePath + '.tmp';
    fs.writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    fs.renameSync(temporary, filePath);
}

function clamp01(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1, value));
}

function normalizeByMax(records, key) {
    const max = Math.max(0, ...records.map(record => Number(record[key]) || 0));
    if (max <= 0) return new Map(records.map(record => [record.id, 0]));
    return new Map(records.map(record => [record.id, (Number(record[key]) || 0) / max]));
}

function dateFreshness(dateValue, evaluationTime) {
    if (!dateValue) return 0;
    const time = Date.parse(dateValue);
    if (!Number.isFinite(time)) return 0;
    const ageDays = Math.max(0, (evaluationTime - time) / 86400000);
    return clamp01(Math.exp(-ageDays / 365));
}

function assertNonNegative(value, name) {
    if (!Number.isFinite(value) || value < 0) throw new Error('Invalid non-negative ranking value: ' + name);
    return value;
}

function validateRankingConfig(config) {
    if (!config || config.schemaVersion !== 1 || config.rankingAlgorithmVersion !== 3) throw new Error('Unsupported ranking configuration');
    const weights = config.edgeWeights;
    if (!weights || !weights.typedRelation || !weights.hierarchy || !weights.keywordShared) throw new Error('Ranking edge weights required');
    for (const [name, value] of Object.entries({
        typedForward: weights.typedRelation.forwardMultiplier, typedReverse: weights.typedRelation.reverseMultiplier,
        mainForward: weights.hierarchy.main_path?.forward, mainReverse: weights.hierarchy.main_path?.reverse,
        auxForward: weights.hierarchy.aux_path?.forward, auxReverse: weights.hierarchy.aux_path?.reverse,
        keywordMultiplier: weights.keywordShared.strengthMultiplier, keywordMaximum: weights.keywordShared.maximum
    })) assertNonNegative(Number(value), name);
    return config;
}

function addEdge(graph, from, to, weight, type) {
    if (!graph.has(from) || !graph.has(to)) throw new Error('Unknown ranking endpoint: '+from+' -> '+to);
    if (from === to) return;
    graph.get(from).push({ to, weight: assertNonNegative(Number(weight), type), type });
}

function buildGraph(siteData, concepts, relations, keywordEdges, hierarchy, registry = readJson(moduleFiles.relationTypes, null), rankingConfig = readJson(moduleFiles.rankingConfig, null)) {
    const types = validateRegistry(registry);
    validateRelationInstances(relations, types, concepts);
    const config = validateRankingConfig(rankingConfig);
    const weightsByType = config.edgeWeights;
    const graph = new Map(siteData.map(item => [Number(item.id), []]));
    const conceptToSiteId = new Map();

    for (const concept of concepts) {
        const siteId = concept?.siteRef?.id;
        if (siteId != null) {
            if (!graph.has(Number(siteId))) throw new Error('Unknown concept site ID: '+siteId);
            conceptToSiteId.set(concept.conceptId, Number(siteId));
        }
    }

    const seenHierarchy = new Set();
    for (const edge of hierarchy.edges) {
        const key = edge.from + '->' + edge.to;
        if (seenHierarchy.has(key)) throw new Error('Duplicate hierarchy edge: '+key);
        seenHierarchy.add(key);
        const weights = weightsByType.hierarchy[edge.type];
        if (!weights) throw new Error('Unknown hierarchy type: '+edge.type);
        addEdge(graph, edge.from, edge.to, weights.forward, edge.type);
        addEdge(graph, edge.to, edge.from, weights.reverse, types.get(edge.type).inverseType);
    }

    for (const relation of relations) {
        const from = conceptToSiteId.get(relation.from);
        const to = conceptToSiteId.get(relation.to);
        if (from == null || to == null) continue;
        const strength = Number(relation.strength);
        addEdge(graph, from, to, strength * weightsByType.typedRelation.forwardMultiplier, relation.type || 'typedRelation');
        // Reverse propagation is configured outside the relation meaning; type identity comes from the registry.
        addEdge(graph, to, from, strength * weightsByType.typedRelation.reverseMultiplier, types.get(relation.type).inverseType);
    }

    for (const edge of keywordEdges) {
        const from = Number(edge.fromSiteId ?? edge.from);
        const to = Number(edge.toSiteId ?? edge.to);
        const weight = Math.min(weightsByType.keywordShared.maximum, Number(edge.weight) * weightsByType.keywordShared.strengthMultiplier);
        addEdge(graph, from, to, weight, 'keyword_shared');
        addEdge(graph, to, from, weight, 'keyword_shared');
    }

    return { graph, conceptToSiteId };
}

function pageRank(graph, nodeIds, damping = 0.85, iterations = 50) {
    const n = nodeIds.length || 1;
    let scores = new Map(nodeIds.map(id => [id, 1 / n]));

    for (let step = 0; step < iterations; step += 1) {
        const next = new Map(nodeIds.map(id => [id, (1 - damping) / n]));
        let dangling = 0;

        for (const id of nodeIds) {
            const edges = graph.get(id) || [];
            const totalWeight = edges.reduce((sum, edge) => sum + edge.weight, 0);
            const score = scores.get(id) || 0;

            if (edges.length === 0 || totalWeight <= 0) {
                dangling += score;
                continue;
            }

            for (const edge of edges) {
                next.set(edge.to, (next.get(edge.to) || 0) + damping * score * (edge.weight / totalWeight));
            }
        }

        if (dangling > 0) {
            const share = damping * dangling / n;
            for (const id of nodeIds) next.set(id, (next.get(id) || 0) + share);
        }

        scores = next;
    }

    return scores;
}

function hits(graph, nodeIds, iterations = 30) {
    let authority = new Map(nodeIds.map(id => [id, 1]));
    let hub = new Map(nodeIds.map(id => [id, 1]));

    for (let step = 0; step < iterations; step += 1) {
        const nextAuthority = new Map(nodeIds.map(id => [id, 0]));
        const nextHub = new Map(nodeIds.map(id => [id, 0]));

        for (const id of nodeIds) {
            for (const edge of graph.get(id) || []) {
                nextAuthority.set(edge.to, (nextAuthority.get(edge.to) || 0) + (hub.get(id) || 0) * edge.weight);
                nextHub.set(id, (nextHub.get(id) || 0) + (authority.get(edge.to) || 0) * edge.weight);
            }
        }

        normalizeVector(nextAuthority);
        normalizeVector(nextHub);
        authority = nextAuthority;
        hub = nextHub;
    }

    return { authority, hub };
}

function normalizeVector(map) {
    const norm = Math.sqrt([...map.values()].reduce((sum, value) => sum + value * value, 0)) || 1;
    for (const [key, value] of map) map.set(key, value / norm);
}

function textForSearchSource(record) {
    const sections = Array.isArray(record?.sections)
        ? record.sections.map(section => `${section.h2 || section.heading || ''} ${section.text || ''}`).join(' ')
        : '';
    return `${record?.label || ''} ${record?.labelEn || ''} ${record?.description || ''} ${sections}`.toLowerCase();
}

function countEdgesByType(graph, id, typePattern) {
    return (graph.get(id) || []).filter(edge => typePattern.test(edge.type || '')).length;
}

async function buildRanking({ dataDir = DATA_DIR, evaluationTime = Date.now() } = {}) {
    if (!Number.isFinite(evaluationTime)) throw new Error('Invalid ranking evaluation time');
    const FILES = Object.fromEntries(Object.entries(moduleFiles).map(([k,v]) => [k,path.join(dataDir,path.basename(v))]));
    const { RANKING_ALGORITHM_VERSION } = await import('../js/common/siteHierarchy/Hierarchy.mjs');
    const { nodes: siteData, hierarchy } = await readSiteHierarchy(dataDir);
    const concepts = readJson(FILES.concepts, []);
    const relations = readJson(FILES.relations, []);
    const relationTypesData = readJson(FILES.relationTypes, { relationTypes: [] });
    const rankingConfig = readJson(FILES.rankingConfig, null);
    const keywordEdges = readJson(FILES.keywordEdges, []);
    const searchSource = readJson(FILES.searchSource, []);
    const viewStats = readJson(FILES.viewStats, []);

    const nodeIds = siteData.map(item => Number(item.id)).filter(Number.isFinite);
    const siteById = new Map(siteData.map(item => [Number(item.id), item]));
    const searchById = new Map(searchSource.map(item => [Number(item.id), item]));
    const viewById = new Map(viewStats.map(item => [Number(item.id), item]));
    const { graph } = buildGraph(siteData, concepts, relations, keywordEdges, hierarchy, relationTypesData, rankingConfig);
    const pagerank = pageRank(graph, nodeIds);
    const { authority, hub } = hits(graph, nodeIds);
    const viewRecords = nodeIds.map(id => {
        const stats = viewById.get(id) || {};
        return {
            id,
            total: Math.log1p(Number(stats.totalViews) || 0),
            monthly: Math.log1p(Number(stats.monthlyViews) || 0),
            weekly: Math.log1p(Number(stats.weeklyViews) || 0)
        };
    });
    const totalPopularity = normalizeByMax(viewRecords, 'total');
    const monthlyPopularity = normalizeByMax(viewRecords, 'monthly');
    const weeklyPopularity = normalizeByMax(viewRecords, 'weekly');

    const scores = nodeIds.map(id => {
        const site = siteById.get(id) || {};
        const search = searchById.get(id) || {};
        const sections = Array.isArray(search.sections) ? search.sections : [];
        const sectionTextLength = sections.reduce((sum, section) => sum + String(section.text || '').length, 0);
        const contentScore = clamp01((sectionTextLength / 2400) + (site.description || search.description ? 0.2 : 0));
        const freshnessScore = dateFreshness(site.dateModified || site.datePublished, evaluationTime);
        const popularity = clamp01(
            (totalPopularity.get(id) || 0) * 0.4 +
            (monthlyPopularity.get(id) || 0) * 0.35 +
            (weeklyPopularity.get(id) || 0) * 0.25
        );
        const text = textForSearchSource(search);
        const outgoing = graph.get(id) || [];
        const keywordDegree = countEdgesByType(graph, id, /keyword_shared/);
        const dependencyTypes = new Set(['depends_on', 'prerequisite', 'prerequisite_for', 'main_path', 'main_path_parent']);
        const dependencyDegree = outgoing.filter(edge => dependencyTypes.has(edge.type)).length;
        const hierarchyDegree = outgoing.filter(edge => ['main_path', 'main_path_parent', 'aux_path', 'aux_path_parent'].includes(edge.type)).length;
        const applicationDegree = countEdgesByType(graph, id, /applied_to|uses|method/);
        const historyDegree = countEdgesByType(graph, id, /histor|inspired|preced/);
        const baseCentrality = (pagerank.get(id) || 0) * 100;

        const intentScores = {
            definition_lookup: clamp01(contentScore * 0.55 + baseCentrality * 0.25 + (site.description || search.description ? 0.2 : 0)),
            hierarchy_lookup: clamp01(hierarchyDegree / 8 + baseCentrality * 0.25),
            dependency_search: clamp01(dependencyDegree / 6 + contentScore * 0.25),
            learning_roadmap: clamp01(dependencyDegree / 5 + (site.mainPath ? 0.2 : 0) + baseCentrality * 0.2),
            related_concepts: clamp01((outgoing.length + keywordDegree) / 12 + baseCentrality * 0.25),
            lexicon_navigation: clamp01(/用語|一覧|term|glossary|index/.test(text) ? 0.85 : 0.15),
            history_lookup: clamp01((/歴史|成立|発展|背景|由来|history|historical/.test(text) ? 0.55 : 0) + historyDegree / 4),
            application_or_method: clamp01((/応用|利用|方法|実践|工学|技術|プログラミング|application|method|use/.test(text) ? 0.55 : 0) + applicationDegree / 4)
        };

        const overallScore = clamp01(
            baseCentrality * 0.35 +
            (authority.get(id) || 0) * 0.2 +
            contentScore * 0.2 +
            popularity * 0.15 +
            freshnessScore * 0.1
        );

        return {
            id,
            label: site.label || search.label || '',
            labelEn: site.labelEn || search.labelEn || '',
            url: site.url || '',
            overallScore: Number(overallScore.toFixed(6)),
            pagerank: Number((pagerank.get(id) || 0).toFixed(8)),
            authority: Number((authority.get(id) || 0).toFixed(6)),
            hub: Number((hub.get(id) || 0).toFixed(6)),
            popularity: Number(popularity.toFixed(6)),
            contentScore: Number(contentScore.toFixed(6)),
            freshnessScore: Number(freshnessScore.toFixed(6)),
            degree: outgoing.length,
            signals: {
                released: site.released ?? null,
                isPaid: site.isPaid ?? null,
                sectionCount: sections.length,
                sectionTextLength,
                keywordDegree,
                dependencyDegree,
                hierarchyDegree,
                applicationDegree,
                historyDegree
            },
            intentScores
        };
    }).sort((a, b) => b.overallScore - a.overallScore || a.id - b.id);

    return {
        schemaVersion: 1,
        rankingAlgorithmVersion: RANKING_ALGORITHM_VERSION,
        hierarchySchemaVersion: hierarchy.schemaVersion,
        hierarchySourceHash: hierarchy.sourceHash,
        rankingConfigVersion: rankingConfig.schemaVersion,
        rankingConfigHash: createHash('sha256').update(JSON.stringify(rankingConfig, null, 2) + '\n').digest('hex'),
        rankingEdgeWeights: rankingConfig.edgeWeights,
        generatedAt: new Date(evaluationTime).toISOString(),
        sourceFiles: {
            siteData: path.basename(FILES.siteData),
            hierarchy: path.basename(FILES.hierarchy),
            concepts: path.basename(FILES.concepts),
            relations: path.basename(FILES.relations),
            relationTypes: path.basename(FILES.relationTypes),
            rankingConfig: path.basename(FILES.rankingConfig),
            keywordEdges: path.basename(FILES.keywordEdges),
            searchSource: path.basename(FILES.searchSource),
            viewStats: fs.existsSync(FILES.viewStats) ? path.basename(FILES.viewStats) : null
        },
        relationTypeCount: Array.isArray(relationTypesData.relationTypes) ? relationTypesData.relationTypes.length : 0,
        scoreFields: [
            'overallScore',
            'pagerank',
            'authority',
            'hub',
            'popularity',
            'contentScore',
            'freshnessScore',
            'intentScores'
        ],
        scores
    };
}

async function main() {
    const ranking = await buildRanking();

    if (!dryRun) {
        writeJson(moduleFiles.output, ranking);
    }

    console.log(`ranking records: ${ranking.scores.length}`);
    console.log(`top records: ${ranking.scores.slice(0, 5).map(item => `${item.id}:${item.label}`).join(', ')}`);
    console.log(dryRun ? 'dry-run: ranking.json was not written' : `written: ${moduleFiles.output}`);
}

module.exports = { buildRanking, buildGraph, pageRank, hits, validateRankingConfig };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
