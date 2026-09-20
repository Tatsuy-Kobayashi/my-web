const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const C = require('./contracts.cjs');
const { projectRoadmaps } = require('./roadmaps.cjs');
const { buildSearchSource, articlePath } = require('../../docs/data/generateSearchSource.js');
const { buildKeywordEdges } = require('../../docs/data/generateKeywordEdges.js');
const { buildRanking } = require('../../docs/data/generateRanking.js');
const {ROOT,PUBLIC,SOURCE,hash,json,serialize,invariant,same} = C;
const WORK = path.join(ROOT,'.data-build');
function inside(parent, target) {
    const resolved=path.resolve(target), base=path.resolve(parent);
    invariant(resolved.startsWith(base+path.sep), 'Path outside intended directory');
    return resolved;
}
function cleanStage(stage) { fs.rmSync(inside(WORK,stage),{recursive:true,force:true}); }
function walk(dir) {
    return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
        invariant(!e.isSymbolicLink(),'Symlinks are not accepted in data workflow inputs');
        const file=path.join(dir,e.name);return e.isDirectory()?walk(file):[file];
    });
}
function checkSourceFiles(sourceDir) {
    const allowed=new Set([...SOURCE.map(n=>n+'.json'),'viewStats.json']);
    for (const file of walk(sourceDir)) invariant(path.dirname(file)===path.resolve(sourceDir)&&allowed.has(path.basename(file)),'Unexpected source file: '+path.basename(file));
}
function checkPublicFiles(outputDir) {
    if (!fs.existsSync(outputDir))return;
    const allowed=new Set([...PUBLIC.map(n=>n+'.json'),'manifest.json']);
    // Data directory also contains established generator JS and README; reject any other file.
    const helpers=new Set(['README.md','generateSiteHierarchy.js','generateSearchSource.js','generateKeywordEdges.js','generateRanking.js','validateRelations.js']);
    for (const file of walk(outputDir)) invariant(path.dirname(file)===path.resolve(outputDir)&&(allowed.has(path.basename(file))||helpers.has(path.basename(file))),'Unexpected public data file: '+path.basename(file));
}
function inputInventory(sourceDir, htmlInputs) {
    const code=[...walk(path.join(ROOT,'scripts/data')),...walk(path.join(ROOT,'schemas')),
        ...['generateSiteHierarchy.js','generateSearchSource.js','generateKeywordEdges.js','generateRanking.js','validateRelations.js'].map(n=>path.join(ROOT,'docs/data',n)),
        path.join(ROOT,'docs/js/common/siteHierarchy/Hierarchy.mjs'),path.join(ROOT,'package.json'),path.join(ROOT,'package-lock.json')];
    const files=[...SOURCE.map(n=>path.join(sourceDir,n+'.json')),path.join(sourceDir,'viewStats.json'),...code,...htmlInputs];
    return [...new Set(files)].map(file=>{
        inside(ROOT,file);
        if (fs.existsSync(file)) invariant(!fs.lstatSync(file).isSymbolicLink(),'Symlink input');
        return {path:path.relative(ROOT,file).split(path.sep).join('/'),sha256:fs.existsSync(file)?hash(fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n')):null};
    }).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
}
// Validate everything before touching public data. Manifest is the last file installed.
// Per-file rename plus rollback handles ordinary I/O errors; this is not a filesystem-wide transaction.
function install(outputDir, bytes, beforeReplace = ()=>{}) {
    fs.mkdirSync(outputDir,{recursive:true});
    const backups=new Map(), replaced=[];
    try {
        for (const [name,value] of Object.entries(bytes)) {
            const target=path.join(outputDir,name), temporary=target+'.build-'+randomUUID();
            backups.set(name,fs.existsSync(target)?fs.readFileSync(target):null);
            beforeReplace(name);
            try {fs.writeFileSync(temporary,value);fs.renameSync(temporary,target);replaced.push(name);}
            finally {if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
        }
    } catch (error) {
        for (const name of replaced.reverse()) {
            const target=path.join(outputDir,name), original=backups.get(name);
            if(original===null)fs.unlinkSync(target);else fs.writeFileSync(target,original);
        }
        throw error;
    }
}
async function build({sourceDir=path.join(ROOT,'data/source'),htmlDir=path.join(ROOT,'docs'),outputDir=path.join(ROOT,'docs/data'),check=false,evaluationTime,beforeReplace}={}) {
    sourceDir=path.resolve(sourceDir);htmlDir=path.resolve(htmlDir);outputDir=path.resolve(outputDir);
    inside(ROOT,sourceDir);inside(ROOT,htmlDir);inside(ROOT,outputDir);
    checkSourceFiles(sourceDir);checkPublicFiles(outputDir);
    const originalManifest=check?json(path.join(outputDir,'manifest.json')):null;
    if(check)C.validateShape('manifest',originalManifest);
    const time=evaluationTime ?? (check?Date.parse(originalManifest.generatedAt):Date.now());
    invariant(Number.isFinite(time),'Invalid evaluation time');
    const beforeRead=inputInventory(sourceDir,[]);
    const source=Object.fromEntries(SOURCE.map(n=>[n,json(path.join(sourceDir,n+'.json'))]));
    if(fs.existsSync(path.join(sourceDir,'viewStats.json')))source.viewStats=json(path.join(sourceDir,'viewStats.json'));
    const siteHierarchy=await C.validateSources(source);
    const htmlInputs=source.siteData.filter(n=>n.released===1).map(n=>articlePath(n.url,htmlDir)).filter(Boolean);
    same(inputInventory(sourceDir,[]),beforeRead,'source changed during read');
    const captured=new Map(beforeRead.map(entry=>[entry.path,entry]));
    const inputs=inputInventory(sourceDir,htmlInputs).map(entry=>captured.get(entry.path)||entry);
    const search=buildSearchSource(source.siteData,{htmlDir,metadataOnly:source.searchPolicy.metadataOnly});
    const publicData={learningRoadmaps:projectRoadmaps(source.learningRoadmaps),siteData:source.siteData,concepts:C.projectConcepts(source.concepts,source.siteData,siteHierarchy),relations:source.relations,relationTypes:source.relationTypes,queryIntents:source.queryIntents,rankingConfig:source.rankingConfig,siteHierarchy,searchSource:search.records,keywordEdges:buildKeywordEdges(source.siteData)};
    fs.mkdirSync(WORK,{recursive:true});
    const stage=fs.mkdtempSync(path.join(WORK,'stage-'));
    try {
        for(const [name,data] of Object.entries(publicData))fs.writeFileSync(path.join(stage,name+'.json'),serialize(data));
        if(source.viewStats)fs.writeFileSync(path.join(stage,'viewStats.json'),serialize(source.viewStats));
        publicData.ranking=await buildRanking({dataDir:stage,evaluationTime:time});
        const summary=await C.validatePublic(publicData,source);
        const bytes=Object.fromEntries(PUBLIC.map(n=>[n+'.json',serialize(publicData[n])]));
        const manifest={schemaVersion:1,contractVersion:1,inputHashFormat:'utf8-lf',generatedAt:new Date(time).toISOString(),inputs,
            outputs:Object.fromEntries(Object.entries(bytes).map(([name,value])=>[name,hash(value)])),warnings:search.warnings};
        C.validateShape('manifest',manifest);C.scanPublic(manifest,'manifest');
        bytes['manifest.json']=serialize(manifest);
        // Detect a source/HTML edit during generation, including creation of previously absent inputs.
        same(inputInventory(sourceDir,search.inputs),inputs,'inputs changed during build');
        checkSourceFiles(sourceDir);checkPublicFiles(outputDir);
        if(check) {
            for(const [name,value] of Object.entries(bytes)) invariant(fs.existsSync(path.join(outputDir,name))&&fs.readFileSync(path.join(outputDir,name),'utf8')===value,'Stale or modified public artifact: '+name+'; run npm run data:build');
        } else install(outputDir,bytes,beforeReplace);
        return {mode:check?'check':'build',...summary,articleBodies:search.records.filter(x=>x.sections.length).length,metadataOnlyExceptions:search.warnings.length,generatedAt:manifest.generatedAt,inputFiles:inputs.length,publicFiles:Object.keys(bytes).length};
    } finally {cleanStage(stage);}
}
module.exports={build,install,inputInventory,checkPublicFiles};
if(require.main===module)build({check:process.argv.includes('--check')}).then(r=>console.log(JSON.stringify(r,null,2))).catch(error=>{console.error(error.message);process.exitCode=1;});
