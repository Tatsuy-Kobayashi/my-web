// Public article extraction: URL path is the identity, never a basename match.
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const ORIGIN = 'https://tatsuy-kobayashi.github.io';
const PREFIX = '/my-web/docs/';
function articlePath(url, htmlDir = path.resolve(__dirname, '..')) {
    const u = new URL(url);
    if (u.origin !== ORIGIN || !u.pathname.startsWith(PREFIX)) throw new Error('Unsupported article URL');
    const relative = decodeURIComponent(u.pathname.slice(PREFIX.length));
    if (!relative.endsWith('.html')) return null; // Placeholder URLs have metadata only.
    const root = path.resolve(htmlDir), file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) throw new Error('Article path outside docs');
    if (fs.existsSync(file) && !fs.realpathSync(file).startsWith(fs.realpathSync(root) + path.sep)) throw new Error('Article symlink outside docs');
    return file;
}
const normalize = s => String(s || '').replace(/\s+/g, ' ').trim();
function extractArticle(html) {
    const $ = cheerio.load(html);
    const description = normalize($('meta[name="description"]').attr('content'));
    const keywords = [...new Set(($('meta[name="keywords"]').attr('content') || '').split(',').map(normalize).filter(Boolean))];
    // Existing pages put the article in .main; main/article cover newer templates.
    const main = $('.main').first().length ? $('.main').first() : $('main, article').first();
    if (!main.length) return { sections: [], description, keywords, missingContainer: true };
    main.find('script,style,noscript,nav,header,footer,aside,sup,rp,rt,.annotation,.under-entry-content,#child-pages-list,#typed-relations-panel,#learning-roadmap-panel,.breadcrumb_list,.breadcrumb-list,.toc-content,.date-info,.related-entries,.pager-post-navi,.popular_entries,.categories,.tag-list').remove();
    const sections = [];
    let current = null, skip = false;
    main.find('h1,h2,h3,h4,p,li,figcaption,pre,blockquote').each((_, el) => {
        const tag = el.tagName.toLowerCase(), node = $(el);
        if (!/^h/.test(tag) && node.parents('p,li,figcaption,pre,blockquote').length) return;
        const text = normalize(node.text());
        if (!text) return;
        if (/^h/.test(tag)) {
            if (tag === 'h1') return;
            skip = /^(目次|関連項目|人気記事|カテゴリー|カテゴリ|左右記事|前後の記事|参考文献|注釈|脚注)$/.test(text);
            current = null;
            if (!skip) { current = { h2:text, level:Number(tag[1]), heading:text, text:'', order:sections.length+1 }; sections.push(current); }
        } else if (!skip) {
            if (!current) { current = { h2:'本文', level:2, heading:'本文', text:'', order:sections.length+1 }; sections.push(current); }
            current.text = normalize(current.text + ' ' + text);
        }
    });
    return { sections, description, keywords, missingContainer:false };
}
function buildSearchSource(siteData, { htmlDir = path.resolve(__dirname, '..'), metadataOnly = [] } = {}) {
    const exceptions = new Map(metadataOnly.map(x => [x.siteId,x]));
    if (exceptions.size !== metadataOnly.length) throw new Error('Duplicate metadata-only exception');
    const usedExceptions = new Set(), inputs = [], warnings = [];
    const records = siteData.map(item => {
        const file = item.released === 1 ? articlePath(item.url, htmlDir) : null;
        let article = { sections:[], description:'', keywords:[] };
        if (file) {
            const exists = fs.existsSync(file);
            inputs.push(file);
            if (exists) {
                if (exceptions.has(item.id)) throw new Error(`Remove resolved HTML exception: ${item.id}`);
                article = extractArticle(fs.readFileSync(file, 'utf8'));
                if (article.missingContainer) throw new Error(`Article container missing: ${item.id}`);
            } else {
                if (!exceptions.has(item.id)) throw new Error(`Released HTML missing: ${item.id}`);
                usedExceptions.add(item.id);
                warnings.push(`id=${item.id}: metadata only; ${exceptions.get(item.id).reason}`);
            }
        }
        return { id:item.id, label:item.label, labelEn:item.labelEn, description:item.description || article.description,
            sections:article.sections, keywords:item.keywords || article.keywords, iconClass:item.iconClass || '' };
    });
    for (const id of exceptions.keys()) if (!usedExceptions.has(id)) throw new Error(`Unused HTML exception: ${id}`);
    return { records, warnings, inputs:[...new Set(inputs)].sort() };
}
module.exports = { buildSearchSource, articlePath, extractArticle };
if (require.main === module) {
    // Individual generators are diagnostics; the supported publication command is npm run data:build.
    const args = process.argv.slice(2);
    const value = name => args.find(x=>x.startsWith(name+'='))?.slice(name.length+1) || args[args.indexOf(name)+1];
    const htmlDir = args.some(x=>x=== '--html-dir'||x.startsWith('--html-dir=')) ? value('--html-dir') : path.resolve(__dirname,'..');
    const site = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../data/source/siteData.json'),'utf8'));
    const policy = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../data/source/searchPolicy.json'),'utf8'));
    const { records,warnings } = buildSearchSource(site,{htmlDir,metadataOnly:policy.metadataOnly});
    if (!args.includes('--dry-run')) fs.writeFileSync(path.join(__dirname,'searchSource.json'),JSON.stringify(records,null,2)+'\n');
    console.log(JSON.stringify({records:records.length,warnings:warnings.length}));
}
