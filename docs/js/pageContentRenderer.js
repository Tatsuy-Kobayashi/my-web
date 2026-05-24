// ----------------------------------------------------------------------------
// ファイル名    : pageContentRenderer.js
// 名称          : ページの各パーツを生成するスクリプト
// 内容          : ページの内容に応じて、関連リンクやナビゲーションリンクを生成・挿入する
// このプログラムの著作権及び、このプログラムに関する技術は（株）Fibrantixがその知的財産権を所有し
// ており、所有者の事前の許可なくその全部又は一部を問わず、第三者に開示してはならない。
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async function () {
    // 1. データの取得 (パスは実際の環境に合わせて調整してください)
    //const response = await fetch('../../../../../siteData.json');
    //const data = await response.json();

    // ------------------------
    // データ（ノード）
    // ------------------------
    // id: ノードID
    // label: ラベル
    // labelEn: 英語ラベル
    // url: ノードクリック時に開くURL
    // level: 深さ（現在は学問のみが明示的に持つ）
    // mainPath: ルートからのパス情報（多親対応）
    // auxPath: 補助パス情報（複数可、多親対応）
    // released: 公開フラグ（0: 未公開、1: 公開）
    // isPaid: 有料フラグ（0: 無料、1: 有料）
    // datePublished: 公開日
    // dateModified: 更新日
    // description: ノード説明文
    // keywords: タグ配列
    // iconClass: アイコンのCSSクラス（FontAwesome等）
    // imageUrl: プレビュー画像のURL
    // thumbnailUrl: サムネイル画像のURL配列（複数解像度対応）
    // ------------------------
    console.log('[INIT] Loading siteData...');
    const siteData = await fetch('https://tatsuy-kobayashi.github.io/my-web/docs/data/siteData.json').then(response => response.json());

    // ------------------------
    // 概念エンティティ
    // ------------------------
    // conceptId: 概念ID（siteData.json から生成）
    // siteRef: 関連サイトデータ
    //      id: サイトID（siteData.json から生成）
    //      label: サイトラベル（siteData.json から生成）
    //      labelEn: サイト英語ラベル（siteData.json から生成）
    //      mainPath: ルートからのパス情報（siteData.json から生成）
    //      url: サイトURL（siteData.json から生成）
    //      released: 公開フラグ（siteData.json から生成）
    //      isPaid: 有料フラグ（siteData.json から生成）
    // labels: 概念ラベル配列
    //      ja: 日本語ラベル（siteData.json から生成）
    //      en: 英語ラベル（siteData.json から生成）
    // kind: 概念種別（固有データ）
    // description: 概念説明文（固有データ）
    // aliases: 概念の別名配列（固有データ）
    // tags: 概念タグ配列（固有データ）
    // parentConceptIds: 親概念ID配列（siteData.json のツリー構造そのもの）
    // childConceptIds: 子概念ID配列（siteData.json のツリー構造そのもの）
    // searchHints: 検索ヒント配列（固有データ）
    // notes: 備考（固有データ）
    // ------------------------
    console.log('[INIT] Loading concepts...');
    const concepts = await fetch('https://tatsuy-kobayashi.github.io/my-web/docs/data/concepts.json').then(response => response.json()).catch(() => []);

    // ------------------------
    // 型付き辺
    // ------------------------
    // relationId: 概念同士の関連ID
    // from: 前提ID（関連の出発点となる概念）
    // to: 支援ID（関連の到着点となる概念）
    // type: 関係の種別
    // inverseType: 逆関係の種別（存在する場合）
    // confidence: 確信度（0.0～1.0の数値、存在する場合）
    // weight: 重み（0.0～1.0の数値、存在する場合）
    // evidence: 確認情報（複数可）
    //      sitePath: サイトのパス情報
    //      siteId: サイトID
    // note: 備考
    // ------------------------
    console.log('[INIT] Loading relations...');
    const relations = await fetch('https://tatsuy-kobayashi.github.io/my-web/docs/data/relations.json').then(response => response.json()).catch(() => []);

    // ------------------------
    // 型付き辺の種別（Webページの変化に依存せず、（基本）固定の資産として保存）
    // ------------------------
    console.log('[INIT] Loading relationTypes...');
    const relationTypesData = await fetch('https://tatsuy-kobayashi.github.io/my-web/docs/data/relationTypes.json').then(response => response.json()).catch(() => ({ relationTypes: [] }));
    const relationTypes = Array.isArray(relationTypesData.relationTypes) ? relationTypesData.relationTypes : [];

    // 本来はここで fetch('/api/stats/popular') 等を行う
    // const viewStats = await fetch('/api/popular').then(r => r.json());
    // container.innerHTML = 'Loading popular articles...';

    // ------------------------
    // データ（記事閲覧数）
    // ------------------------
    const viewStats = [
        { id: 3011, label: "集合論",  url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/set_theory.html", totalViews: 90210, weeklyViews: 420, monthlyViews: 1800 },
        { id: 304022, label: "特殊関数", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_functions/special_functions/special_functions.html", totalViews: 80123, weeklyViews: 380, monthlyViews: 1600 }
    ];

    // 2. 現在の記事ノードを特定
    try {
        // URLの末尾（例: mathematics.html）やフルパスで照合
        const currentUrl = window.location.href.split('?')[0].split('#')[0];
        console.log('Current URL:', currentUrl);

        // siteDataのurlと一致するものを探す（末尾一致などで柔軟に判定しても良い）
        //const currentNode = data.find(n => n.url && n.url === currentUrl);
        console.log(currentUrl.split('/').pop());
        const currentNode = siteData.find(n => n.url && (n.url === currentUrl || n.url.endsWith(currentUrl.split('/').pop())));
        console.log('Current node:', currentNode);

        if (!currentNode) {
            console.warn('Current node not found in siteData.');
            return;
        }

        // --- 各パーツの生成実行 ---
        // A. パンくずリスト生成
        renderBreadcrumbs(siteData, currentNode);
        // B. 公開日・編集日生成
        renderDateInfo(currentNode);
        // C. 下層記事一覧生成
        renderChildList(siteData, currentNode, maxDepth = 3);
        // D. タグ一覧生成
        renderTagList(currentNode);
        // D2. 型付き概念関係生成
        renderTypedRelations(siteData, currentNode, concepts, relations, relationTypes);
        // E. 関連記事リンク生成
        renderRelatedLinks(siteData, currentNode);
        // F. 前後記事リンク生成
        renderPager(siteData, currentNode);
        // G. 人気記事（これだけは別途 Views API等が必要ですが、枠組みだけ用意）
        renderPopularSection(siteData, viewStats);
        // H. カテゴリー一覧生成
        renderCategoryList(siteData);
    } catch (error) {
        console.error('Error initializing page components:', error);
    }

    // --- 3. 生成関数の定義 ---

    // A. パンくずリスト <div class="breadcrumb_list">
    function renderBreadcrumbs(allData, current) {
        const container = document.getElementById('breadcrumb-list');
        if (!container) return;

        const makeNodeHtml = (pathNode, asLink = true) => {
            if (!pathNode) return '';

            let nodeHtml = '<span class="link-container">';

            // iタグ（iconClass がある場合のみ）
            let icon = '';
            if (pathNode.iconClass)
            {
                icon += `<i class="fa fa-solid ${pathNode.iconClass}" style="margin-right:5px;"></i>`;
            } else if (pathNode.iconUrl)
            {   // 代わりに iconUrl がある場合
                icon += `<span class="icon ${pathNode.iconClass}" style="margin-right:5px;"></span>`;
            }

            // aタグ: preview-link 属性
            const desc = pathNode.description || '説明はありません。';
            const img = pathNode.imageUrl || '';
            if (asLink && Number(pathNode.released) === 1 && pathNode.url) {
                nodeHtml += `<a href="${pathNode.url}" class="preview-link" data-title="${pathNode.label}" data-description="${desc}" data-image="${img}">${icon}${pathNode.label}</a>`;
                // link-preview div
                nodeHtml += `<div class="link-preview"><a href="${pathNode.url}" class="link-preview-clickable">${img ? `<img class="preview-image" src="${img}" alt="Preview image">` : `<img class="preview-image" src="" alt="Preview image" style="display:none;">`}`
                nodeHtml += `<h3 class="preview-title">${pathNode.label}</h3><p class="preview-description">${desc}</p></a></div></span>`;
                return nodeHtml;
            } else {
                // 非公開 or リンク無しはプレーン表示（アイコン含む）
                return `${icon}${pathNode.label}`;
            }
        };

        // options:
        //  - includeHome: boolean (first column only)
        //  - treatAsMain: boolean (mainPath column: exclude last id because it's current)
        const renderColumnFromPath = (pathStr, options = {}) => {
            const { includeHome = false, treatAsMain = false } = options;
            if (!pathStr || typeof pathStr !== 'string') return '';
            const parts = pathStr.split(':').map(s => parseInt(s, 10)).filter(n => Number.isFinite(n));
            if (parts.length === 0) return '';

            let html = `<div class="breadcrumb_list_part">`;
            if (includeHome) {
                html += `<a href="https://tatsuy-kobayashi.github.io/my-web/docs/"><i class="fa fa-home fa-fw" aria-hidden="true" style="margin-right:5px;"></i><span>Home</span></a>`;
            }

            // path からリンクとしてレンダリングするエンドポイントインデックスを決定する
            const lastIndexToRender = treatAsMain ? parts.length - 2 : parts.length - 1; // main: exclude last (current)
            for (let i = 0; i <= lastIndexToRender; i++) {
                const id = parts[i];
                if (i === 0 && includeHome === false) {
                    // optionally skip adding separator for very first element if Home not present
                }
                const pathNode = allData.find(n => n && n.id === id);
                if (!pathNode) continue;
                html += `<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>`;
                html += makeNodeHtml(pathNode, true);
            }

            // For mainPath column: append the current article label (no link) as final item
            if (treatAsMain) {
                html += `<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>`;
                if (current.iconClass) {
                    html += `<i class="fa fa-solid ${current.iconClass}" style="margin-right:5px;"></i>`;
                } else if (current.iconUrl) {
                    html += `<span class="icon ${current.iconClass}" style="margin-right:5px;"></span>`;
                }
                html += `<span>${current.label || ''}</span>`;
            }

            html += `</div>`;
            return html;
        };

        // collect mainPath (prefer first) and auxPaths (array)
        const getFirstPath = (node) => {
            if (!node) return '';
            if (Array.isArray(node.mainPath) && node.mainPath.length > 0) return node.mainPath[0];
            if (typeof node.mainPath === 'string') return node.mainPath;
            return '';
        };
        const mainPath = getFirstPath(current);
        const auxPaths = [];
        if (current && current.auxPath) {
            if (Array.isArray(current.auxPath)) {
                current.auxPath.forEach(p => { if (p && p !== mainPath) auxPaths.push(p); });
            } else if (typeof current.auxPath === 'string' && current.auxPath !== mainPath) {
                auxPaths.push(current.auxPath);
            }
        }

        // 列の構築: 最初にメイン列 (Home を含む)、次に auxPath ごとに 1 つの列
        let finalHtml = '';
        if (mainPath) {
            finalHtml += renderColumnFromPath(mainPath, { includeHome: true, treatAsMain: true });
        } else {
            // fallback: only Home + current label
            finalHtml += `<div class="breadcrumb_list_part"><a href="https://tatsuy-kobayashi.github.io/my-web/docs/"><i class="fa fa-home fa-fw" aria-hidden="true" style="margin-right:5px;"></i><span>Home</span></a>`;
            finalHtml += `<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>`;
            finalHtml += `<span>${current.label || ''}</span></div>`;
        }

        // auxPath 列も Home を先頭に表示し、最後に current のラベルを付けているが、それぞれを非表示にすることもできる。可能性としては、Git のブランチの様に表示できないか検討中
        auxPaths.forEach(ap => {
            finalHtml += renderColumnFromPath(ap, { includeHome: true, treatAsMain: true });
        });

        container.innerHTML = finalHtml;
    }

    /**
     * 公開日/編集日
     */
    function renderDateInfo(current) {
        const container = document.getElementById('date-info');
        if (!container) return;

        // ISO文字列を想定 (例: "2020-02-15T09:40:52Z")
        const rawPub = current.datePublished || null;
        const rawRev = current.dateModified || null;

        // Date に安全に変換
        const toDateSafe = (v) => {
            if (!v) return null;
            if (v instanceof Date) return isNaN(v) ? null : v;
            const d = new Date(v);
            return isNaN(d) ? null : d;
        };

        const pubDateObj = toDateSafe(rawPub);
        let revDateObj = toDateSafe(rawRev);

        // ===== 応急処置ロジック =====
        // 公開日 > 編集日 の場合は 編集日 = 公開日 に補正
        if (pubDateObj && revDateObj && pubDateObj.getTime() > revDateObj.getTime()) {
            console.warn('[date-info] dateModified is earlier than datePublished. ', {datePublished: pubDateObj.toISOString(), dateModified: revDateObj.toISOString(), source: current});
            revDateObj = new Date(pubDateObj.getTime());
        }

        /**
         * Date → ISO文字列
         */
        const toISOStringSafe = (d) => (d ? d.toISOString() : '');

        const pubDate = toISOStringSafe(pubDateObj);
        const revDate = toISOStringSafe(revDateObj);

        let html = '';
        if (pubDate) {
            const display = pubDate.split('T')[0];
            const parts = display.split('-');
            const y = parts[0] || '';
            const m = parts[1] || '';
            const d = parts[2] || '';
            html += `<span><i class="fa fa-pencil"></i>&ensp;<time datetime="${pubDate}" title="${pubDate}">公開日: <span class="date-year">${y}</span><span class="hyphen">年</span><span class="date-month">${m}</span><span class="hyphen">月</span><span class="date-day">${d}</span>日</time></span>`;
        }
        if (revDate) {
            const display = revDate.split('T')[0];
            const parts = display.split('-');
            const y = parts[0] || '';
            const m = parts[1] || '';
            const d = parts[2] || '';
            html += `<span style="margin-left:0.8em;"><i class="fa fa-refresh"></i>&ensp;<time datetime="${revDate}" title="${revDate}" class="updated">更新: <span class="date-year">${y}</span><span class="hyphen">年</span><span class="date-month">${m}</span><span class="hyphen">月</span><span class="date-day">${d}</span>日</time></span>`;
        }

        container.innerHTML = html;
    }

    // **
    // * 下層記事一覧（階層構造メニュー）生成関数
    // * levelが現在より下（数値が大きい）記事を表示
    // * @param {Array|Object} allData siteData.jsonの中身
    // * @param {Object} currentEntry 現在の記事データ
    //
    function renderChildList(allData, current, maxDepth) {
        const container = document.getElementById('child-pages-list');
        if (!container) return;

        // siteData（allData）から子孫を取得する。
        // current.dir_path に依存せず mainPath を用いた抽出に委ねる。
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }

        // mainPath を使って現在ノードの下位（descendant）を階層的に表示する実装
        const getFirstPath = (node) => {
            if (!node) return '';
            if (Array.isArray(node.mainPath) && node.mainPath.length > 0) return node.mainPath[0];
            if (typeof node.mainPath === 'string') return node.mainPath;
            return '';
        };

        const currentPath = getFirstPath(current);
        if (!currentPath) return;

        // currentPath の下位にあるノードを descendants として抽出
        const descendants = allData.filter(item => {
            const mps = Array.isArray(item.mainPath) ? item.mainPath : [item.mainPath];
            return mps.some(mp => typeof mp === 'string' && mp.startsWith(currentPath + ':'));
        });

        const currentId = current && current.id;
        // map: key=node.id -> { node, matchedAuxPaths: [], matchedPenultimateIds: Set }
        const auxMatchesMap = new Map();
        if (currentId != null) {
            allData.forEach(item => {
                if (!item || !item.auxPath) return;
                const auxArr = Array.isArray(item.auxPath) ? item.auxPath : [item.auxPath];
                auxArr.forEach(ap => {
                    if (typeof ap !== 'string') return;
                    // 数値配列化
                    const parts = ap.split(':').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
                    if (parts.length === 0) return;
                    // currentId を含む auxPath のみ扱う
                    if (!parts.includes(currentId)) return;
                    // penultimate を抽出（length>=2 でなければ無視）
                    const penultimate = parts.length >= 2 ? parts[parts.length - 2] : null;
                    if (!auxMatchesMap.has(item.id)) {
                        auxMatchesMap.set(item.id, { node: item, matchedAuxPaths: [], matchedPenultimateIds: new Set() });
                    }
                    const entry = auxMatchesMap.get(item.id);
                    entry.matchedAuxPaths.push(ap);
                    if (Number.isFinite(penultimate)) entry.matchedPenultimateIds.add(penultimate);
                });
            });
        }
        // auxMatchesMap を配列化（必要に応じて descendants と併合して扱う）
        const auxMatches = Array.from(auxMatchesMap.values());
        console.log('auxMatches:', auxMatches);

        // parentId -> [ { tailId, node }, ... ] 形式に変換しておく
        const auxInsertionsByParent = new Map();
        auxMatchesMap.forEach(({ node, matchedAuxPaths }) => {
            if (!Array.isArray(matchedAuxPaths)) return;
            matchedAuxPaths.forEach(ap => {
                if (typeof ap !== 'string') return;
                const parts = ap.split(':').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
                if (parts.length < 2) return; // penultimate + tail が必要
                const penultimate = parts[parts.length - 2];
                const tail = parts[parts.length - 1];
                if (!Number.isFinite(penultimate) || !Number.isFinite(tail)) return;
                const arr = auxInsertionsByParent.get(penultimate) || [];
                arr.push({ tailId: tail, node });
                auxInsertionsByParent.set(penultimate, arr);
            });
        });

        if (!descendants || descendants.length === 0) return;

        // parentPath の直下だけを返す（直下の子）
        const immediateChildrenOf = (parentPath) => {
            const parentParts = parentPath.split(':').filter(Boolean);
            const results = [];
            descendants.forEach(item => {
                const mps = Array.isArray(item.mainPath) ? item.mainPath : [item.mainPath];
                mps.forEach(mp => {
                    if (typeof mp !== 'string') return;
                    if (!mp.startsWith(parentPath + ':')) return;
                    const parts = mp.split(':').filter(Boolean);
                    if (parts.length === parentParts.length + 1) {
                        if (!results.find(r => r.id === item.id)) {
                            results.push(item);
                        }
                    }
                });
            });

            // --- auxPath による挿入: auxMatchesMap から parentPath の最後の ID を親として参照するものを追加 ---
            const parentId = parseInt(parentParts[parentParts.length - 1], 10);
            if (!Number.isNaN(parentId)) {
                const insertions = auxInsertionsByParent.get(parentId);
                if (Array.isArray(insertions) && insertions.length > 0) {
                    insertions.forEach(({ tailId, node }) => {
                        // 重複挿入を避ける:
                        const exists = results.some(r => {
                            // 既に同ノードを mainPath として追加済み（同じ実ノードID）ならスキップ
                            if (!r.__isAux && r.id === node.id) return true;
                            // 既に同じ aux 挿入（同じ元ノード & tail）を追加済みならスキップ
                            if (r.__isAux && r.__auxOriginalId === node.id && r.__auxTailId === tailId) return true;
                            return false;
                        });
                        if (!exists) {
                            // 合成オブジェクト: ソートキーとして __auxTailId を持たせる（id は変更しない）
                            const synthetic = Object.assign({}, node, {
                                __isAux: true,
                                __auxOriginalId: node.id,
                                __auxTailId: tailId
                            });
                            results.push(synthetic);
                        }
                    });
                }
            }
            // ソート: aux 挿入ノードは __auxTailId を優先キーとする。なければ mainPath の末尾ID、最後に node.id。
            const getSortKey = (item) => {
                if (item && Number.isFinite(item.__auxTailId)) return item.__auxTailId;
                const p = getFirstPath(item) || '';
                if (p) {
                    const last = parseInt(p.split(':').pop(), 10);
                    if (Number.isFinite(last)) return last;
                }
                return (item && Number.isFinite(item.id)) ? item.id : 0;
            };
            results.sort((a, b) => getSortKey(a) - getSortKey(b));
            return results;
        };

        // preview-link 構造に合わせた HTML を作るヘルパ
        const makePreviewHtml = (node) => {
            if (Number(node.released) === 1) {
                const desc = node.description || '説明はありません。';
                const img = node.imageUrl || '';
                let s = `<div class="link-container">`;
                s += `<a href="${node.url}" class="preview-link" data-title="${(node.label||'').replace(/\"/g,'&quot;')}" data-description="${(desc||'').replace(/\"/g,'&quot;')}" data-image="${img}">${node.label}</a>`;
                s += `<div class="link-preview">`;
                s += `<a href="${node.url}" class="link-preview-clickable">`;
                if (img) s += `<img class="preview-image" src="${img}" alt="Preview image">`;
                else s += `<img class="preview-image" src="" alt="Preview image" style="display:none;">`;
                s += `<h3 class="preview-title">${node.label}</h3>`;
                s += `<p class="preview-description">${desc}</p>`;
                s += `</a>`;
                s += `</div>`;
                s += `</div>`;
                return s;
            } else {
                return `${node.label}`;
            }
        };

        // 再帰的にリストを構築
        const buildList = (parentPath, depth = 0, maxDepth) => {
            const children = immediateChildrenOf(parentPath);
            if (!children || children.length === 0) return '';
            let out = '';
            children.forEach(child => {
                const childPath = getFirstPath(child);
                const hasDesc = descendants.some(d => {
                    const dps = Array.isArray(d.mainPath) ? d.mainPath : [d.mainPath];
                    return dps.some(mp => typeof mp === 'string' && mp.startsWith(childPath + ':'));
                });
                out += '<li class="li_pulldownList">';
                // 深い子を持つ場合または現在ノードの直下の子（parentPath === currentPath）の場合は
                // <details><summary> でラップする。ただし内部リストは存在する場合のみ追加する。
                if ((hasDesc || parentPath === currentPath) && depth < maxDepth) {
                    out += '<details class="details_pulldownList">';
                    out += `<summary class="summary_pulldownList">${makePreviewHtml(child)}</summary>`;
                    const inner = buildList(childPath, depth + 1, maxDepth);
                    if (inner) out += inner;
                    out += '</details>';
                } else {
                    out += makePreviewHtml(child);
                }
                out += '</li>';
            });
            return out;
        };

        let html = '<ul class="ul_pulldownList">';
        html += buildList(currentPath, 0, maxDepth);
        html += '</ul> <!-- /.ul_pulldownList -->';

        container.innerHTML = html;
    }

    /**
     * タグリスト生成
     */
    function renderTagList(current) {
        const container = document.getElementById('article-page-topic');
        if (!container) return;

        const keywords = Array.isArray(current && current.keywords) ? current.keywords : [];
        if (keywords.length === 0) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        html += '<dl>';
        html += '<dt>関連タグ</dt>';
        html += '<dd>';

        // Hash function (djb2)
        function djb2Hash(str) {
            let h = 5381;
            for (let i = 0; i < str.length; i++) {
                h = ((h << 5) + h) + str.charCodeAt(i);
                h = h & 0xFFFFFFFF;
            }
            return (h >>> 0).toString(16);
        }

        keywords.forEach((kw, idx) => {
            // Generate search URL
            const base = kw;
            const type = 'tag';
            const normalized = kw;
            const payload = String(base) + '|' + type + '|' + JSON.stringify(normalized);
            const hash = djb2Hash(payload);
            const ts = Date.now();
            const frag = 'q=' + encodeURIComponent(String(base)) + '&type=' + encodeURIComponent(type) + '&h=' + hash + '&ts=' + ts;
            const tagUrl = `https://tatsuy-kobayashi.github.io/my-web/docs/search/integratedSearch.html#${frag}`;

            html += `<span class="topic-label" data-index="${idx}">`;
            html += `<a href="${tagUrl}"><span class="topic-label-text"># ${String(kw)}</span></a>`;
            html += `</span>`;
        });

        html += '</dd>';
        html += '</dl>';

        container.innerHTML = html;
    }

    /**
     * 型付き概念関係
     */
    function renderTypedRelations(allData, current, conceptData, relationData, relationTypeData) {
        if (!current || !Array.isArray(conceptData) || !Array.isArray(relationData)) return;

        const currentConcept = conceptData.find(concept => concept && concept.siteRef && Number(concept.siteRef.id) === Number(current.id));
        if (!currentConcept) return;

        const relationTypeMap = new Map();
        if (Array.isArray(relationTypeData)) {
            relationTypeData.forEach(typeDef => {
                if (typeDef && typeDef.type) relationTypeMap.set(typeDef.type, typeDef);
            });
        }

        const conceptById = new Map(conceptData.map(concept => [concept.conceptId, concept]));
        const siteById = new Map((Array.isArray(allData) ? allData : []).map(node => [Number(node.id), node]));
        const relatedRelations = relationData.filter(relation =>
            relation && (relation.from === currentConcept.conceptId || relation.to === currentConcept.conceptId)
        );

        const existingContainer = document.getElementById('typed-relations-panel');
        const container = existingContainer || document.createElement('section');
        container.id = 'typed-relations-panel';
        container.className = 'typed-relations-panel';

        if (!existingContainer) {
            const tagContainer = document.getElementById('article-page-topic');
            if (tagContainer && tagContainer.parentNode) {
                tagContainer.insertAdjacentElement('afterend', container);
            } else {
                const relatedContainer = document.getElementById('related-entries');
                if (relatedContainer && relatedContainer.parentNode) {
                    relatedContainer.parentNode.insertBefore(container, relatedContainer);
                }
            }
        }

        if (!container) return;
        if (relatedRelations.length === 0) {
            container.innerHTML = '';
            return;
        }

        const escapeHtml = (str) => String(str == null ? '' : str).replace(/[&<>"']/g, ch => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));

        const getConceptLabel = (concept) => {
            if (!concept) return '';
            return (concept.labels && concept.labels.ja) || (concept.siteRef && concept.siteRef.label) || concept.conceptId || '';
        };

        const getConceptUrl = (concept) => {
            if (!concept || !concept.siteRef) return '';
            const siteNode = siteById.get(Number(concept.siteRef.id));
            return (siteNode && siteNode.url) || concept.siteRef.url || '';
        };

        const grouped = new Map();
        relatedRelations.forEach(relation => {
            const isOutgoing = relation.from === currentConcept.conceptId;
            const type = isOutgoing ? relation.type : (relation.inverseType || relation.type);
            if (!grouped.has(type)) grouped.set(type, []);
            grouped.get(type).push(Object.assign({}, relation, { __isOutgoing: isOutgoing, __displayType: type }));
        });

        const sortByWeight = (a, b) => Number(b.weight || b.confidence || 0) - Number(a.weight || a.confidence || 0);

        let html = '<section class="typed-relations">';
        html += '<h2 class="typed-relations-heading">型付き関係</h2>';
        html += '<div class="typed-relations-groups">';

        Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).forEach(([type, items]) => {
            const typeDef = relationTypeMap.get(type) || {};
            const typeLabel = typeDef.label || type;
            const typeDescription = typeDef.description || '';
            html += '<section class="typed-relations-group">';
            html += `<h3 class="typed-relations-type" title="${escapeHtml(typeDescription)}">${escapeHtml(typeLabel)}</h3>`;
            html += '<ul class="typed-relations-list">';

            items.sort(sortByWeight).forEach(relation => {
                const targetConceptId = relation.__isOutgoing ? relation.to : relation.from;
                const targetConcept = conceptById.get(targetConceptId);
                const targetLabel = getConceptLabel(targetConcept) || targetConceptId;
                const targetUrl = getConceptUrl(targetConcept);
                const score = relation.weight != null ? relation.weight : relation.confidence;
                const scoreText = Number.isFinite(Number(score)) ? ` <span class="typed-relation-score">(${Number(score).toFixed(2)})</span>` : '';
                const noteText = relation.note ? `<span class="typed-relation-note">${escapeHtml(relation.note)}</span>` : '';
                const targetHtml = targetUrl
                    ? `<a href="${escapeHtml(targetUrl)}">${escapeHtml(targetLabel)}</a>`
                    : `<span>${escapeHtml(targetLabel)}</span>`;

                html += '<li class="typed-relation-item">';
                html += `<span class="typed-relation-target">${targetHtml}</span>${scoreText}`;
                html += noteText;
                html += '</li>';
            });

            html += '</ul>';
            html += '</section>';
        });

        html += '</div>';
        html += '</section>';
        container.innerHTML = html;
    }

    /**
     * 関連記事リンク
     * mainPath に基づいて同じ親を持つ兄弟ノードから関連リンクを生成
     */
    function renderRelatedLinks(allData, current) {
        const container = document.getElementById('related-entries');
        if (!container) return;

        // allData を配列に統一
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }

        // 現在のノードがタグを持つか確認
        const currentKeywords = Array.isArray(current && current.keywords) ? current.keywords : [];
        if (currentKeywords.length === 0) {
            container.innerHTML = '';
            return;
        }

        // 同じタグを持つ記事をプール（ただし current 自身は除外）
        const relatedPool = allData.filter(item => {
            // 自身は除外
            if (item.id === current.id) return false;
            // リリースされていない記事は除外
            if (Number(item.released) !== 1) return false;
            // タグがない場合は除外
            const itemKeywords = Array.isArray(item.keywords) ? item.keywords : [];
            if (itemKeywords.length === 0) return false;

            // 一つでも同じタグがあるか確認
            return itemKeywords.some(kw => currentKeywords.includes(kw));
        });

        // 関連記事がない場合は何も表示しない
        if (relatedPool.length === 0) {
            container.innerHTML = '';
            return;
        }

        // ランダムに最大6件をシャッフル
        const shuffled = relatedPool.sort(() => Math.random() - 0.5).slice(0, 6);

        let html = `<h1 class="related-entry-heading">関連記事</h1>`;
        html += `<div class="related-list">`;

        shuffled.forEach(related => {
            const thumbUrl = Array.isArray(related.thumbnailUrl) && related.thumbnailUrl[1]
                ? related.thumbnailUrl[1] : '';

            // タグリストを表示（最初のタグのみ使用）
            const tagLabel = Array.isArray(related.keywords) && related.keywords.length > 0
                ? related.keywords[0]
                : '';
            const relatedDesc = related.description || '';

            html += `<a href="${related.url}" class="related-entry-card-wrap a-wrap border-element cf" title="${related.label}" data-nodal="">`;
            html += `<article class="related-entry-card e-card cf post type-post status-publish format-standard has-post-thumbnail hentry category-css-post">`;
            html += `<figure class="related-entry-card-thumb card-thumb e-card-thumb">`;
            if (thumbUrl) {
                html += `<img width="160" height="90" src="${thumbUrl}" class="related-entry-card-thumb-image card-thumb-image wp-post-image lazyautosizes lazyloaded" alt="" decoding="async" data-sizes="auto" data-eio-rwidth="160" data-eio-rheight="90" sizes="160px">`;
            } else {
                html += `<img width="160" height="90" src="" class="related-entry-card-thumb-image card-thumb-image wp-post-image" alt="" decoding="async" style="display:none;">`;
            }
            if (tagLabel) {
                html += `<span class="cat-label cat-label-81">${tagLabel}</span>`;
            }
            html += `</figure> <!-- /.related-entry-thumb -->`;
            html += `<div class="related-entry-card-content card-content e-card-content">`;
            html += `<h3 class="related-entry-card-title card-title e-card-title">${related.label}${relatedDesc ? `：${relatedDesc}` : ''}</h3>`;
            html += `</div> <!-- /.related-entry-card-content -->`;
            html += `</article> <!-- /.related-entry-card -->`;
            html += `</a> <!-- /.related-entry-card-wrap -->`;
        });

        html += `</div> <!-- /related-list -->`;
        container.innerHTML = html;
    }

    /**
     * 前後記事リンク
     * mainPath に基づいて同じ親を持つ兄弟ノードから前後のリンクを生成
     */
    function renderPager(allData, current) {
        const container = document.getElementById('pager-post-navi');
        if (!container) return;

        // allData を配列に統一
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }

        // mainPath から経路情報を抽出するヘルパ
        const getFirstPath = (node) => {
            if (!node) return '';
            if (Array.isArray(node.mainPath) && node.mainPath.length > 0) return node.mainPath[0];
            if (typeof node.mainPath === 'string') return node.mainPath;
            return '';
        };

        const currentPath = getFirstPath(current);
        if (!currentPath) return;

        // 親パスを計算（最後の ID を除いたパス）
        const getParentPath = (path) => {
            const parts = path.split(':').filter(Boolean);
            if (parts.length <= 1) return ''; // ルートレベルには親がない
            return parts.slice(0, -1).join(':');
        };

        const parentPath = getParentPath(currentPath);
        if (!parentPath) return; // ルートレベルには兄弟がない

        // 同じ親を持つ兄弟を抽出
        const siblings = allData.filter(item => {
            const itemPath = getFirstPath(item);
            return getParentPath(itemPath) === parentPath;
        });

        // mainPath の最後の ID でソート
        siblings.sort((a, b) => {
            const aPath = getFirstPath(a);
            const bPath = getFirstPath(b);
            const aId = parseInt(aPath.split(':').pop(), 10);
            const bId = parseInt(bPath.split(':').pop(), 10);
            return aId - bId;
        });

        const currentIndex = siblings.findIndex(item => item.url === current.url);
        if (currentIndex === -1) {
            console.warn('Current node not found among siblings.');
            container.innerHTML = '';
            return;
        }
        const prev = siblings[currentIndex - 1];
        const next = siblings[currentIndex + 1];

        // サムネイル等の存在チェック用ヘルパ
        const thumbHtml = (node) => {
            if (!node) return '';
            if (Array.isArray(node.thumbnailUrl) && node.thumbnailUrl.length > 0 && node.thumbnailUrl[0]) {
                const src = node.thumbnailUrl[0];
                return `<figure class="${node === prev ? 'prev-post-thumb' : 'next-post-thumb'} card-thumb"><img width="120" height="68" src="${src}" class="attachment-thumb120 size-thumb120 wp-post-image lazyautosizes ls-is-cached lazyloaded" alt="" decoding="async"></figure>`;
            }
            return ''; // サムネイルが無ければ空
        };

        let html = '';
        if (prev && Number(prev.released) === 1) {
            const prevThumb = thumbHtml(prev);
            const prevDesc = prev.description || '';
            html += `<a href="${prev.url}" class="prev-post a-wrap border-element cf" data-nodal=""><div class="fa fa-chevron-left iconfont" aria-hidden="true"></div>${prevThumb}<div class="prev-post-title">${prev.label}${prevDesc ? `：${prevDesc}` : ''}</div></a>`;
        } else {
            html += `<span class="prev-post-placeholder">前の記事はありません</span>`;
        }

        if (next && Number(next.released) === 1) {
            const nextThumb = thumbHtml(next);
            const nextDesc = next.description || '';
            html += `<a href="${next.url}" class="next-post a-wrap cf" data-nodal=""><div class="fa fa-chevron-right iconfont" aria-hidden="true"></div>${nextThumb}<div class="next-post-title">${next.label}${nextDesc ? `：${nextDesc}` : ''}</div></a>`;
        } else {
            html += `<span class="next-post-placeholder">次の記事はありません</span>`;
        }

        container.innerHTML = html;
    }

    /**
     * 人気記事セクション
     * ここは閲覧数APIと結合する必要があります。
     * 記事の人気順ソートなどはサーバー側で行う想定です。
     */
    function renderPopularSection(allData, viewStats) {
        const container = document.getElementById('popular_entries');
        if (!container) return;

        // allData を配列に統一
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }
        // viewStats を配列に統一
        if (!Array.isArray(viewStats)) {
            try {
                viewStats = Object.values(viewStats);
            } catch (e) {
                viewStats = [];
            }
        }

        const findNode = (id) => allData.find(n => n && n.id === id);

        // サムネイル等の存在チェック用ヘルパ
        const thumbHtml = (node) => {
            if (!node) return '';
            if (Array.isArray(node.thumbnailUrl) && node.thumbnailUrl.length > 0 && node.thumbnailUrl[0]) {
                const src = node.thumbnailUrl[0];
                return `<figure class="popular-entry-card-thumb widget-entry-card-thumb card-thumb"><img width="120" height="68" src="${src}" class="attachment-thumb120 size-thumb120 wp-post-image lazyautosizes ls-is-cached lazyloaded" alt="" decoding="async"></figure> <!-- /.popular-entry-card-thumb -->`;
            }
            return ''; // サムネイルが無ければ空
        };

        // simple escape helper
        function escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s]));
        }

        let html = `<div class="popular-entry-cards widget-entry-cards no-icon cf border-partition viewStats-visible">`;

        viewStats.forEach(item => {
            // DOM へ追加
            const node = findNode(item.id) || {}; // allData 側の完全情報を優先
            const viewStatsThumb = thumbHtml(node);

            html += `<a href="${item.url}" class="popular-entry-card-link widget-entry-card-link a-wrap no-1" title="${escapeHtml(item.label||'')}" data-nodal="">`;
            html += `<div class="post-${item.id} popular-entry-card widget-entry-card e-card cf post type-post status-publish format-standard has-post-thumbnail hentry category-python-post">`;
            html += `${viewStatsThumb}`;
            html += `<div class="popular-entry-card-content widget-entry-card-content card-content">`;
            html += `<div class="popular-entry-card-title widget-entry-card-title card-title">${escapeHtml(item.label||node.label||'')}</div>`;
            html += `<div class="popular-entry-card-date widget-entry-card-date display-none">`;
            html += `<span class="popular-entry-card-post-date widget-entry-card-post-date post-date">${escapeHtml(node.datePublished||'')}</span>`;
            html += `<span class="popular-entry-card-update-date widget-entry-card-update-date post-update">${escapeHtml(node.dateModified||'')}</span>`;
            html += `</div>`;

            html += `</div> <!-- /.popular-entry-content -->`;
            html += `</div> <!-- /.popular-entry-card -->`;
            html += `</a> <!-- /.popular-entry-card-link -->`;
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    /**
     * カテゴリー一覧生成
     */
    function renderCategoryList(allData) {
        const container = document.getElementById('categories');
        if (!container) return;

        // allData を配列に統一
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }
        // キーワードをプール（重複除去）
        const pool = new Set();
        allData.forEach(item => {
            if (!item) return;
            const kws = Array.isArray(item.keywords) ? item.keywords : [];
            kws.forEach(k => {
                if (k == null) return;
                const s = String(k).trim();
                if (s) pool.add(s);
            });
        });

        const tags = Array.from(pool);
        if (tags.length === 0) {
            container.innerHTML = '';
            return;
        }

        // 文字コード順（UTF-16 code unit）で辞書順ソート
        tags.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

        // HTML 生成
        let html = '<ul>';
        const escapeHtml = (str) => String(str).replace(/[&<>"]+/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] || ch));

        // Hash function (djb2) - if not already defined in scope, or reuse if possible.
        function djb2Hash(str) {
            let h = 5381;
            for (let i = 0; i < str.length; i++) {
                h = ((h << 5) + h) + str.charCodeAt(i);
                h = h & 0xFFFFFFFF;
            }
            return (h >>> 0).toString(16);
        }

        tags.forEach((tag, idx) => {
            const tagId = idx;
            // Generate search URL
            const base = tag;
            const type = 'tag';
            const normalized = tag;
            const payload = String(base) + '|' + type + '|' + JSON.stringify(normalized);
            const hash = djb2Hash(payload);
            const ts = Date.now();
            const frag = 'q=' + encodeURIComponent(String(base)) + '&type=' + encodeURIComponent(type) + '&h=' + hash + '&ts=' + ts;
            const url = `https://tatsuy-kobayashi.github.io/my-web/docs/search/integratedSearch.html#${frag}`;

            html += `<li class="cat-item cat-item-${tagId}">`;
            html += `<a href="${url}" data-nodal=""><span class="list-item-caption">${escapeHtml(tag)}</span></a>`;
            html += `</li>`;
        });
        html += '</ul>';

        container.innerHTML = html;
    }
});
