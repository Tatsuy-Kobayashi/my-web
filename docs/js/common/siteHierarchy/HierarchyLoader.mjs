import { attachPublishedHierarchy, assertRankingVersion, hierarchyMetadata } from './Hierarchy.mjs';
export const DATA_BASE_URL = new URL('../../../data/', import.meta.url).href;
const digestDefault = bytes => globalThis.crypto.subtle.digest('SHA-256', bytes);
const outputNames = ['siteData','siteHierarchy','concepts','relations','relationTypes','queryIntents','keywordEdges','searchSource','rankingConfig','ranking','learningRoadmaps'];
export function showHierarchyError() {
    if (typeof document === 'undefined' || document.getElementById('hierarchy-load-error')) return;
    const message = document.createElement('p');
    message.id = 'hierarchy-load-error';message.setAttribute('role','alert');
    message.textContent = '分類データを読み込めませんでした。ページを再読み込みしてください。';
    (document.querySelector('main') || document.body)?.prepend(message);
}
async function readJson(name, {baseUrl,fetcher,digest}, cache, expectedHash) {
    const response=await fetcher(new URL(name+'.json',baseUrl).href,{cache});
    if(!response.ok)throw new Error(`HTTP ${response.status}: ${name}`);
    const bytes=await response.arrayBuffer();
    if(expectedHash) {
        const actual=Array.from(new Uint8Array(await digest(bytes)),b=>b.toString(16).padStart(2,'0')).join('');
        if(actual!==expectedHash)throw new Error('Mixed/stale publication: '+name);
    }
    return JSON.parse(new TextDecoder().decode(bytes));
}
function checkContainer(name,value) {
    if(['siteData','concepts','relations','queryIntents','keywordEdges','searchSource'].includes(name)) {
        if(!Array.isArray(value))throw new Error('Array expected: '+name);
    } else if(name==='learningRoadmaps') {
        if(value?.schemaVersion!==1 || !Array.isArray(value.roadmaps) || value.roadmaps.some(m=>m.status!=='published'||!Array.isArray(m.nodes)||!Array.isArray(m.edges)))throw new Error('Invalid learning roadmaps');
    } else if(name==='rankingConfig') {
        if(!value || value.schemaVersion!==1 || value.rankingAlgorithmVersion!==3 || !value.edgeWeights)throw new Error('Invalid ranking configuration');
    } else if(!value || value.schemaVersion!==1 || !Array.isArray(value[name==='siteHierarchy'?'nodes':name==='ranking'?'scores':'relationTypes']))throw new Error('Unsupported container: '+name);
}
// All required files in one application are accepted against one manifest, or retried together.
// A ranking failure alone keeps the established unranked-search fallback.
export async function loadDataSet(names, {baseUrl=DATA_BASE_URL,fetcher=globalThis.fetch,digest=digestDefault}={}) {
    if(names.some(n=>!outputNames.includes(n)))throw new Error('Unknown public data name');
    const options={baseUrl,fetcher,digest};let lastError;
    for(const cache of ['default','reload']) {
        try {
            const manifest=await readJson('manifest',options,cache);
            if(manifest?.schemaVersion!==1||manifest.contractVersion!==1||!manifest.outputs||outputNames.some(n=>!/^[a-f0-9]{64}$/.test(manifest.outputs[n+'.json'])))throw new Error('Unsupported publication manifest');
            const data={};
            await Promise.all([...new Set(names.filter(n=>n!=='ranking'))].map(async name=>{
                const value=await readJson(name,options,cache,manifest.outputs[name+'.json']);
                checkContainer(name,value);data[name]=value;
            }));
            if(data.siteData&&data.siteHierarchy)data.nodes=attachPublishedHierarchy(data.siteData,data.siteHierarchy,manifest);
            if(names.includes('ranking'))data.ranking=await loadRanking(data.nodes,{...options,manifest});
            if(typeof document!=='undefined')document.getElementById('hierarchy-load-error')?.remove();
            return data;
        } catch(error){lastError=error;}
    }
    showHierarchyError();throw lastError;
}
export async function loadSiteNodes(options={}) {return (await loadDataSet(['siteData','siteHierarchy'],options)).nodes;}
export async function loadRanking(nodes, {baseUrl=DATA_BASE_URL,fetcher=globalThis.fetch,digest=digestDefault,manifest}={}) {
    const expected=manifest?.outputs?.['ranking.json'] || hierarchyMetadata(nodes)?.outputs?.['ranking.json'];
    for(const cache of ['default','reload']) {
        try {
            if(!expected)throw new Error('Ranking requires a publication manifest');
            const ranking=await readJson('ranking',{baseUrl,fetcher,digest},cache,expected);
            checkContainer('ranking',ranking);assertRankingVersion(ranking,nodes);
            if(ranking.scores.some(s=>!Number.isFinite(s.overallScore)))throw new Error('Invalid ranking score');
            return ranking;
        } catch(error){if(cache==='reload')console.warn('[ranking] Ranking unavailable; continuing without scores.',error);}
    }
    return {scores:[]};
}
