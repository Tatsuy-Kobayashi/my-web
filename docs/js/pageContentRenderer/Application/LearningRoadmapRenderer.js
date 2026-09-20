// Article-only pedagogical view. No inference from hierarchy or ontology edges.
export const ROADMAP_EDGE_TYPES = {
    requires_before: { label: '必須前提', color: '#244c78', dash: '', arrow: true },
    recommended_before: { label: '推奨順序', color: '#376b50', dash: '9 4', arrow: true },
    helpful_before: { label: '補助', color: '#77613d', dash: '2 5', arrow: true },
    alternative_to: { label: '代替', color: '#865981', dash: '8 4', arrow: false },
    can_learn_with: { label: '並行学習', color: '#4a777a', dash: '3 4', arrow: false },
    enriches: { label: '発展・補強', color: '#916047', dash: '10 3 2 3', arrow: true }
};
const SVG_NS = 'http://www.w3.org/2000/svg';
// Resolved below relative to Application -> pageContentRenderer -> js -> docs.
const cssUrl = new URL('../../../', import.meta.url);
function html(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
}
function svg(tag, attrs, text) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs || {})) el.setAttribute(key, String(value));
    if (text !== undefined) el.textContent = text;
    return el;
}
function articleUrl(site) {
    if (!site || site.released !== 1) return null;
    try { const url = new URL(site.url); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}
export function ROADMAP_RenderLearningRoadmaps(siteData, current, data) {
    document.getElementById('learning-roadmap-panel')?.remove();
    const maps = (data?.roadmaps || []).filter(map => map.status === 'published' && map.nodes.some(n => n.siteId === current?.id));
    if (!maps.length) return;
    const anchor = document.getElementById('typed-relations-panel') || document.getElementById('article-page-topic') || document.getElementById('child-pages-list');
    const main = document.querySelector('.main, main, article');
    if (!anchor?.parentNode && !main) return;
    if (!document.getElementById('learning-roadmap-style')) {
        const link = html('link'); link.id = 'learning-roadmap-style'; link.rel = 'stylesheet';
        link.href = new URL('css/learningRoadmap.css', cssUrl).href; document.head.append(link);
    }
    const siteById = new Map(siteData.map(site => [site.id, site]));
    const panel = html('section', undefined, 'learning-roadmap'); panel.id = 'learning-roadmap-panel';
    panel.setAttribute('aria-labelledby', 'learning-roadmap-heading');
    const heading = html('h2', '学習ロードマップ'); heading.id = 'learning-roadmap-heading'; panel.append(heading);
    panel.append(html('p', '現在の記事を中心に、前提・次の学習・並行して取り組める項目を確認できます。矢印は凡例に示す方向で読みます。'));
    const selectorLabel = html('label', '対象・目的を選ぶ '), selector = html('select');
    maps.forEach((map, index) => { const option = html('option', map.title + ' — ' + map.audience); option.value = String(index); selector.append(option); });
    selectorLabel.append(selector); if (maps.length > 1) panel.append(selectorLabel);
    const view = html('div'); panel.append(view);
    const draw = () => {
        view.replaceChildren();
        const map = maps[Number(selector.value) || 0];
        const title = html('h3', map.title); view.append(title);
        const metadata = html('dl', undefined, 'learning-roadmap-meta');
        const duration = map.durationMinutes;
        for (const [label, value] of [['対象者', map.audience], ['到達目標', map.goal], ['想定既習事項', map.assumedKnowledge.join(' / ') || '特になし'], ['深度', map.depth], ['目安時間', duration.min + '〜' + duration.max + '分'], ['版', map.version]]) {
            metadata.append(html('dt', label), html('dd', value));
        }
        view.append(metadata);
        const focus = map.nodes.find(n => n.siteId === current.id);
        const labels = new Map(map.nodes.map(n => [n.id, n.siteId === undefined ? n.label : siteById.get(n.siteId)?.label || String(n.siteId)]));
        const W = 254, H = 138, left = 112, top = 62;
        const width = left + W * map.lanes.length + 18, height = top + H * map.stages.length + 18;
        const positions = new Map(map.nodes.map(n => [n.id, { x: left + map.lanes.findIndex(l => l.id === n.laneId) * W + 24, y: top + map.stages.findIndex(s => s.id === n.stageId) * H + 26 }]));
        const scroll = html('div', undefined, 'learning-roadmap-scroll'); scroll.tabIndex = 0;
        scroll.setAttribute('role', 'region'); scroll.setAttribute('aria-label', '学習ロードマップ図。スクロールできます。文章版は図の後にあります。');
        const board = html('div', undefined, 'learning-roadmap-board'); board.style.width = width + 'px'; board.style.height = height + 'px';
        map.lanes.forEach((lane, i) => { const label = html('div', lane.label, 'learning-roadmap-lane'); label.style.left = (left + i * W) + 'px'; label.style.width = W + 'px'; board.append(label); });
        map.stages.forEach((stage, i) => {
            const row = html('div', undefined, 'learning-roadmap-stage'); row.style.top = (top + i * H) + 'px'; row.style.height = H + 'px';
            row.append(html('span', stage.label)); board.append(row);
        });
        const drawing = svg('svg', { width, height, 'aria-hidden': 'true', focusable: 'false', class: 'learning-roadmap-lines' });
        const defs = svg('defs'); drawing.append(defs);
        for (const [type, style] of Object.entries(ROADMAP_EDGE_TYPES)) {
            const marker = svg('marker', { id: 'roadmap-arrow-' + type, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
            marker.append(svg('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: style.color })); defs.append(marker);
        }
        map.edges.forEach((edge, edgeIndex) => {
            const a = positions.get(edge.from), b = positions.get(edge.to), style = ROADMAP_EDGE_TYPES[edge.type];
            // Give converging edges distinct ports so one arrowhead cannot hide another.
            const outgoing = map.edges.filter(e => e.from === edge.from && positions.get(e.to).y !== a.y);
            const incoming = map.edges.filter(e => e.to === edge.to && positions.get(e.from).y !== b.y);
            let x1 = a.x + 198 * (outgoing.indexOf(edge) + 1) / (outgoing.length + 1), y1 = a.y + 72;
            let x2 = b.x + 198 * (incoming.indexOf(edge) + 1) / (incoming.length + 1), y2 = b.y;
            if (a.y === b.y) { x1 = a.x + (a.x < b.x ? 198 : 0); x2 = b.x + (a.x < b.x ? 0 : 198); y1 = y2 = a.y + 36; }
            else if (a.y > b.y) { y1 = a.y; y2 = b.y + 72; }
            const mid = (y1 + y2) / 2;
            let route = 'M ' + x1 + ' ' + y1 + ' L ' + x1 + ' ' + mid + ' L ' + x2 + ' ' + mid + ' L ' + x2 + ' ' + y2;
            if (Math.abs(a.y - b.y) > H) {
                // Long edges use the gap beside cards, rather than crossing intermediate cards.
                const direction = Math.sign(b.y - a.y), startGap = y1 + direction * 14, endGap = y2 - direction * 14;
                const gutter = a.x + 211 + (edgeIndex % 3) * 5;
                route = 'M ' + x1 + ' ' + y1 + ' V ' + startGap + ' H ' + gutter + ' V ' + endGap + ' H ' + x2 + ' V ' + y2;
            }
            const line = svg('path', { d: route, stroke: style.color, fill: 'none', 'stroke-width': edge.from === focus.id || edge.to === focus.id ? 3 : 1.7, 'stroke-dasharray': style.dash });
            if (style.arrow) line.setAttribute('marker-end', 'url(#roadmap-arrow-' + edge.type + ')');
            line.append(svg('title', {}, labels.get(edge.from) + ' → ' + labels.get(edge.to) + '：' + style.label)); drawing.append(line);
        });
        board.append(drawing);
        map.nodes.forEach(node => {
            const position = positions.get(node.id), site = siteById.get(node.siteId), url = articleUrl(site);
            const card = html(url ? 'a' : 'div', undefined, 'learning-roadmap-node' + (node.id === focus.id ? ' is-current' : ''));
            card.style.left = position.x + 'px'; card.style.top = position.y + 'px';
            if (url) card.href = url;
            if (node.id === focus.id) card.setAttribute('aria-current', 'page');
            card.append(html('span', node.id === focus.id ? '現在の記事' : site && !url ? '未公開の記事' : '学習項目', 'learning-roadmap-node-kind'), html('strong', labels.get(node.id)));
            board.append(card);
        });
        scroll.append(board); view.append(scroll);
        const center = html('button', '現在の記事を中央に表示'); center.type = 'button';
        const centerFocus = () => { const p = positions.get(focus.id); scroll.scrollLeft = Math.max(0, p.x + 99 - scroll.clientWidth / 2); scroll.scrollTop = Math.max(0, p.y + 36 - scroll.clientHeight / 2); };
        center.addEventListener('click', centerFocus); view.append(center);
        const legend = html('ul', undefined, 'learning-roadmap-legend');
        for (const [type, style] of Object.entries(ROADMAP_EDGE_TYPES)) {
            const item = html('li'); const swatch = svg('svg', { width: 42, height: 16, 'aria-hidden': 'true' });
            swatch.append(svg('path', { d: 'M 1 8 H 34', stroke: style.color, 'stroke-width': 2, 'stroke-dasharray': style.dash }));
            if (style.arrow) swatch.append(svg('path', { d: 'M 30 4 L 36 8 L 30 12', stroke: style.color, fill: 'none' }));
            item.append(swatch, document.createTextNode(' ' + style.label)); legend.append(item);
        }
        view.append(legend);
        const textView = html('details'); textView.append(html('summary', '学習項目・つながり・根拠を文章で読む'));
        const nodeList = html('ul'); map.nodes.forEach(n => { const li = html('li', labels.get(n.id) + (n.id === focus.id ? '（現在の記事）' : '') + ' — ' + map.lanes.find(l => l.id === n.laneId).label + ' / ' + map.stages.find(s => s.id === n.stageId).label); nodeList.append(li); });
        textView.append(nodeList);
        const edgeList = html('ul'); map.edges.forEach(e => edgeList.append(html('li', labels.get(e.from) + (ROADMAP_EDGE_TYPES[e.type].arrow ? ' → ' : ' ↔ ') + labels.get(e.to) + '【' + ROADMAP_EDGE_TYPES[e.type].label + '】' + e.rationale)));
        textView.append(edgeList, html('h4', 'ロードマップの根拠'));
        const evidence = html('ul'); map.evidence.forEach(e => evidence.append(html('li', e))); textView.append(evidence); view.append(textView);
        requestAnimationFrame(() => { if (scroll.isConnected) centerFocus(); });
    };
    selector.addEventListener('change', draw);
    if (anchor?.parentNode) anchor.after(panel); else main.append(panel);
    draw();
}
