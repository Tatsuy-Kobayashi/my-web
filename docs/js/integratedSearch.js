// ----------------------------------------------------------------------------
// ファイル名    : integratedSearch.js
// 名称          : ページの各パーツを生成するスクリプト
// 内容          : ページの内容に応じて、関連リンクやナビゲーションリンクを生成・挿入する
// このプログラムの著作権及び、このプログラムに関する技術は（株）Fibrantixがその知的財産権を所有し
// ており、所有者の事前の許可なくその全部又は一部を問わず、第三者に開示してはならない。
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async function () {
    'use strict'; // 状態遷移重視・エラーフラグ管理ありの完全版スクリプト

    // ------------------------
    // 状態定義
    // ------------------------
    const STATE = {
        DOM_LOADING: 'DOM_LOADING',
        DATA_INITIALIZATION: 'DATA_INITIALIZATION',
        NETWORK_INITIALIZATION: 'NETWORK_INITIALIZATION',
        HASH_BOOTSTRAP: 'HASH_BOOTSTRAP',
        BOOTSTRAP_SEARCH: 'BOOTSTRAP_SEARCH',
        IDLE: 'IDLE',
        SEARCHING: 'SEARCHING',
        ERROR: 'ERROR'
    };
    // ------------------------
    // エラーフラグ
    // ------------------------
    const errorFlags = {
        missingDom: false,
        visNotAvailable: false,
        invalidData: false,
        networkInitFailed: false
    };

    let currentState = STATE.DOM_LOADING; // 「DOM読み込み中」で初期化

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

    // 1. データの取得 (パスは実際の環境に合わせて調整してください)
    //const response = await fetch('../../../../../searchSource.json');
    //const data = await response.json();

    // ------------------------
    // データ（ノード）
    // ------------------------
    // id: ノードID
    // label: ラベル
    // labelEn: 英語ラベル
    // description: ノード説明文
    // sections: セクション配列
    // keywords: タグ配列
    // iconClass: アイコンのCSSクラス（FontAwesome等）
    // ------------------------
    console.log('[INIT] Loading searchSource...');
    const searchSource = await fetch('https://tatsuy-kobayashi.github.io/my-web/docs/data/searchSource.json').then(response => response.json());

    // 本来はここで fetch('/api/stats/popular') 等を行う
    // const ranking = await fetch('/api/popular').then(r => r.json());
    // container.innerHTML = 'Loading popular articles...';

    // ------------------------
    // データ（記事閲覧数）
    // ------------------------
    const ranking = [
        { id: 3011, label: "集合論", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/set_theory.html", totalViews: 90210, weeklyViews: 420, monthlyViews: 1800 },
        { id: 304022, label: "特殊関数", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_functions/special_functions/special_functions.html", totalViews: 80123, weeklyViews: 380, monthlyViews: 1600 }
    ];

    // グローバル: データが持つ最大の depth（level）
    let maxAvailableLevel = 0;
    // ------------------------
    // 関数名   : vof_ensureLevelsFromPaths(nodes)
    // 名称     : paths から各ノードの level を計算
    // 内容     : nodes に含まれる mainPath を元に、各ノードの階層（level）を計算する。ノードの階層は、グラフの構造を決定づけるため、原則として mainPath に基づいて計算する
    // 引数     : nodes - ノード配列
    // 戻り値   : maxAvailableLevel (int)
    // ------------------------
    function vof_ensureLevelsFromPaths(nodes) {
        maxAvailableLevel = 0;

        for (const n of nodes) {
            // mainPath が存在しない場合は validateData で弾かれるため、ここでは安全に参照可能
            // 階層決定は mainPath を基準とする
            const paths = n.mainPath;

            if (!paths || paths.length === 0) continue;
            const depths = paths.map(p => p.split(":").length - 1);
            n.level = Math.min(...depths);       // ルートが level 0 として整合
            if (typeof n.level === 'number' && Number.isFinite(n.level)) {
                maxAvailableLevel = Math.max(maxAvailableLevel, n.level);
            }
        }
        return maxAvailableLevel;
    }

    // **
    // * カテゴリ検索結果生成関数
    // * levelが現在より下（数値が大きい）記事を表示
    // * @param {Array|Object} allData siteData.jsonの中身
    // * @param {Object} currentEntry 現在の記事データ
    //
    function renderCategorySearchResult(allData, current, maxDepth) {
        const container = document.getElementById('category-list');
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
        console.log('siteData')

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
                s += `<a href="${node.url}" class="preview-link" data-title="${(node.label || '').replace(/\"/g, '&quot;')}" data-description="${(desc || '').replace(/\"/g, '&quot;')}" data-image="${img}">${node.label}</a>`;
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

    function renderTagList(allData) {
        const container = document.getElementById('tagsList');
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
        let html = '';
        const escapeHtml = (str) => String(str).replace(/[&<>"]+/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] || ch));
        tags.forEach((tag, idx) => {
            html += `<span class="tag-label" data-index="${idx}">`;
            html += `<a href="#" class="tag-search-link" data-tag="${escapeHtml(tag)}" title="タグ: ${escapeHtml(tag)}"><span class="tag-label-text"># ${String(tag)}</span></a>`;
            html += `</span>`;
        });

        container.innerHTML = html;

        // タグ検索のイベントハンドラ
        const tagLinks = container.querySelectorAll('.tag-search-link');
        tagLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tag = link.getAttribute('data-tag');
                performTagSearch(tag, searchSource);
            });
        });
    }

    // アイコン検索
    function renderIconBtnList(allData) {
        const container = document.getElementById('iconBtnList');
        if (!container) return;

        // allData を配列に統一
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }

        // iconClass を集める（文字列または配列に対応）
        const pool = new Set();
        allData.forEach(item => {
            if (!item || item.iconClass == null) return;
            if (Array.isArray(item.iconClass)) {
                item.iconClass.forEach(ic => {
                    if (ic == null) return;
                    const s = String(ic).trim();
                    if (s) pool.add(s);
                });
            } else if (typeof item.iconClass === 'string') {
                const s = item.iconClass.trim();
                if (s) pool.add(s);
            } else {
                // その他の型（例: オブジェクト等）は無視
            }
        });

        const icons = Array.from(pool);
        console.log('iconClass array created:', icons);
        if (icons.length === 0) {
            container.innerHTML = '';
            return;
        }

        // 文字コード順（UTF-16 code unit）で辞書順ソート
        icons.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

        // HTML 生成
        let html = '<span class="icon-label" data-index="home"><a href="https://tatsuy-kobayashi.github.io/my-web/docs/"><span class="icon-label-content"><i class="fa fa-home fa-fw" aria-hidden="true"></i></span></a></span>';
        const escapeHtml = (str) => String(str).replace(/[&<>"]+/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] || ch));
        icons.forEach((icon, idx) => {
            html += `<span class="icon-label" data-index="${idx}">`;
            html += `<a href="#" class="icon-search-link" data-icon="${escapeHtml(icon)}" title="アイコン: ${escapeHtml(icon)}">`;
            html += `<span class="icon-label-content"><i class="fa ${String(icon)}"></i></span>`;
            html += `</a>`;
            html += `</span>`;
        });

        container.innerHTML = html;

        // アイコン検索のイベントハンドラ
        const iconLinks = container.querySelectorAll('.icon-search-link');
        iconLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const iconClass = link.getAttribute('data-icon');
                performIconSearch(iconClass, searchSource);
            });
        });
    }

    // ------------------------
    // DOM要素参照（安全に取得）
    // ------------------------
    function $id(id) {
        const el = document.getElementById(id);
        if (!el) console.warn(`[WARN] DOM element not found: #${id}`);
        return el;
    }

    const dom = {
        contentIntegSearch: $id('contentIntegSearch'),
        labelSubstringSearchSuggestions: $id('labelSubstringSearchSuggestions'),
        contentIntegSearchResult: $id('contentIntegSearchResult')
    };

    // DOM 要素が揃っているか簡易チェック
    if (!dom.contentIntegSearch || !dom.labelSubstringSearchSuggestions || !dom.contentIntegSearchResult) {
        console.error('[ERROR] 必要な DOM 要素が見つかりません。処理を中止します。');
        errorFlags.missingDom = true;
        currentState = STATE.ERROR;
        return;
    }

    // ------------------------
    // 関数名   : buildEdgesFromPaths(filteredNodes)
    // 名称     : paths からエッジ情報を生成する処理
    // 内容     : filteredNodes に含まれる paths を元に、エッジ情報を生成する
    // 引数     : filteredNodes - ユーザ操作で選択されたノード配列
    // 戻り値   : edges - 生成されたエッジ配列
    // ------------------------
    function buildEdgesFromPaths(filteredNodes) {
        const visible = new Set(filteredNodes.map(n => n.id));
        const edges = [];
        const dedup = new Set();

        for (const n of filteredNodes) {
            const paths = n.mainPath || [];
            for (const pathStr of paths) {
                const parts = pathStr.split(":").map(Number);

                // 末尾が自身のIDで終わっているか（データ健全性チェック）
                // if (parts[parts.length - 1] !== n.id) continue;

                for (let i = 0; i < parts.length - 1; i++) {
                    const from = parts[i];
                    const to = parts[i + 1];
                    // 可視ノード同士のみエッジを張る
                    if (!visible.has(from) || !visible.has(to)) continue;

                    const key = `${from}->${to}`;
                    if (!dedup.has(key)) {
                        dedup.add(key);
                        edges.push({ from, to });
                    }
                }
            }
        }
        return edges;
    }

    // ------------------------
    // vis-network 管理（初回生成は1度だけ）
    // ------------------------
    let network = null; // vis-network インスタンス
    let networkInitialized = false; // 初期化済みフラグを失敗で初期化

    // ------------------------
    // 関数名   : searchContentInit()
    // 名称     : 高度な検索機能ページの初期化
    // 内容     : 高度な検索機能用の HTML コンテンツを読み込み、初期化を行う
    // 引数     : void
    // 戻り値   : Promise<boolean> - 成功なら true、失敗なら false
    // ------------------------
    async function searchContentInit() {
        currentState = STATE.DATA_INITIALIZATION;
        console.log('[STATE] SEARCH_CONTENT_INITIALIZATION');

        const containerSearch = document.getElementById('contentIntegSearch');
        if (!containerSearch) return;
        const containerResult = document.getElementById('contentIntegSearchResult');
        if (!containerResult) return;

        try {
            // resultコンテナをクリア
            containerResult.style.display = 'none';
            containerResult.innerHTML = '';
            console.log('[INIT] contentIntegSearchResult cleared');

            // 挿入後のDOM初期化（目次トグルなど）
            initializeSearchUI();

            return true;
        } catch (error) {
            console.error('[ERROR] searchContentInit failed:', error);
            containerSearch.innerHTML = '<p style="color: red;">検索機能の読み込みに失敗しました。</p>';
            errorFlags.networkInitFailed = true;
            currentState = STATE.ERROR;
            return false;
        }
    }

    // label にマッチする候補を返す
    function u1f_suggestNodesByLabel(label) {
        if (!label || label.trim() === '') {
            return [];
        }
        const trimmed = label.trim().toLowerCase();
        return searchSource.filter(n => n.label.toLowerCase().includes(trimmed)).slice(0, 10); // 最大10件
    }

    // ------------------------
    // 関数名   : initializeSearchUI()
    // 名称     : 検索UI要素の初期化
    // 内容     : HTML挿入後のUIイベントハンドラを設定
    // 引数     : void
    // 戻り値   : void
    // ------------------------
    function initializeSearchUI() {
        console.log('[UI] Initializing search UI...');

        // searchContentInit() で HTML を挿入済みであれば #network は存在する想定
        dom.networkContainer = dom.networkContainer || document.getElementById('network') || (dom.contentIntegSearch && dom.contentIntegSearch.querySelector('#network'));
        if (!dom.networkContainer) {
            console.error('[ERROR] network container (#network) not found. vis.Network を初期化できません。');
            errorFlags.missingDom = true;
            currentState = STATE.ERROR;
            return false;
        }

        // 目次トグル機能
        initializeTocToggle();

        const useId = 0;
        const useNode = siteData.find(n => n.useId === 0 || siteData[0]);
        console.log('Current node:', useNode);

        if (!useNode) {
            console.warn('Current node not found in siteData.');
            return;
        }

        const computedMax = vof_ensureLevelsFromPaths(siteData);
        // カテゴリ検索
        renderCategorySearchResult(siteData, useNode, computedMax);
        // タグ検索
        renderTagList(searchSource);
        // アイコン検索
        renderIconBtnList(searchSource);

        // サイト圏図式（動的グラフ）
        if (networkInitialized) return true;
        if (typeof vis === 'undefined' || !vis.Network) {
            console.error('[ERROR] vis-network が読み込まれていません。');
            errorFlags.visNotAvailable = true;
            currentState = STATE.ERROR;
            return false;
        }

        try {
            const nodes = new vis.DataSet([]); // 空で初期化
            const edges = new vis.DataSet([]);
            const data = { nodes, edges };
            const options = {
                layout: { hierarchical: false },
                physics: { enabled: true, solver: "forceAtlas2Based", forceAtlas2Based: { gravitationalConstant: -40, springLength: 60, springConstant: 0.2 }, stabilization: { enabled: true, iterations: 200 } },
                interaction: { hover: true, zoomView: true },
                edges: { arrows: "to", smooth: { enabled: false } }
            };

            network = new vis.Network(dom.networkContainer, data, options);
            networkInitialized = true;
            console.log('[NETWORK] vis.Network 初期化完了');
        } catch (e) {
            console.error('[ERROR] network 初期化に失敗しました:', e);
            errorFlags.networkInitFailed = true;
            currentState = STATE.ERROR;
            return false;
        }

        // ========================
        // 単純文字列検索のイベントハンドラ設定
        // ========================
        const substringInput = document.getElementById('labelSubstringSearchInput');
        const substringBtn = document.getElementById('labelSubstringSearchBtn');

        if (substringInput && substringBtn) {
            // クリックイベント：検索ボタン
            substringBtn.addEventListener('click', () => {
                console.log('[UI] Substring search button clicked');
                inputSubstringReceive();
            });

            // エンターキーでも検索実行
            substringInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    console.log('[UI] Substring search Enter key pressed');
                    inputSubstringReceive();
                }
            });

            substringInput.addEventListener('input', (event) => {
                // オプション：入力中にリアルタイム判定（デバッグ用）
                const input = event.target.value;
                const analysisResult = determineInputType(input);
                console.log('[UI] Real-time input analysis:', analysisResult.type);
                // 必要に応じてUIに反映

                // label input でのリアルタイム候補表示
                const label = substringInput.value;
                const suggestions = u1f_suggestNodesByLabel(label);

                if (suggestions.length === 0) {
                    dom.labelSubstringSearchSuggestions.style.display = 'none';
                    return;
                }

                // サジェスト一覧をクリア
                dom.labelSubstringSearchSuggestions.innerHTML = '';
                console.log('[UI] label substring search suggestions are cleared');

                // 候補を追加
                for (const node of suggestions) {
                    const li = document.createElement('li');
                    // Flex layout: Use specific styles directly or add a class if preferred.
                    // Using inline styles here to match existing pattern.
                    li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #eee; transition: background-color 0.2s;';

                    // Text part (Click -> Populate Input)
                    const textSpan = document.createElement('span');
                    textSpan.textContent = node.label;
                    textSpan.style.cssText = 'flex-grow: 1; cursor: pointer;';
                    textSpan.addEventListener('click', (e) => {
                        // Prevent bubbling so we don't trigger anything else if necessary
                        e.stopPropagation();
                        substringInput.value = node.label;
                        dom.labelSubstringSearchSuggestions.style.display = 'none';
                    });

                    // Link Icon part (Click -> Navigate)
                    const iconLink = document.createElement('a');
                    iconLink.href = node.url;
                    iconLink.className = 'icon-arrow-left-to-line';
                    // Adjust style for the icon
                    iconLink.style.cssText = 'margin-left: 10px; text-decoration: none; color: #555; font-size: 1.2em; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px;';
                    // Optional: subtle hover effect for the icon itself
                    iconLink.addEventListener('mouseover', function () { this.style.backgroundColor = '#ddd'; });
                    iconLink.addEventListener('mouseout', function () { this.style.backgroundColor = 'transparent'; });
                    // Prevent bubbling to avoid triggering textSpan click (though they are siblings, so bubbling goes to li)
                    iconLink.addEventListener('click', (e) => {
                        e.stopPropagation(); // Stop bubbling to li
                    });

                    li.appendChild(textSpan);
                    li.appendChild(iconLink);

                    // Row hover effect
                    li.addEventListener('mouseover', () => {
                        li.style.backgroundColor = '#f0f0f0';
                    });
                    li.addEventListener('mouseout', () => {
                        li.style.backgroundColor = '';
                    });

                    dom.labelSubstringSearchSuggestions.appendChild(li);
                }

                dom.labelSubstringSearchSuggestions.style.display = 'block';
            });

            // 外クリックで候補を非表示（学問検索）
            document.addEventListener('click', (e) => {
                if (!substringInput.contains(e.target) && !dom.labelSubstringSearchSuggestions.contains(e.target)) {
                    dom.labelSubstringSearchSuggestions.style.display = 'none';
                }
            });

            console.log('[UI] Substring search event handlers attached');
        } else {
            console.warn('[UI] Substring search input or button element not found');
        }

        console.log('[UI] Search UI initialization complete');
        return true;
    }

    function initializeTocToggle() {

        // 目次のコンテナ
        const tocContent = document.querySelector('.toc-content');
        if (!tocContent) {
            console.warn('[TOC] #toc not found');
            return;
        }

        // トグルボタン
        const toggleButton = document.querySelector('.toc-toggle-button');
        if (!toggleButton) {
            console.warn('[TOC] #toc-toggle not found');
            return;
        }

        // 初期状態
        tocContent.dataset.open = 'true';

        // クリックイベント
        toggleButton.addEventListener('click', () => {
            if (tocContent.style.display === 'none' || tocContent.style.display === '') {
                tocContent.style.display = 'block';
                toggleButton.textContent = '隠す';
            } else {
                tocContent.style.display = 'none';
                toggleButton.textContent = '表示';
            }

            console.log('[TOC] toggled.');
        });
    }

    // ------------------------
    // STATE 1: DATA_INITIALIZATION
    // （ここでは簡単なバリデーションを行う）
    // ------------------------
    function validateData() {
        currentState = STATE.DATA_INITIALIZATION;
        console.log('[STATE] DATA_INITIALIZATION');

        // ノード id 重複チェック
        const ids = new Set();
        for (const n of siteData) {
            if (ids.has(n.id)) {
                console.error('[ERROR] siteData に重複 id が存在します:', n.id);
                errorFlags.invalidData = true;
            }
            ids.add(n.id);
        }

        // エッジの参照チェックpaths の整合チェック: 各 path の各要素が存在するか、および path の末尾が自身の id であるか
        for (const n of siteData) {
            if (!n.mainPath) continue;
            for (const p of n.mainPath) {
                const parts = p.split(':').map(Number);
                if (parts[parts.length - 1] !== n.id) {
                    console.error('[ERROR] paths の末尾が node.id と一致しません:', n.id, p);
                    errorFlags.invalidData = true;
                    continue;
                }
                for (const pid of parts) {
                    if (!ids.has(pid)) {
                        console.error('[ERROR] paths が存在しないノードを参照しています:', p, 'missing:', pid);
                        errorFlags.invalidData = true;
                    }
                }
            }
        }

        if (errorFlags.invalidData) {
            currentState = STATE.ERROR;
            return false;
        }

        // 2層までを表示
        const maxis2 = 2;
        maxAvailableLevel = (typeof maxis2 === 'number' && Number.isFinite(maxis2)) ? maxis2 : 0;
        console.log('[DATA] computed maxAvailableLevel =', maxAvailableLevel);

        return true;
    }

    // ------------------------
    // STATE 2: NETWORK_INITIALIZATION
    // ------------------------
    function initializeNetwork() {
        currentState = STATE.NETWORK_INITIALIZATION;
        console.log('[STATE] NETWORK_INITIALIZATION');

        // 初回描画：デフォルト（min/max）による描画をしないで空で開始することも選べる
        // 今は初期値を用いて描画
        currentState = STATE.SEARCHING;

        let min = 0;
        let max = maxAvailableLevel;

        // filter nodes and edges
        const filteredNodes = siteData.filter(n => (typeof n.level === 'number') && n.level >= min && n.level <= max);
        const filteredEdges = buildEdgesFromPaths(filteredNodes);
        console.log('[NETWORK] Initial filtered edges:', filteredEdges.length);

        if (!initializeSearchUI()) return;
        try {
            const nodes = new vis.DataSet(filteredNodes);
            const edges = new vis.DataSet(filteredEdges);
            network.setData({ nodes, edges });
            console.log('[NETWORK] setData 実行: nodes=', filteredNodes.length, 'edges=', filteredEdges.length);
        } catch (e) {
            console.error('[ERROR] setNetworkData 失敗:', e);
        }

        currentState = STATE.IDLE;
        console.log('[SEARCH] performDepthSearch done');

        return true;
    }

    // ========================
    // 検索入力方式判定機能
    // ========================

    /**
     * 入力方式の定義
     */
    const SEARCH_INPUT_TYPES = {
        PLAIN_TEXT: 'plainText',           // 平文検索
        LOGICAL_OPERATORS: 'logicalOps',   // AND/OR/NOT演算子検索
        REGEX: 'regex',                    // 正規表現検索
        UNKNOWN: 'unknown'                 // 未判定
    };

    /**
     * 関数名   : determineInputType()
     * 名称     : 検索入力の方式を判定
     * 内容     : ユーザー入力を解析し、どの検索方式かを判定
     *          1. 正規表現（/.../ または /.../(flags)）
     *          2. 論理演算子（AND, OR, NOT キーワード）
     *          3. 平文（その他）
     * 引数     : query (string) - ユーザーの入力文字列
     * 戻り値   : object
     *           {
     *             type: SEARCH_INPUT_TYPES のいずれか
     *             original: 元の入力文字列
     *             normalized: 処理用に正規化された値
     *             isValid: パース可能か（特に正規表現）
     *             error: エラーメッセージ（あれば）
     *           }
     * ========================
     */
    function determineInputType(query) {
        if (!query || typeof query !== 'string') {
            return {
                type: SEARCH_INPUT_TYPES.UNKNOWN,
                original: query,
                normalized: '',
                isValid: false,
                error: '入力が空です'
            };
        }

        const trimmed = query.trim();

        // 1. 正規表現判定: /.../ または /.../(flags) の形式
        const regexPattern = /^\/(.*)\/([a-zA-Z]*)$/;
        const regexMatch = trimmed.match(regexPattern);

        if (regexMatch) {
            const pattern = regexMatch[1];
            const flags = regexMatch[2] || '';

            try {
                // 正規表現として有効か検証
                new RegExp(pattern, flags);
                return {
                    type: SEARCH_INPUT_TYPES.REGEX,
                    original: trimmed,
                    normalized: {
                        pattern: pattern,
                        flags: flags,
                        regexStr: trimmed
                    },
                    isValid: true,
                    error: null
                };
            } catch (e) {
                return {
                    type: SEARCH_INPUT_TYPES.REGEX,
                    original: trimmed,
                    normalized: { pattern: pattern, flags: flags },
                    isValid: false,
                    error: '正規表現のパースに失敗しました: ' + e.message
                };
            }
        }

        // 2. 論理演算子判定: AND, OR, NOT キーワードを含むか
        // 複数単語が AND/OR/NOT でつなげられているか判定
        const logicalOpPattern = /\b(AND|OR|NOT)\b/gi;
        const hasLogicalOps = logicalOpPattern.test(trimmed);

        if (hasLogicalOps) {
            // 論理演算子を検出
            return {
                type: SEARCH_INPUT_TYPES.LOGICAL_OPERATORS,
                original: trimmed,
                normalized: parseLogicalOperators(trimmed),
                isValid: true,
                error: null
            };
        }

        // 3. デフォルト：平文検索
        return {
            type: SEARCH_INPUT_TYPES.PLAIN_TEXT,
            original: trimmed,
            normalized: trimmed,
            isValid: true,
            error: null
        };
    }

    /**
     * 関数名   : parseLogicalOperators()
     * 名称     : 論理演算子の解析
     * 内容     : AND/OR/NOT を含むクエリを構文木に解析
     * 引数     : query (string) - 論理演算子を含むクエリ文字列
     * 戻り値   : object - パース結果
     *           {
     *             type: 'and' | 'or' | 'not' | 'term'
     *             value: 単語（type='term'の場合）
     *             operands: 子要素配列（複合演算の場合）
     *           }
     * 注記     : 簡易実装。複雑な式はサポートしていない
     * ========================
     */
    function parseLogicalOperators(query) {
        // スペースで分割し、AND/OR/NOT とそれ以外を分離
        const tokens = query.trim().split(/\s+/);
        const result = {
            type: 'expression',
            operands: [],
            operators: []
        };

        let currentTerm = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i].toUpperCase();

            if (token === 'AND' || token === 'OR' || token === 'NOT') {
                // 演算子直前の単語をtermsに追加
                if (currentTerm.length > 0) {
                    result.operands.push({
                        type: 'term',
                        value: currentTerm.join(' ')
                    });
                    currentTerm = [];
                }
                // 演算子を記録
                result.operators.push(token.toLowerCase());
            } else {
                // 通常の単語
                currentTerm.push(tokens[i]);
            }
        }

        // 最後の単語を追加
        if (currentTerm.length > 0) {
            result.operands.push({
                type: 'term',
                value: currentTerm.join(' ')
            });
        }

        return result;
    }

    /**
     * 関数名   : inputSubstringReceive()
     * 名称     : 単純文字列検索入力を受け取る
     * 内容     : #labelSubstringSearchInput からユーザー入力を取得し、
     *          入力方式を判定して処理を分岐
     * 引数     : void
     * 戻り値   : boolean - 処理が正常に進行したか
     * ========================
     */
    function inputSubstringReceive() {
        const inputElement = document.getElementById('labelSubstringSearchInput');

        if (!inputElement) {
            console.error('[SEARCH] labelSubstringSearchInput element not found');
            return false;
        }

        const userInput = inputElement.value;
        console.log('[SEARCH] inputSubstringReceive called with input:', userInput);

        // 入力方式を判定
        const analysisResult = determineInputType(userInput);
        console.log('[SEARCH] Input type analysis:', analysisResult);

        if (!analysisResult.isValid) {
            console.warn('[SEARCH] Invalid input:', analysisResult.error);
            alert('入力エラー: ' + analysisResult.error);
            return false;
        }

        // 入力方式に応じた処理を分岐
        switch (analysisResult.type) {
            case SEARCH_INPUT_TYPES.PLAIN_TEXT:
                console.log('[SEARCH] Plain text search mode');
                return performPlainTextSearch(analysisResult.normalized, searchSource);

            case SEARCH_INPUT_TYPES.LOGICAL_OPERATORS:
                console.log('[SEARCH] Logical operators search mode');
                return performLogicalOperatorsSearch(analysisResult.normalized, searchSource);

            case SEARCH_INPUT_TYPES.REGEX:
                console.log('[SEARCH] Regex search mode');
                return performRegexSearch(analysisResult.normalized, searchSource);

            default:
                console.warn('[SEARCH] Unknown input type');
                return false;
        }
    }

    /**
     * 関数名   : performPlainTextSearch()
     * 名称     : 平文検索の実行
     * 内容     : 指定された文字列をsearchSourceから検索
     * 引数     : searchQuery (string) - 検索文字列
     *          source (array) - 検索対象データ
     * 戻り値   : boolean
     * ========================
     */
    function performPlainTextSearch(searchQuery, source) {
        console.log('[SEARCH] Performing plain text search for:', searchQuery);

        const results = [];
        const queryLower = searchQuery.toLowerCase();

        for (const item of source) {
            let matches = false;

            // label, labelEn をチェック
            if (item.label && item.label.toLowerCase().includes(queryLower)) {
                matches = true;
            } else if (item.labelEn && item.labelEn.toLowerCase().includes(queryLower)) {
                matches = true;
            }

            // sections 内をチェック
            if (!matches && item.sections && Array.isArray(item.sections)) {
                for (const section of item.sections) {
                    const sectionText = (section.h2 || '') + ' ' + (section.text || '');
                    if (sectionText.toLowerCase().includes(queryLower)) {
                        matches = true;
                        break;
                    }
                }
            }

            if (matches) {
                results.push(item);
            }
        }

        console.log('[SEARCH] Plain text search results count:', results.length);
        showSearchResultsWithFragment(results, { type: SEARCH_INPUT_TYPES.PLAIN_TEXT, original: searchQuery, normalized: searchQuery });
        return true;
    }

    /**
     * 関数名   : performLogicalOperatorsSearch()
     * 名称     : 論理演算子検索の実行
     * 内容     : AND/OR/NOT を含むクエリで検索
     * 引数     : parsedQuery (object) - parseLogicalOperatorsの戻り値
     *          source (array) - 検索対象データ
     * 戻り値   : boolean
     * ========================
     */
    function performLogicalOperatorsSearch(parsedQuery, source) {
        console.log('[SEARCH] Performing logical operators search:', parsedQuery);

        const results = [];

        for (const item of source) {
            if (evaluateLogicalExpression(item, parsedQuery)) {
                results.push(item);
            }
        }

        console.log('[SEARCH] Logical search results count:', results.length);
        showSearchResultsWithFragment(results, parsedQuery);
        return true;
    }

    /**
     * 関数名   : evaluateLogicalExpression()
     * 名称     : 論理式の評価
     * 内容     : 単一アイテムが論理式にマッチするか判定
     * 引数     : item (object) - searchSourceの1要素
     *          expression (object) - パース済み論理式
     * 戻り値   : boolean
     * ========================
     */
    function evaluateLogicalExpression(item, expression) {
        if (!expression.operands || expression.operands.length === 0) {
            return false;
        }

        const itemText = (
            (item.label || '') + ' ' +
            (item.labelEn || '') + ' ' +
            (item.sections ? item.sections.map(s => (s.h2 || '') + ' ' + (s.text || '')).join(' ') : '')
        ).toLowerCase();

        // 各operandがマッチするか判定
        const matches = expression.operands.map(operand => {
            if (operand.type === 'term') {
                return itemText.includes(operand.value.toLowerCase());
            }
            return false;
        });

        // operatorsに基づいて結果を結合
        let result = matches[0];
        for (let i = 0; i < expression.operators.length; i++) {
            const op = expression.operators[i];
            const nextMatch = matches[i + 1];

            if (op === 'and') {
                result = result && nextMatch;
            } else if (op === 'or') {
                result = result || nextMatch;
            }
        }

        // NOTの処理（簡易版）
        // NOT が先頭にある場合は結果を反転
        if (expression.operators.length > 0 && expression.operators[0] === 'not') {
            result = !result;
        }

        return result;
    }

    /**
     * 関数名   : performRegexSearch()
     * 名称     : 正規表現検索の実行
     * 内容     : 正規表現パターンでsearchSourceを検索
     * 引数     : regexInfo (object) - { pattern, flags }
     *          source (array) - 検索対象データ
     * 戻り値   : boolean
     * ========================
     */
    function performRegexSearch(regexInfo, source) {
        console.log('[SEARCH] Performing regex search:', regexInfo);

        const regex = new RegExp(regexInfo.pattern, regexInfo.flags);
        const results = [];

        for (const item of source) {
            let matches = false;

            // label, labelEn をテスト
            if ((item.label && regex.test(item.label)) ||
                (item.labelEn && regex.test(item.labelEn))) {
                matches = true;
            }

            // sections 内をテスト
            if (!matches && item.sections && Array.isArray(item.sections)) {
                for (const section of item.sections) {
                    const sectionText = (section.h2 || '') + ' ' + (section.text || '');
                    if (regex.test(sectionText)) {
                        matches = true;
                        break;
                    }
                }
            }

            if (matches) {
                results.push(item);
            }
        }

        console.log('[SEARCH] Regex search results count:', results.length);
        showSearchResultsWithFragment(results, { type: SEARCH_INPUT_TYPES.REGEX, original: regexInfo.regexStr || (regexInfo.pattern || ''), normalized: regexInfo });
        return true;
    }

    /**
     * 関数名   : performTagSearch()
     * 名称     : タグ検索の実行
     * 内容     : 指定されたタグを持つアイテムを検索
     * 引数     : tag (string) - 検索対象タグ
     *          source (array) - 検索対象データ
     * 戻り値   : boolean
     * ========================
     */
    function performTagSearch(tag, source) {
        console.log('[SEARCH] Performing tag search for:', tag);

        const results = [];

        for (const item of source) {
            if (!item.keywords) continue;
            const keywords = Array.isArray(item.keywords) ? item.keywords : [item.keywords];
            for (const kw of keywords) {
                if (String(kw).trim() === String(tag).trim()) {
                    results.push(item);
                    break;
                }
            }
        }

        console.log('[SEARCH] Tag search results count:', results.length);
        showSearchResultsWithFragment(results, { type: 'tag', original: tag, normalized: tag });
        return true;
    }

    /**
     * 関数名   : performIconSearch()
     * 名称     : アイコン検索の実行
     * 内容     : 指定されたアイコンクラスを持つアイテムを検索
     * 引数     : iconClass (string) - 検索対象アイコンクラス
     *          source (array) - 検索対象データ
     * 戻り値   : boolean
     * ========================
     */
    function performIconSearch(iconClass, source) {
        console.log('[SEARCH] Performing icon search for:', iconClass);

        const results = [];

        for (const item of source) {
            if (!item.iconClass) continue;
            const icons = Array.isArray(item.iconClass) ? item.iconClass : [item.iconClass];
            for (const ic of icons) {
                if (String(ic).trim() === String(iconClass).trim()) {
                    results.push(item);
                    break;
                }
            }
        }

        console.log('[SEARCH] Icon search results count:', results.length);
        showSearchResultsWithFragment(results, { type: 'icon', original: iconClass, normalized: iconClass });
        return true;
    }

    // ========================
    // フラグメント生成と結果表示（URLフラグメントを付与）
    // ========================

    function djb2Hash(str) {
        let h = 5381;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) + h) + str.charCodeAt(i);
            // keep in 32-bit int range
            h = h & 0xFFFFFFFF;
        }
        return (h >>> 0).toString(16);
    }

    function generateSearchFragment(queryInfo) {
        const base = (typeof queryInfo === 'string') ? queryInfo : (queryInfo.original || queryInfo.query || '');
        const normalized = queryInfo && queryInfo.normalized ? queryInfo.normalized : '';
        const payload = String(base) + '|' + (queryInfo && queryInfo.type ? queryInfo.type : '') + '|' + JSON.stringify(normalized);
        const hash = djb2Hash(payload);
        const ts = Date.now();
        const frag = 'q=' + encodeURIComponent(String(base)) + '&type=' + encodeURIComponent(queryInfo && queryInfo.type ? queryInfo.type : '') + '&h=' + hash + '&ts=' + ts;
        return frag;
    }

    function showSearchResultsWithFragment(results, queryInfo) {
        // 一意なフラグメントを生成
        const fragment = generateSearchFragment(queryInfo || {});

        // URL を更新（ハッシュ）
        try {
            const newUrl = location.pathname + '#' + fragment;
            history.pushState(null, '', newUrl);
        } catch (e) {
            // fallback
            location.hash = fragment;
        }

        // 検索画面を隠して、結果コンテナを表示
        try {
            const searchPanel = document.getElementById('contentIntegSearch');
            if (searchPanel) searchPanel.style.display = 'none';
        } catch (e) { /* ignore */ }

        try {
            const resultContainer = document.getElementById('contentIntegSearchResult');
            if (resultContainer) resultContainer.style.display = 'block';
        } catch (e) { /* ignore */ }

        // queryInfo に fragment を付与して表示に渡す
        const qi = Object.assign({}, queryInfo || {}, { fragment });
        displaySearchResults(results, qi);
    }

    // フラグメント解析
    function parseSearchFragment(hash) {
        if (!hash) return null;
        const raw = hash.replace(/^#/, '');
        const params = {};
        for (const pair of raw.split('&')) {
            const idx = pair.indexOf('=');
            if (idx === -1) continue;
            const k = pair.substring(0, idx);
            const v = pair.substring(idx + 1);
            params[k] = v;
        }
        params.raw = raw;
        return params;
    }

    // ハッシュ起動復元処理
    function bootstrapSearchFromHash() {
        const hash = location.hash;
        if (!hash) return false;
        const params = parseSearchFragment(hash);
        if (!params || !params.q) return false;

        const q = decodeURIComponent(params.q || '');
        const searchType = params.type || '';
        // 判定し直して結果を作る（URLフラグメント自体はそのまま表示に使う）
        const analysis = determineInputType(q);
        if (!analysis.isValid) {
            console.warn('[BOOTSTRAP] invalid query in fragment:', analysis.error);
            return false;
        }

        // 検索ロジック（performXxxSearch と同等だがハッシュは上書きしない）
        let results = [];
        if (searchType === 'tag') {
            // タグ検索の復元
            for (const item of searchSource) {
                if (!item.keywords) continue;
                const keywords = Array.isArray(item.keywords) ? item.keywords : [item.keywords];
                for (const kw of keywords) {
                    if (String(kw).trim() === String(q).trim()) {
                        results.push(item);
                        break;
                    }
                }
            }
        } else if (searchType === 'icon') {
            // アイコン検索の復元
            for (const item of searchSource) {
                if (!item.iconClass) continue;
                const icons = Array.isArray(item.iconClass) ? item.iconClass : [item.iconClass];
                for (const ic of icons) {
                    if (String(ic).trim() === String(q).trim()) {
                        results.push(item);
                        break;
                    }
                }
            }
        } else if (analysis.type === SEARCH_INPUT_TYPES.PLAIN_TEXT) {
            const queryLower = String(analysis.normalized).toLowerCase();
            for (const item of searchSource) {
                let matches = false;
                if (item.label && item.label.toLowerCase().includes(queryLower)) matches = true;
                else if (item.labelEn && item.labelEn.toLowerCase().includes(queryLower)) matches = true;
                if (!matches && item.sections && Array.isArray(item.sections)) {
                    for (const section of item.sections) {
                        const sectionText = (section.h2 || '') + ' ' + (section.text || '');
                        if (sectionText.toLowerCase().includes(queryLower)) { matches = true; break; }
                    }
                }
                if (matches) results.push(item);
            }
        } else if (analysis.type === SEARCH_INPUT_TYPES.LOGICAL_OPERATORS) {
            for (const item of searchSource) {
                if (evaluateLogicalExpression(item, analysis.normalized || analysis)) results.push(item);
            }
        } else if (analysis.type === SEARCH_INPUT_TYPES.REGEX) {
            const regexInfo = analysis.normalized || {};
            try {
                const regex = new RegExp(regexInfo.pattern, regexInfo.flags);
                for (const item of searchSource) {
                    let matches = false;
                    if ((item.label && regex.test(item.label)) || (item.labelEn && regex.test(item.labelEn))) matches = true;
                    if (!matches && item.sections && Array.isArray(item.sections)) {
                        for (const section of item.sections) {
                            const sectionText = (section.h2 || '') + ' ' + (section.text || '');
                            if (regex.test(sectionText)) { matches = true; break; }
                        }
                    }
                    if (matches) results.push(item);
                }
            } catch (e) {
                console.warn('[BOOTSTRAP] invalid regex from fragment:', e.message);
                return false;
            }
        } else {
            return false;
        }

        // UI 表示制御：検索画面を隠し結果を表示
        try { const sp = document.getElementById('contentIntegSearch'); if (sp) sp.style.display = 'none'; } catch (e) { }
        try { const rc = document.getElementById('contentIntegSearchResult'); if (rc) rc.style.display = 'block'; } catch (e) { }

        // 表示: fragment を保持した queryInfo を渡す
        const qi = {
            original: q,
            type: searchType || (analysis && analysis.type),
            normalized: analysis && analysis.normalized ? analysis.normalized : q,
            fragment: params.raw
        };
        displaySearchResults(results, qi);
        return true;
    }

    // ハッシュ変更時に復元を試みる（ユーザが別タブからハッシュを付けて開く等に対応）
    window.addEventListener('hashchange', () => {
        try { bootstrapSearchFromHash(); } catch (e) { console.error('[HASH] bootstrap failed:', e); }
    });

    function searchBreadcrumbs(allData, current) {
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
                html += `<span>Home</span>`;
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
                html += `${pathNode.label}`;
            }

            // For mainPath column: append the current article label (no link) as final item
            if (treatAsMain) {
                html += `<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>`;
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
            finalHtml += `<div class="breadcrumb_list_part">`;
            finalHtml += `<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>`;
            finalHtml += `<span>${current.label || ''}</span></div>`;
        }

        // auxPath 列も Home を先頭に表示し、最後に current のラベルを付けているが、それぞれを非表示にすることもできる。可能性としては、Git のブランチの様に表示できないか検討中
        auxPaths.forEach(ap => {
            finalHtml += renderColumnFromPath(ap, { includeHome: true, treatAsMain: true });
        });

        return finalHtml;
    }

    /**
     * 公開日/編集日
     */
    function searchDateInfo(current) {
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
            console.warn('[date-info] dateModified is earlier than datePublished. ', { datePublished: pubDateObj.toISOString(), dateModified: revDateObj.toISOString(), source: current });
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

        return html;
    }

    /**
     * 関数名   : displaySearchResults()
     * 名称     : 検索結果の表示
     * 内容     : 検索結果をDOM に挿入
     * 引数     : results (array) - マッチしたアイテム
     *          queryInfo (object) - クエリ情報
     * 戻り値   : void
     */
    // ========================
    function displaySearchResults(results, queryInfo) {
        console.log('[SEARCH] Displaying', results.length, 'results');

        const resultContainer = document.getElementById('contentIntegSearchResult');
        if (!resultContainer) {
            console.error('[SEARCH] Result container not found');
            return;
        }

        // siteData を配列に統一
        if (!Array.isArray(siteData)) {
            try {
                siteData = Object.values(siteData);
            } catch (e) {
                siteData = [];
            }
        }

        // results.id と同じ id を持つノードを siteData から探す
        const findTargetPage = (id) => siteData.find(n => n && n.id === id);

        // 結果HTMLの構築
        let resultHtml = '<div class="main search-results">';

        // 戻るボタンを追加
        resultHtml += '<div style="margin-bottom: 20px;">';
        resultHtml += '<button id="backToSearchBtn" style="padding: 8px 16px; cursor: pointer;">← 検索画面に戻る</button>';
        resultHtml += '</div>';

        resultHtml += `<h1>検索結果 ( ${results.length} 件がヒット)</h1>`;

        // クエリ情報があれば簡易表示（内部デバッグ用）
        try {
            if (queryInfo) {
                const qstr = (queryInfo.original || queryInfo.query || '');
                const frag = queryInfo.fragment ? ('<code>' + String(queryInfo.fragment) + '</code>') : '';
                if (qstr || frag) {
                    resultHtml += '<p class="search-query-info" style="overflow-wrap: break-word;">クエリ: ' + (String(qstr).replace(/</g, '&lt;')) + ' ' + frag + '</p>';
                }
            }
        } catch (e) {
            // ignore
        }

        // サムネイル等の存在チェック用ヘルパ
        const thumbHtml = (node) => {
            if (!node) return '';
            if (Array.isArray(node.thumbnailUrl) && node.thumbnailUrl.length > 0 && node.thumbnailUrl[1]) {
                const src = node.thumbnailUrl[1];
                return `<img class="search-result-thumb" src="${src}" alt="" referrerpolicy="no-referrer" loading="lazy" decoding="async" onerror="this.parentNode.querySelector('.js-aarecord-list-fallback-cover').classList.remove('hidden'); this.parentNode.removeChild(this)">`;
            }
            return ''; // サムネイルが無ければ空
        };

        if (results.length === 0) {
            resultHtml += '<p>マッチする結果がありません。</p>';
        } else {
            resultHtml += '<div class="article-list">';
            for (const result of results) {
                const targetPage = findTargetPage(result.id) || {};
                const targetThumb = thumbHtml(targetPage);
                resultHtml += '<div class="article-item">';
                resultHtml += `<a href="${targetPage.url}" class="img-container-link">`;
                resultHtml += `<div id="" class="img-container">`;
                resultHtml += `${targetThumb}`;
                resultHtml += '</div> <!-- img-container -->';
                resultHtml += '</a> <!-- img-container-link -->';
                resultHtml += '<div class="search-result-label">';
                resultHtml += '<div>';
                resultHtml += '<div class="search-result-breadcrumb_list">';
                resultHtml += '<div id="date-info" class="date">';
                resultHtml += searchBreadcrumbs(siteData, targetPage);
                resultHtml += '</div> <!-- date -->';
                resultHtml += '</div> <!-- search-result-breadcrumb_list -->';
                resultHtml += `<a href="${targetPage.url}" class="search-result-title-link">`;
                resultHtml += `<strong> ${targetPage.label || 'N/A'} </strong> (${targetPage.labelEn})`;
                resultHtml += '</a> <!-- search-result-title-link -->';
                resultHtml += '</div>';
                resultHtml += searchDateInfo(targetPage);
                resultHtml += `<div style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; line-height: 1.3;">${(result.sections?.[0]?.text || '').replace(/</g, '&lt;')}</div>`;
                resultHtml += '</div> <!-- search-result-label -->';
                resultHtml += '</div> <!-- article-item -->';
            }
            resultHtml += '</div>';
        }

        resultHtml += '</div>';
        resultContainer.innerHTML = resultHtml;
        window.scrollTo(0, 0);

        // 戻るボタンのイベントリスナーを追加
        const backBtn = document.getElementById('backToSearchBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('[SEARCH] Back to search button clicked');
                returnToSearchScreen();
            });
        }
    }

    /**
     * 関数名   : returnToSearchScreen()
     * 名称     : 検索画面に戻る
     * 内容     : 結果表示を隠し、検索画面を再表示
     * 引数     : void
     * 戻り値   : void
     */
    function returnToSearchScreen() {
        try {
            const searchPanel = document.getElementById('contentIntegSearch');
            if (searchPanel) searchPanel.style.display = 'block';
        } catch (e) { /* ignore */ }

        try {
            const resultContainer = document.getElementById('contentIntegSearchResult');
            if (resultContainer) {
                resultContainer.style.display = 'none';
                resultContainer.innerHTML = '';
            }
        } catch (e) { /* ignore */ }

        // URL をクエリなしの検索ページに戻す
        try {
            history.pushState(null, '', location.pathname);
        } catch (e) {
            location.hash = '';
        }

        // 入力フィールドをクリア
        try {
            const input = document.getElementById('labelSubstringSearchInput');
            if (input) input.value = '';
        } catch (e) { /* ignore */ }

        console.log('[SEARCH] Returned to search screen');
    }

    // ブラウザの戻る/進む操作に対応
    window.addEventListener('popstate', (event) => {
        // ハッシュが無い = 検索画面に戻す
        if (!location.hash) {
            returnToSearchScreen();
        } else {
            // フラグメントあり → 再度結果を復元
            bootstrapSearchFromHash();
        }
    });

    // ------------------------
    // 初期化フロー（状態遷移順）
    // ------------------------
    (function mainFlow() {
        try {
            console.log('[MAIN] start state machine');
            // STATE 1: search content initialization
            if (!searchContentInit()) {
                console.error('[MAIN] search content initialization failed - abort');
                return;
            }
            console.log('[MAIN] start state machine');

            initializeTocToggle();

            // STATE 1: data validation
            if (!validateData()) {
                console.error('[MAIN] data validation failed - abort');
                return;
            }

            // STATE 2: network init
            if (!initializeNetwork()) {
                console.error('[MAIN] network initialization failed - abort');
                return;
            }

            // フラグメントがあれば復元
            try { bootstrapSearchFromHash(); } catch (e) { console.error('[MAIN] bootstrapSearchFromHash error:', e); }

            // otherwise draw default graph according to selects
            currentState = STATE.IDLE;
            console.log('[MAIN] entering IDLE state');
        } catch (e) {
            console.error('[MAIN] unexpected error:', e);
            currentState = STATE.ERROR;
        }
    })();

    // ------------------------
    // 公開（デバッグ用）
    // ------------------------
    window.__SiteGraph = {
        STATE,
        getCurrentState: () => currentState,
        getErrorFlags: () => ({ ...errorFlags }),
        reinitNetwork: () => { networkInitialized = false; return initializeSearchUI(); }
    };
});
