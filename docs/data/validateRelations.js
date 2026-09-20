const fs = require('node:fs');
const path = require('node:path');
const assertText = (value, name) => { if (typeof value !== 'string' || !value.trim()) throw new Error(`${name}: non-empty string required`); };
const assertUnit = (value, name) => { if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error(`${name}: number from 0 to 1 required`); };
function assertPresentation(def) {
    const presentation = def.presentation;
    if (!presentation || typeof presentation !== 'object' || Array.isArray(presentation)) throw new Error(`presentation required: ${def.type}`);
    assertUnit(presentation.visualPriority, `presentation.visualPriority: ${def.type}`);
    if (typeof presentation.dashes !== 'boolean' || !['', 'to'].includes(presentation.arrows)) throw new Error(`Invalid presentation: ${def.type}`);
}

// Offline registry, inverse and operational-semantics contract. No browser inference.
function validateRegistry(data) {
    if (data?.schemaVersion !== 1 || !Array.isArray(data.relationTypes) || !data.relationTypes.length) throw new Error('relationTypes: schemaVersion 1 and non-empty array required');
    const types = new Map();
    for (const def of data.relationTypes) {
        if (!def || typeof def !== 'object') throw new Error('relationTypes: definition required');
        for (const field of ['type', 'inverseType', 'canonicalType', 'label', 'description']) assertText(def[field], `relationTypes.${field}`);
        if (types.has(def.type)) throw new Error(`Duplicate type: ${def.type}`);
        if (!['stored', 'generated', 'derived'].includes(def.materialization)) throw new Error(`Invalid materialization: ${def.type}`);
        for (const field of ['directed', 'symmetric', 'transitive']) if (typeof def[field] !== 'boolean') throw new Error(`Invalid ${field}: ${def.type}`);
        assertPresentation(def);
        types.set(def.type, def);
    }
    for (const def of types.values()) {
        const inverse = types.get(def.inverseType);
        if (!inverse) throw new Error(`Unknown inverse: ${def.type} -> ${def.inverseType}`);
        if (inverse.inverseType !== def.type) throw new Error(`Inverse is not involutive: ${def.type}`);
        for (const field of ['directed', 'symmetric', 'transitive']) if (def[field] !== inverse[field]) throw new Error(`Inverse ${field} differs: ${def.type}`);
        const canonical = types.get(def.canonicalType);
        if (!canonical || canonical.canonicalType !== canonical.type || canonical.materialization === 'derived' || inverse.canonicalType !== canonical.type) throw new Error(`Invalid canonical type: ${def.type}`);
        if (def.symmetric) {
            if (def.directed || def.inverseType !== def.type || def.canonicalType !== def.type) throw new Error(`Symmetric type must be self-inverse: ${def.type}`);
        } else {
            if (!def.directed || inverse.type === def.type) throw new Error(`Directed inverse pair required: ${def.type}`);
            if (canonical.type !== def.type && canonical.type !== inverse.type) throw new Error(`Canonical type outside inverse pair: ${def.type}`);
        }
        if ((def.type !== canonical.type) !== (def.materialization === 'derived')) throw new Error(`Derived side must be inverse of canonical: ${def.type}`);
    }
    validateSemanticRegistry(data, types);
    return types;
}

function validateRelationInstances(relations, types, concepts, { strictEvidence = false } = {}) {
    if (!Array.isArray(relations)) throw new Error('relations: array required');
    const conceptIds = concepts && new Set(concepts.map(c => c.conceptId));
    const ids = new Set(), facts = new Set();
    for (const relation of relations) {
        if (!relation || typeof relation !== 'object') throw new Error('relation: object required');
        for (const field of ['relationId', 'from', 'to', 'type']) assertText(relation[field], `relation.${field}`);
        if (ids.has(relation.relationId)) throw new Error(`Duplicate relationId: ${relation.relationId}`);
        ids.add(relation.relationId);
        const def = types.get(relation.type);
        if (!def) throw new Error(`Unknown relation type: ${relation.type}`);
        // Kept mandatory during this migration because integratedSearch still uses the copy.
        if (relation.inverseType !== def.inverseType) throw new Error(`inverseType differs from registry: ${relation.relationId}`);
        if (def.materialization !== 'stored' || def.canonicalType !== def.type) throw new Error(`Store canonical facts only: ${relation.relationId} (${relation.type})`);
        if (Object.hasOwn(relation, 'weight')) throw new Error(`Deprecated relation weight: ${relation.relationId}`);
        assertUnit(relation.confidence, `relation.confidence: ${relation.relationId}`);
        assertUnit(relation.strength, `relation.strength: ${relation.relationId}`);
        if (conceptIds && (!conceptIds.has(relation.from) || !conceptIds.has(relation.to))) throw new Error(`Unknown concept endpoint: ${relation.relationId}`);
        const ends = def.symmetric ? [relation.from, relation.to].sort() : [relation.from, relation.to];
        const key = JSON.stringify([def.canonicalType, ...ends]);
        if (facts.has(key)) throw new Error(`Duplicate fact: ${relation.relationId}`);
        facts.add(key);
    }
    const warnings = validateSemanticInstances(relations, types, concepts);
    if (strictEvidence && warnings.length) throw new Error(`Evidence review required: ${warnings.map(w => w.relationId).join(', ')}`);
    return { relations: ids.size, facts: facts.size, warnings };
}


function validateSemanticRegistry(data, types) {
    if (data.semanticsVersion !== 1 || !data.entityKinds || typeof data.entityKinds !== 'object' || Array.isArray(data.entityKinds)) throw new Error('semanticsVersion 1 and entityKinds required');
    const knownKinds = new Set(Object.keys(data.entityKinds));
    for (const [kind, description] of Object.entries(data.entityKinds)) { assertText(kind, 'entityKind'); assertText(description, 'entityKind description'); }
    for (const def of types.values()) {
        for (const key of ['semanticDefinition', 'relationFamily', 'specSection']) assertText(def[key], def.type + '.' + key);
        if (def.category !== def.relationFamily) throw new Error('category compatibility alias differs: ' + def.type);
        if (!['draft', 'active', 'experimental', 'deprecated'].includes(def.status)) throw new Error('Invalid status: ' + def.type);
        if (def.categoricalStatus !== 'not_asserted') throw new Error('Unverified categorical status: ' + def.type);
        if (!['direct_assertion', 'contextual_assertion', 'editorial_summary', 'generated_pair', 'direct_membership'].includes(def.relationScope)) throw new Error('Invalid relationScope: ' + def.type);
        for (const field of ['domain', 'range']) {
            const values = def[field];
            if (!Array.isArray(values) || !values.length || new Set(values).size !== values.length || values.some(k => !knownKinds.has(k))) throw new Error('Invalid ' + field + ': ' + def.type);
        }
        for (const field of ['reflexive', 'irreflexive', 'antisymmetric', 'acyclic']) if (typeof def[field] !== 'boolean') throw new Error('Invalid ' + field + ': ' + def.type);
        if (def.reflexive || !def.irreflexive || def.transitive) throw new Error('Operational profile forbids reflexive facts and transitive inference: ' + def.type);
        if (def.acyclic && (!def.antisymmetric || def.symmetric)) throw new Error('Inconsistent acyclic properties: ' + def.type);
        const inverse = types.get(def.inverseType);
        for (const field of ['reflexive', 'irreflexive', 'antisymmetric', 'acyclic', 'relationScope', 'relationFamily', 'status', 'categoricalStatus']) if (def[field] !== inverse[field]) throw new Error('Inverse ' + field + ' differs: ' + def.type);
        const sameSet = (a, b) => a.length === b.length && a.every(v => b.includes(v));
        if (!sameSet(def.domain, inverse.range) || !sameSet(def.range, inverse.domain)) throw new Error('Inverse domain/range differs: ' + def.type);
        if (def.composition?.mode !== 'no_automatic_inference' || !Array.isArray(def.composition.rules) || def.composition.rules.length) throw new Error('Unapproved composition rule: ' + def.type);
        assertText(def.composition.note, def.type + '.composition.note');
        const policy = def.evidencePolicy;
        if (!policy || !Array.isArray(policy.requiredFields) || new Set(policy.requiredFields).size !== policy.requiredFields.length || policy.requiredFields.some(f => typeof f !== 'string' || !/^[a-zA-Z]\w*(\.[a-zA-Z]\w*)*$/.test(f))) throw new Error('Invalid evidencePolicy: ' + def.type);
        assertText(policy.description, def.type + '.evidencePolicy.description');
        if (def.materialization === 'stored' && (!policy.requiredFields.includes('note') || !policy.requiredFields.includes('evidence'))) throw new Error('Stored facts require note and evidence: ' + def.type);
        if (def.materialization !== 'stored' && policy.requiredFields.length) throw new Error('Non-stored evidence belongs to source: ' + def.type);
        for (const kind of ['positive', 'negative']) for (const field of ['statement', 'scenario', 'explanation']) assertText(def.examples?.[kind]?.[field], def.type + '.examples.' + kind + '.' + field);
        for (const field of ['display', 'ranking', 'note']) assertText(def.usage?.[field], def.type + '.usage.' + field);
    }
}

function validateSemanticInstances(relations, types, concepts) {
    const byId = concepts ? new Map() : null;
    if (concepts) {
        if (!Array.isArray(concepts)) throw new Error('concepts: array required');
        for (const concept of concepts) {
            assertText(concept?.conceptId, 'conceptId');
            if (byId.has(concept.conceptId)) throw new Error('Duplicate conceptId: ' + concept.conceptId);
            byId.set(concept.conceptId, concept);
        }
    }
    const warnings = [];
    const present = value => typeof value === 'string' ? !!value.trim() : typeof value === 'number' ? Number.isFinite(value) : value !== null && typeof value === 'object' && Object.keys(value).length > 0;
    const at = (obj, field) => field.split('.').reduce((v, k) => v != null && Object.hasOwn(v, k) ? v[k] : undefined, obj);
    for (const relation of relations) {
        const def = types.get(relation.type);
        if (def.irreflexive && relation.from === relation.to) throw new Error('Self relation forbidden: ' + relation.relationId);
        if (byId && (!def.domain.includes(byId.get(relation.from)?.kind) || !def.range.includes(byId.get(relation.to)?.kind))) throw new Error('domain/range violation: ' + relation.relationId);
        for (const field of ['context', 'evidence']) if (relation[field] !== undefined && (!relation[field] || typeof relation[field] !== 'object' || Array.isArray(relation[field]))) throw new Error('Invalid ' + field + ': ' + relation.relationId);
        if (relation.type === 'depends_on' && relation.context?.dependencyKind !== undefined && !['logical', 'epistemic'].includes(relation.context.dependencyKind)) throw new Error('Invalid dependencyKind: ' + relation.relationId);
        if (relation.type === 'adjacent_to' && relation.context?.axis !== undefined && !['object', 'method', 'application'].includes(relation.context.axis)) throw new Error('Invalid adjacency axis: ' + relation.relationId);
        const missingFields = def.evidencePolicy.requiredFields.filter(field => !present(at(relation, field)));
        if (missingFields.length) warnings.push({ relationId: relation.relationId, type: relation.type, code: 'EVIDENCE_REVIEW_REQUIRED', missingFields });
    }
    // Only stored canonical directions are present here; inverse views are not extra edges.
    // The combined main/aux site DAG is separately checked by compileHierarchy.
    for (const def of types.values()) {
        if (!def.acyclic || def.materialization !== 'stored') continue;
        const children = new Map();
        for (const r of relations.filter(r => r.type === def.type)) {
            if (!children.has(r.from)) children.set(r.from, []);
            children.get(r.from).push(r.to);
        }
        const state = new Map();
        function visit(id) {
            if (state.get(id) === 1) throw new Error('Cycle in ' + def.type + ': ' + id);
            if (state.get(id) === 2) return;
            state.set(id, 1);
            for (const next of children.get(id) || []) visit(next);
            state.set(id, 2);
        }
        for (const id of children.keys()) visit(id);
    }
    return warnings;
}

function validateRelationData(dataDir = __dirname, options = {}) {
    const read = name => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8').replace(/^\uFEFF/, ''));
    const registry = read('relationTypes.json');
    const types = validateRegistry(registry);
    const result = validateRelationInstances(read('relations.json'), types, read('concepts.json'), options);
    return { types: types.size, inversePairs: [...types.values()].filter(d => !d.symmetric && d.type === d.canonicalType).length,
        symmetricTypes: [...types.values()].filter(d => d.symmetric).length, ...result };
}
module.exports = { validateRegistry, validateRelationInstances, validateRelationData };
if (require.main === module) {
    try { console.log(JSON.stringify(validateRelationData(__dirname, { strictEvidence: process.argv.includes('--strict-evidence') }), null, 2)); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
}
