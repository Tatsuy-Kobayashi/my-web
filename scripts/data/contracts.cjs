const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { validateRegistry, validateRelationInstances } = require('../../docs/data/validateRelations.js');
const { validateRoadmaps, projectRoadmaps } = require('./roadmaps.cjs');
const ROOT = path.resolve(__dirname, '../..');
const PUBLIC = ['siteData','concepts','relations','relationTypes','queryIntents','siteHierarchy','searchSource','keywordEdges','rankingConfig','ranking','learningRoadmaps'];
const SOURCE = ['siteData','concepts','relations','relationTypes','queryIntents','searchPolicy','rankingConfig','learningRoadmaps'];
const schema = JSON.parse(fs.readFileSync(path.join(ROOT,'schemas/data.schema.json'),'utf8'));
const ajv = new Ajv({ allErrors:true, strict:true });
addFormats(ajv);
ajv.addSchema(schema);
const validators = new Map();
const hash = value => createHash('sha256').update(value).digest('hex');
const json = file => JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const serialize = value => JSON.stringify(value,null,2) + '\n';
function invariant(condition, message) { if (!condition) throw new Error(message); }
function validateShape(name, data) {
    if (!validators.has(name)) validators.set(name,ajv.getSchema(schema.$id+'#/definitions/'+name));
    const validate = validators.get(name);
    invariant(validate, 'Unknown schema: '+name);
    if (!validate(data)) throw new Error(`Schema ${name}: `+ajv.errorsText(validate.errors,{separator:'; '}));
}
function unique(records, field, label) {
    const map = new Map(records.map(x=>[x[field],x]));
    invariant(map.size===records.length, 'Duplicate '+label);
    return map;
}
function same(a,b,label) { invariant(JSON.stringify(a)===JSON.stringify(b),'Mismatch: '+label); }
function scanPublic(value, location = '$') {
    if (typeof value === 'string') {
        // Never include the matching value in diagnostics.
        const patterns = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16})\b/, /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/, /(?:api[_-]?key|password|client[_-]?secret|access[_-]?token)\s*[:=]\s*\S+/i, /https?:\/\/[^\s/@]+:[^\s/@]+@/i];
        invariant(!patterns.some(p=>p.test(value)), 'Potential secret at '+location);
    } else if (value && typeof value==='object') {
        for (const [key,v] of Object.entries(value)) {
            invariant(!/^(?:private|internal|editorial|secret|password|api_?key|access_?token|client_?secret|authorization|cookie|rawEvidence)$/i.test(key),'Forbidden public field at '+location);
            scanPublic(v,location+'.'+key);
        }
    }
}
function checkRelations(data, hierarchy) {
    const site = unique(data.siteData,'id','site ID'), concepts = unique(data.concepts,'conceptId','concept ID');
    const paths = new Map(hierarchy.nodes.map(n=>[n.id,[...n.mainPath,...n.auxPath]]));
    const types = validateRegistry(data.relationTypes);
    const result = validateRelationInstances(data.relations,types,data.concepts,{strictEvidence:true});
    const conceptBySite = new Set();
    for (const c of concepts.values()) {
        invariant(site.has(c.siteRef.id), 'Unknown concept site: '+c.conceptId);
        invariant(!conceptBySite.has(c.siteRef.id),'Duplicate concept site: '+c.conceptId);
        conceptBySite.add(c.siteRef.id);
        for (const [field,reverse] of [['parentConceptIds','childConceptIds'],['childConceptIds','parentConceptIds']]) {
            for (const id of c[field]) {
                invariant(id!==c.conceptId && concepts.has(id),'Unknown/self concept reference: '+c.conceptId);
                invariant(concepts.get(id)[reverse].includes(c.conceptId),'Non-reciprocal concept reference: '+c.conceptId);
            }
        }
    }
    const state = new Map();
    function visit(id) { invariant(state.get(id)!==1,'Concept parent cycle: '+id); if(state.get(id)===2)return;state.set(id,1);for(const p of concepts.get(id).parentConceptIds)visit(p);state.set(id,2); }
    for (const id of concepts.keys()) visit(id);
    for (const r of data.relations) {
        const e = r.evidence, from = concepts.get(r.from).siteRef.id, to = concepts.get(r.to).siteRef.id;
        if ('siteId' in e) invariant(site.has(e.siteId),'Unknown evidence site: '+r.relationId);
        for (const field of ['sitePath','sitePath2']) if (field in e) {
            const ids=e[field].split(':').map(Number), end=ids.at(-1);
            invariant(paths.get(end)?.includes(e[field]),'Stale evidence path: '+r.relationId);
            invariant(end===from||end===to,'Unrelated evidence path: '+r.relationId);
        }
        if (['part_of','glossary_of'].includes(r.type)) {
            invariant(e.siteId===from && Number(e.sitePath.split(':').at(-2))===to,'Direct classification evidence mismatch: '+r.relationId);
        }
        if (types.get(r.type).symmetric) invariant(r.from<r.to,'Non-canonical symmetric endpoint order: '+r.relationId);
    }
    unique(data.queryIntents,'intentId','intent ID'); unique(data.queryIntents,'name','intent name');
    for (const q of data.queryIntents) for (const kind of q.targetKinds) invariant(kind in data.relationTypes.entityKinds && kind!=='site_node','Unknown query kind: '+kind);
    if (data.viewStats) { unique(data.viewStats,'id','viewStats ID');for(const row of data.viewStats)invariant(site.has(row.id),'Unknown viewStats ID'); }
    return result;
}
function projectConcepts(concepts, siteData, hierarchy) {
    const site=new Map(siteData.map(n=>[n.id,n])), derived=new Map(hierarchy.nodes.map(n=>[n.id,n]));
    const keys=Object.keys(schema.definitions.concepts.items.properties.siteRef.properties);
    return concepts.map(c=>{
        invariant(site.has(c.siteRef.id),'Unknown concept site: '+c.conceptId);
        const n={...site.get(c.siteRef.id),...derived.get(c.siteRef.id)};
        return {...c,siteRef:Object.fromEntries(keys.filter(k=>n[k]!==undefined).map(k=>[k,n[k]]))};
    });
}
async function validateSources(data) {
    for (const name of SOURCE) { validateShape(name==='concepts'?'conceptsSource':name==='learningRoadmaps'?'learningRoadmapsSource':name,data[name]);scanPublic(data[name],name); }
    if (data.viewStats) {validateShape('viewStats',data.viewStats);scanPublic(data.viewStats,'viewStats');}
    const { compileHierarchy } = await import('../../docs/js/common/siteHierarchy/Hierarchy.mjs');
    const hierarchy=compileHierarchy(data.siteData,{sourceHash:hash(serialize(data.siteData))});
    checkRelations(data,hierarchy);
    validateRoadmaps(data.learningRoadmaps,data.siteData);
    return hierarchy;
}
async function validatePublic(data, expectedSource) {
    for (const name of PUBLIC) {validateShape(name,data[name]);scanPublic(data[name],name);}
    const { attachHierarchy, assertRankingVersion } = await import('../../docs/js/common/siteHierarchy/Hierarchy.mjs');
    const nodes=attachHierarchy(data.siteData,data.siteHierarchy,hash(serialize(data.siteData)));
    assertRankingVersion(data.ranking,nodes);
    invariant(data.ranking.rankingConfigVersion===data.rankingConfig.schemaVersion,'Ranking config version mismatch');
    invariant(data.ranking.rankingConfigHash===hash(serialize(data.rankingConfig)),'Ranking config hash mismatch');
    same(data.ranking.rankingEdgeWeights,data.rankingConfig.edgeWeights,'ranking edge weights');
    const relationResult=checkRelations(data,data.siteHierarchy);
    validateRoadmaps(data.learningRoadmaps,data.siteData,{publishedOnly:true});
    if(expectedSource) same(data.learningRoadmaps,projectRoadmaps(expectedSource.learningRoadmaps),'published roadmaps');
    const canonical = expectedSource?.concepts || data.concepts.map(c=>({...c,siteRef:{id:c.siteRef.id}}));
    same(data.concepts,projectConcepts(canonical,data.siteData,data.siteHierarchy),'concepts.siteRef projection');
    const sites = new Map(data.siteData.map(n=>[n.id,n]));
    for (const [name,rows] of [['searchSource',data.searchSource],['ranking',data.ranking.scores]]) {
        const byId=unique(rows,'id',name+' ID');
        invariant(byId.size===sites.size && [...sites.keys()].every(id=>byId.has(id)),name+' IDs differ from siteData');
        for (const row of rows) for (const field of name==='ranking'?['label','labelEn','url']:['label','labelEn']) same(row[field],sites.get(row.id)[field],name+'.'+field);
    }
    const {buildKeywordEdges}=require('../../docs/data/generateKeywordEdges.js');
    same(data.keywordEdges,buildKeywordEdges(data.siteData),'keyword edges');
    const names=data.queryIntents.map(q=>q.name).sort();
    for (const score of data.ranking.scores) same(Object.keys(score.intentScores).sort(),names,'ranking intent names');
    invariant(data.ranking.relationTypeCount===data.relationTypes.relationTypes.length,'Ranking relation type count');
    return {roadmaps:data.learningRoadmaps.roadmaps.length,sites:sites.size,concepts:data.concepts.length,relations:data.relations.length,relationTypes:data.relationTypes.relationTypes.length,hierarchyEdges:data.siteHierarchy.edges.length,keywordEdges:data.keywordEdges.length,searchRecords:data.searchSource.length,rankingRecords:data.ranking.scores.length,evidenceWarnings:relationResult.warnings.length};
}
module.exports={ROOT,PUBLIC,SOURCE,hash,json,serialize,invariant,same,validateShape,scanPublic,validateSources,validatePublic,projectConcepts};
