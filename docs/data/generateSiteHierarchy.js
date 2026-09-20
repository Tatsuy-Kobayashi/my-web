const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

async function readSiteHierarchy(dataDir = __dirname) {
    const { attachHierarchy } = await import('../js/common/siteHierarchy/Hierarchy.mjs');
    const bytes = fs.readFileSync(path.join(dataDir, 'siteData.json'));
    const sourceHash = createHash('sha256').update(bytes).digest('hex');
    const source = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
    const hierarchy = JSON.parse(fs.readFileSync(path.join(dataDir, 'siteHierarchy.json'), 'utf8').replace(/^\uFEFF/, ''));
    return { nodes: attachHierarchy(source, hierarchy, sourceHash), hierarchy };
}
async function generateSiteHierarchy({ dataDir = __dirname, check = false } = {}) {
    const { compileHierarchy } = await import('../js/common/siteHierarchy/Hierarchy.mjs');
    const bytes = fs.readFileSync(path.join(dataDir, 'siteData.json'));
    const sourceHash = createHash('sha256').update(bytes).digest('hex');
    const result = compileHierarchy(JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')), { sourceHash });
    const output = path.join(dataDir, 'siteHierarchy.json');
    if (check) {
        await readSiteHierarchy(dataDir);
    } else {
        const temp = `${output}.tmp`;
        fs.writeFileSync(temp, JSON.stringify(result, null, 2) + '\n');
        fs.renameSync(temp, output);
    }
    for (const warning of result.warnings) console.warn(warning);
    return result;
}
module.exports = { generateSiteHierarchy, readSiteHierarchy };
if (require.main === module) generateSiteHierarchy({ check: process.argv.includes('--check') })
    .then(result => console.log(`hierarchy: ${result.nodes.length} nodes, ${result.edges.length} edges`))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
