// ----------------------------------------------------------------------------
// ファイル名    : generateKeywordEdges.js
// 名称          : キーワードエッジ生成スクリプト
// 説明          : siteData.jsonからキーワード共通のエッジを生成し、keywordEdges.jsonに出力する
// ex command   : C:\Works\codex\My-web>node docs\data\generateKeywordEdges.js
// ----------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');

const dataDir = __dirname;
const siteDataPath = path.join(dataDir, 'siteData.json');
const keywordEdgesPath = path.join(dataDir, 'keywordEdges.json');

function buildKeywordEdges(siteData) {

const keywordGroups = new Map();

for (const node of siteData) {
  const keywords = Array.isArray(node.keywords)
    ? [...new Set(node.keywords.map((keyword) => String(keyword).trim()).filter(Boolean))].sort()
    : [];

  for (const keyword of keywords) {
    if (!keywordGroups.has(keyword)) keywordGroups.set(keyword, []);
    keywordGroups.get(keyword).push(node);
  }
}

const pairMap = new Map();

for (const [keyword, nodesForKeyword] of [...keywordGroups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const nodes = [...nodesForKeyword].sort((a, b) => Number(a.id) - Number(b.id));
  if (nodes.length < 2) continue;

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const from = Number(nodes[i].id);
      const to = Number(nodes[j].id);
      const key = `${from}->${to}`;

      if (!pairMap.has(key)) {
        pairMap.set(key, {
          edgeId: `kw_${from}_${to}`,
          from,
          to,
          fromSiteId: from,
          toSiteId: to,
          type: 'keyword_shared',
          relationType: 'keyword_shared',
          direction: 'bidirectional',
          directed: false,
          keywords: [],
          label: '',
          edgeLabel: '',
          title: '',
          weight: 0,
          confidence: 1,
          evidence: {
            fromLabel: String(nodes[i].label || ''),
            fromLabelEn: String(nodes[i].labelEn || ''),
            toLabel: String(nodes[j].label || ''),
            toLabelEn: String(nodes[j].labelEn || ''),
            keywordStats: []
          }
        });
      }

      const edge = pairMap.get(key);
      const groupSize = nodes.length;
      edge.keywords.push(keyword);
      edge.evidence.keywordStats.push({
        keyword,
        nodeCount: groupSize
      });
      edge.weight = Math.min(1, edge.weight + (1 / Math.max(1, groupSize - 1)));
    }
  }
}

const edges = [...pairMap.values()]
  .sort((a, b) => (a.from - b.from) || (a.to - b.to))
  .map((edge) => {
    const keywords = [...new Set(edge.keywords)].sort();
    const keywordText = keywords.join(' / ');
    const label = keywords.length === 1 ? keywordText : keywordText;

    return {
      ...edge,
      keywords,
      label,
      edgeLabel: label,
      title: `共通タグ : ${keywordText} : ${edge.evidence.fromLabel} ↔ ${edge.evidence.toLabel}`,
      weight: Number(edge.weight.toFixed(4))
    };
  });

return edges;
}
module.exports = { buildKeywordEdges };
if (require.main === module) {
  const edges = buildKeywordEdges(JSON.parse(fs.readFileSync(siteDataPath, "utf8")));
  fs.writeFileSync(keywordEdgesPath, JSON.stringify(edges, null, 2) + "\n");
  console.log(`Generated ${edges.length} keyword edges.`);
}
