// ----------------------------------------------------------------------------
// ファイル名    : siteCategoricalDiagram.js
// 名称          : サイト圏図式生成スクリプト
// 内容          : サイト内の学問体系を圏図式で表現するためのデータロードと初期化処理
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
    console.log('[INIT] Loading nodesData...');
    const nodesData = await fetch('https://tatsuy-kobayashi.github.io/my-web/docs/data/siteData.json').then(response => response.json());

    // ------------------------
    // データ（エッジ）
    // ------------------------
    // from → to の方向性を持つ
    // ------------------------
    /*console.log('[INIT] Loading edgesData...');
    const edgesData = [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 0, to: 3 },
        { from: 0, to: 4 },
        { from: 0, to: 5 },
        { from: 0, to: 6 },

        { from: 1, to: 10 },
        { from: 1, to: 11 },
        { from: 3, to: 30 },
        { from: 3, to: 31 },
        { from: 4, to: 40 },

        { from: 30, to: 300 },
        { from: 30, to: 301 },
        { from: 30, to: 302 },
        { from: 30, to: 303 },
        { from: 30, to: 304 },

        { from: 304, to: 3040 }
    ];*/

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

    // ------------------------
    // 関数名   : buildEdgesFromPaths(filteredNodes)
    // 名称     : path からエッジ情報を生成する処理
    // 内容     : filteredNodes に含まれる path を元に、エッジ情報を生成する
    // 引数     : filteredNodes - ユーザ操作で選択されたノード配列
    // 戻り値   : edges - 生成されたエッジ配列
    // ------------------------
    function buildEdgesFromPaths(filteredNodes) {
        const visible = new Set(filteredNodes.map(n => n.id));
        const edges = [];
        // 重複エッジ防止用（from->to をキーにする）
        // ただし、同じ from->to でも main と aux が競合する場合、main を優先する仕様とする
        const dedup = new Map(); // Key: "from->to", Value: "main" | "aux"

        // 内部関数: パスからエッジを抽出して一時マップに登録
        const processPaths = (node, pathList, type) => {
            if (!pathList) return;
            for (const pathStr of pathList) {
                const parts = pathStr.split(":").map(Number);

                // mainPath: 末尾が自身のID
                // auxPath: 末尾が親ノードIDを指す（親 -> node のエッジを1本作る）
                let isValid = false;
                if (type === 'main') {
                    // mainPath は従来通り：末尾が自身のID
                    isValid = (parts[parts.length - 1] === node.id);
                } else if (type === 'aux') {
                    // auxPath は新仕様：末尾が親ノードのID
                    // したがって parts.length >= 1 であれば OK（末尾が何らかの親を指す）
                    isValid = (parts.length >= 1);
                }

                if (!isValid) {
                    console.warn(`[WARN] ${type}Path validation failed for node ${node.id}: ${pathStr}`);
                    continue;
                }

                for (let i = 0; i < parts.length - 1; i++) {
                    const from = parts[i];
                    const to = parts[i + 1];

                    // 可視ノード同士のみ
                    if (!visible.has(from) || !visible.has(to)) continue;

                    const key = `${from}->${to}`;
                    const currentType = dedup.get(key);

                    // まだ登録されていない、または既存が aux で今回が main の場合は上書き（main優先）
                    if (!currentType || (currentType === 'aux' && type === 'main')) {
                        dedup.set(key, type);
                    }
                }
            }
        };

        for (const n of filteredNodes) {
            // 1. auxPath (副経路) を先に処理
            processPaths(n, n.auxPath, 'aux');
            // 2. mainPath (主経路) を後に処理（重複時は main として判定させるため）
            processPaths(n, n.mainPath, 'main');
        }

        // マップから最終的なエッジ配列を生成
        dedup.forEach((type, key) => {
            const [from, to] = key.split('->').map(Number);

            let edgeOptions = { from, to };

            if (type === 'main') {
                // 主経路: 直線（物理演算の骨格となる）
                edgeOptions.smooth = { enabled: false };
                // 必要であれば色や幅を強調
                // edgeOptions.width = 2;
            } else {
                // 副経路: 曲線（物理要請を尊重しつつ、空いている空間を通す）
                edgeOptions.smooth = {
                    enabled: true,
                    type: "dynamic",   // 動的に曲がり具合を調整
                    roundness: 0.4
                };
                // 物理的な長さを主経路の数倍に設定して「緩く」する
                // これにより、主経路の構造（反発力と張力）が優先され、副経路はそこからあぶれた距離をつなぐ形になる
                edgeOptions.length = 300; // default (65) の約4〜5倍
                // 副経路であることを視覚的に区別（例: 破線、少し薄い色など）
                edgeOptions.dashes = true;
                edgeOptions.color = { opacity: 0.6, inherit: 'from' };
            }

            edges.push(edgeOptions);
        });

        return edges;
    }

    // build parent/child maps from nodesData.paths
    let __parentsMap = null;   // childId -> Set(parentIds)
    let __childrenMap = null;  // parentId -> Set(childIds)

    // ------------------------
    // 関数名   : buildParentChildMaps(void)
    // 名称     : paths から親/子関係マップを生成する処理
    // 内容     : nodesData に含まれる paths を元に、親/子関係マップを生成する
    // 引数     : void
    // 戻り値   : None
    // ------------------------
    function buildParentChildMaps() {
        __parentsMap = new Map();
        __childrenMap = new Map();
        const ids = new Set(nodesData.map(n => n.id));

        for (const n of nodesData) {
            // mainPath は従来通り処理
            if (n.mainPath) {
                const mainPaths = Array.isArray(n.mainPath) ? n.mainPath : [n.mainPath];
                mainPaths.forEach(p => {
                    if (typeof p !== 'string') return;
                    const parts = p.split(':').map(Number);
                    for (let i = 0; i < parts.length - 1; i++) {
                        const parent = parts[i];
                        const child = parts[i + 1];
                        if (!ids.has(parent) || !ids.has(child)) continue;

                        if (!__childrenMap.has(parent)) __childrenMap.set(parent, new Set());
                        __childrenMap.get(parent).add(child);
                        if (!__parentsMap.has(child)) __parentsMap.set(child, new Set());
                        __parentsMap.get(child).add(parent);
                    }
                });
            }

            // auxPath: 末尾が親 ID を指す想定だが、一方で副分類を重複追加してはいない
            if (n.auxPath) {
                const auxPaths = Array.isArray(n.auxPath) ? n.auxPath : [n.auxPath];
                auxPaths.forEach(p => {
                    if (typeof p !== 'string') return;
                    const parts = p.split(':').map(Number);

                    if (parts.length >= 1) {
                        // try to use the literal parent id; if missing, attempt resolution by prefix
                        let parent = parts[parts.length - 1];
                        if (!ids.has(parent)) {
                            const resolved = resolveAuxParentId(parts);
                            if (resolved == null) {
                                console.warn(`[WARN] auxPath references non-existent node and could not be resolved: ${p}`);
                                return; // skip this auxPath
                            }
                            parent = resolved;
                            console.log(`[INFO] auxPath parent ${parts[parts.length - 1]} resolved -> ${parent} for node ${n.id}`);
                        }

                        const child = n.id;
                        if (!__childrenMap.has(parent)) __childrenMap.set(parent, new Set());
                        __childrenMap.get(parent).add(child);
                        if (!__parentsMap.has(child)) __parentsMap.set(child, new Set());
                        __parentsMap.get(child).add(parent);
                    }
                });
            }
        }
    }

    // compute focus set: include nodeId, ancestors up levels, descendants down levels
    // ------------------------
    // 関数名   : computeFocusSet(nodeId, upDepth = 1, downDepth = 1)
    // 名称     : ノードを中心に、親/子関係を元に focus set を計算する処理
    // 内容     : nodeId を中心に、upDepth 階層分の ancestors と downDepth 階層分の descendants を含む Set を計算する
    // 引数     : nodeId - ノードID
    //            upDepth - 上方向に探索する階層数(0以上の整数)
    //            downDepth - 下方向に探索する階層数(0以上の整数)
    // 戻り値   : Set - focus set
    // ------------------------
    function computeFocusSet(nodeId, upDepth = 1, downDepth = 1) {
        if (!__parentsMap || !__childrenMap) buildParentChildMaps();
        const result = new Set();
        result.add(nodeId);

        // ancestors (up)
        let current = new Set([nodeId]);
        for (let d = 0; d < upDepth; d++) {
            const next = new Set();
            for (const id of current) {
                const parents = __parentsMap.get(id);
                if (!parents) continue;
                for (const p of parents) {
                    if (!result.has(p)) {
                        result.add(p);
                        next.add(p);
                    }
                }
            }
            if (next.size === 0) break;
            current = next;
        }

        // descendants (down)
        current = new Set([nodeId]);
        for (let d = 0; d < downDepth; d++) {
            const next = new Set();
            for (const id of current) {
                const children = __childrenMap.get(id);
                if (!children) continue;
                for (const c of children) {
                    if (!result.has(c)) {
                        result.add(c);
                        next.add(c);
                    }
                }
            }
            if (next.size === 0) break;
            current = next;
        }

        return result;
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
        networkContainer: $id('network'),
        minDepth: $id('minDepth'),
        maxDepth: $id('maxDepth'),
        updateBtn: $id('updateBtn'),
        labelSearchInput: $id('labelSearchInput'),
        labelSearchBtn: $id('labelSearchBtn'),
        labelSearchSuggestions: $id('labelSearchSuggestions'),
        pageSearchInput: $id('pageSearchInput'),
        pageSearchBtn: $id('pageSearchBtn'),
        pageSearchSuggestions: $id('pageSearchSuggestions'),
        focusUp: $id('focusUp'),
        focusDown: $id('focusDown'),
        clickModeRadios: document.getElementsByName('clickMode'),
        colorModeRadios: document.getElementsByName('colorMode')
    };

    // DOM 要素が揃っているか簡易チェック
    if (!dom.networkContainer || !dom.minDepth || !dom.maxDepth || !dom.updateBtn || !dom.labelSearchInput || !dom.labelSearchBtn) {
        console.error('[ERROR] 必要な DOM 要素が見つかりません。処理を中止します。');
        errorFlags.missingDom = true;
        currentState = STATE.ERROR;
        return;
    }

    // ------------------------
    // vis-network 管理（初回生成は1度だけ）
    // ------------------------
    let network = null; // vis-network インスタンス
    let networkInitialized = false; // 初期化済みフラグを失敗で初期化

    // ------------------------
    // 関数名   : u1f_initNetworkIfNeeded()
    // 名称     : network 初期化処理
    // 内容     : network が未初期化なら初期化を行う
    // 引数     : void
    // 戻り値   : boolean - 初期化成功なら true、失敗または既にエラー状態なら false
    // ------------------------
    function u1f_initNetworkIfNeeded() {
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
                physics: {
                    enabled: true,
                    solver: "forceAtlas2Based",
                    forceAtlas2Based: {
                        gravitationalConstant: -40,  // 反発力を弱める（デフォルト -200）
                        springLength: 65,            // エッジの自然長を短くする（重要）
                        springConstant: 0.2          // バネの硬さ、強すぎると暴れる
                    },
                    stabilization: {
                        enabled: true,
                        iterations: 200              // 少なすぎると変な形で止まりやすい
                    }
                },
                interaction: { hover: true, zoomView: true },
                edges: {
                    arrows: "to",
                    smooth: {
                        enabled: false               // 変な曲がりをなくすため
                    }
                }
            };

            network = new vis.Network(dom.networkContainer, data, options);
            networkInitialized = true;
            console.log('[NETWORK] vis.Network 初期化完了');
            return true;
        } catch (e) {
            console.error('[ERROR] network 初期化に失敗しました:', e);
            errorFlags.networkInitFailed = true;
            currentState = STATE.ERROR;
            return false;
        }
    }

    // 色計算ヘルパー
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    const toHex = v => ('0' + clamp(v).toString(16)).slice(-2);

    function detectCategoryFromNode(n) {
        // カテゴリ判定は mainPath のみを使用する（auxPathによる汚染を防ぐ）
        const paths = n.mainPath;
        // mainPath は validateData で必須チェック済みだが、念のためガード
        if (!paths || !paths.length) return null;
        // 最初の mainPath を正とする
        for (const p of paths) {
            const parts = p.split(':').map(Number);

            // 配列の要素数が2以上（ルートと大カテゴリを含む）であり、かつ先頭（ルート）が確実に '0' であることを確認（データの整合性チェック）
            if (parts.length >= 2 && parts[0] === 0) {
                // 「そのノードがどの『大カテゴリ（分野）』に属しているか」を知るために2番目の要素（インデックス1）を返す
                return parts[1]; // 1..6 expected
            }
        }
        return null;
    }

    // 関数: compute rainbow color according to spec
    function computeRainbowHex(n) {
        const l = (typeof n.level === 'number' && Number.isFinite(n.level)) ? n.level : 0;
        const cat = detectCategoryFromNode(n);
        // root
        if (n.id === 0 || l === 0) {
            return `#${toHex(255)}${toHex(255)}${toHex(255)}`; // white
        }
        const level = l;
        const inRange = (level >= 1 && level <= 8);
        let r = 255, g = 255, b = 255;
        switch (cat) {
            case 1: // 人文科学
                if (inRange) { r = 255; g = 256 - 32 * level; b = 256 - 32 * level; }
                else { r = 255; g = 0; b = 0; }
                break;
            case 2: // 社会科学
                if (inRange) { r = 255; g = 255; b = 256 - 32 * level; }
                else { r = 255; g = 255; b = 0; }
                break;
            case 3: // 形式科学
                if (inRange) { r = 256 - 32 * level; g = 255; b = 256 - 32 * level; }
                else { r = 0; g = 255; b = 0; }
                break;
            case 4: // 自然科学
                if (inRange) { r = 256 - 32 * level; g = 255; b = 255; }
                else { r = 0; g = 255; b = 255; }
                break;
            case 5: // 応用科学
                if (inRange) { r = 256 - 32 * level; g = 256 - 32 * level; b = 255; }
                else { r = 0; g = 0; b = 255; }
                break;
            case 6: // 学際領域
                if (inRange) { r = 255; g = 256 - 32 * level; b = 255; }
                else { r = 255; g = 0; b = 255; }
                break;
            default:
                // unknown category: fallback to grey-ish by level
                if (inRange) { const v = 256 - 16 * level; r = v; g = v; b = v; }
                else { r = 200; g = 200; b = 200; }
        }
        // clamp and form hex
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // border darker
    function darkenHex(hex, amount = 30) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `#${toHex(r - amount)}${toHex(g - amount)}${toHex(b - amount)}`;
    }

    // ノードに適用する色オブジェクトを計算する
    function computeNodeColorObj(n, colorMode) {
        if (colorMode === 'rainbow') {
            const bg = computeRainbowHex(n);
            const border = darkenHex(bg, 30);
            return { background: bg, border: border, highlight: { background: bg, border: border } };
        }
        // colorMode === 'default-color': 共通のデフォルトカラーを明示的に適用（古い色を上書き）
        return { background: '#97C2FC', border: '#2B7CE9', highlight: { background: '#D2E5FF', border: '#2B7CE9' } };
    }

    // ------------------------
    // 関数名   : vof_setNetworkData(nodeList, edgeList)
    // 名称     : network のデータ更新
    // 内容     : network に nodeList と edgeList をセットする（初回は setData が使える想定）
    // 引数     : nodeList - ノードリスト配列
    //            edgeList - エッジリスト配列
    // 戻り値   : void
    // ------------------------
    function vof_setNetworkData(nodeList, edgeList) {
        console.log('[NETWORK] Updating network data...');
        if (!u1f_initNetworkIfNeeded()) return;
        try {
            // get selected color mode ('default-color' or 'rainbow')
            const colorModeEl = document.querySelector('input[name="colorMode"]:checked');
            const colorMode = colorModeEl ? colorModeEl.value : 'default-color';

            // Map nodeList to nodes for vis, applying color mode
            const mappedNodes = nodeList.map(n => {
                const nodeCopy = Object.assign({}, n); // shallow copy
                nodeCopy.color = computeNodeColorObj(n, colorMode);
                return nodeCopy;
            });

            const nodes = new vis.DataSet(mappedNodes);
            const edges = new vis.DataSet(edgeList);
            network.setData({ nodes, edges });
            console.log('[NETWORK] setData 実行: nodes=', nodeList.length, 'edges=', edgeList.length);
        } catch (e) {
            console.error('[ERROR] vof_setNetworkData 失敗:', e);
        }
    }

    function normalizeAuxPathsIfNeeded(nodes) {
        const ids = new Set(nodes.map(n => n.id));

        for (const node of nodes) {
            if (!node.auxPath) continue;
            const auxArr = Array.isArray(node.auxPath) ? [...node.auxPath] : [node.auxPath];

            for (let i = 0; i < auxArr.length; i++) {
                const p = auxArr[i];
                if (typeof p !== 'string') continue;
                const parts = p.split(':');
                if (parts.length < 1) continue;
                const lastId = Number(parts[parts.length - 1]);

                if (!ids.has(lastId)) {
                    // 存在しない末尾IDはこの node.id で置換する
                    parts[parts.length - 1] = String(node.id);
                    const replaced = parts.join(':');
                    auxArr[i] = replaced;
                    console.log('[INFO] auxPath末尾を置換:', p, '->', replaced);
                }
            }
            node.auxPath = Array.isArray(node.auxPath) ? auxArr : auxArr[0];
        }
    }

    // ------------------------
    // STATE 1: DATA_INITIALIZATION
    // （ここでは簡単なバリデーションを行う）
    // ------------------------
    function validateData() {
        currentState = STATE.DATA_INITIALIZATION;
        console.log('[STATE] DATA_INITIALIZATION');

        // ノード id 重複チェック
        // IDs を事前に収集しておく（空のままだと存在チェックが常に失敗する問題の修正）
        const ids = new Set();
        const duplicateIds = [];
        for (const n of nodesData) {
            if (ids.has(n.id)) duplicateIds.push(n.id);
            ids.add(n.id);
        }
        if (duplicateIds.length) {
            console.error('[ERROR] ノードIDの重複が検出されました:', duplicateIds);
            errorFlags.invalidData = true;
        }

        // auxPath の正規化
        // auxPath の末尾が存在しない参照になっている場合、
        // チェック対象ノードの id で置換しておく（ユーザ要望どおり）
        normalizeAuxPathsIfNeeded(nodesData);

        for (const n of nodesData) {
            if (!n.mainPath || n.mainPath.length === 0) {
                errorFlags.invalidData = true;
                continue;
            }

            const pathsToCheck = [...n.mainPath];
            if (n.auxPath && Array.isArray(n.auxPath)) {
                pathsToCheck.push(...n.auxPath);
            }

            for (const p of pathsToCheck) {
                const parts = p.split(':').map(Number);
                const isMainPath = Array.isArray(n.mainPath) && n.mainPath.includes(p);

                if (isMainPath) {
                    // 末尾チェック
                    if (parts[parts.length - 1] !== n.id) {
                        console.error('[ERROR] mainPath の末尾が id と一致しません:', n.id, p);
                        errorFlags.invalidData = true;
                        continue;
                    }
                    // 参照チェック
                    for (const pid of parts) {
                        if (!ids.has(pid)) {
                            console.error('[ERROR] path が存在しないノードを参照しています:', p, 'missing:', pid);
                            errorFlags.invalidData = true;
                        }
                    }
                } else {
                    // auxPath: 末尾は親ID（緩い条件）
                    if (parts.length < 1) {
                        console.error('[ERROR] auxPath が空です:', n.id, p);
                        errorFlags.invalidData = true;
                        continue;
                    }
                }
            }
        }

        if (errorFlags.invalidData) {
            currentState = STATE.ERROR;
            return false;
        }

        // ensure levels are present/consistent かつ最大深さを計算（mainPath 優先で計算）
        const computedMax = vof_ensureLevelsFromPaths(nodesData);
        maxAvailableLevel = (typeof computedMax === 'number' && Number.isFinite(computedMax)) ? computedMax : 0;
        console.log('[DATA] computed maxAvailableLevel =', maxAvailableLevel);

        return true;
    }

    // ------------------------
    // STATE 2: NETWORK_INITIALIZATION
    // ------------------------
    function initializeNetwork() {
        currentState = STATE.NETWORK_INITIALIZATION;
        console.log('[STATE] NETWORK_INITIALIZATION');

        const ok = u1f_initNetworkIfNeeded();
        if (!ok) return false;

        // 初回描画：デフォルト（min/max）による描画をしないで空で開始することも選べる
        // 今は初期値を用いて描画
        performDepthSearch(); // 正しい深さを使用
        return true;
    }

    // ------------------------
    // HASH_BOOTSTRAP / BOOTSTRAP_SEARCH
    // ------------------------
    function bootstrapFromHash() {
        currentState = STATE.HASH_BOOTSTRAP;
        console.log('[STATE] HASH_BOOTSTRAP');

        const raw = window.location.hash || '';
        if (!raw) {
            console.log('[HASH] fragment が存在しません');
            return false;
        }

        let idFromHash = null;

        // パターン: #id_30
        if (/^#id_\d+$/.test(raw)) {
            idFromHash = Number(raw.replace('#id_', ''));
        } else {
            console.log('[HASH] 未対応のハッシュ形式:', raw);
            return false;
        }

        if (!Number.isFinite(idFromHash)) {
            console.warn('[HASH] 数値抽出に失敗:', raw);
            return false;
        }

        console.log('[HASH] ID from fragment:', idFromHash);

        // ここで入力フォームへ値を自動セット（ID に対応する label を取得して表示）
        const labelInput = document.getElementById('labelSearchInput');
        if (labelInput) {
            const targetNode = nodesData.find(n => n.id === idFromHash);
            if (targetNode) {
                labelInput.value = targetNode.label;  // ID ではなく label を代入
                console.log('input successed:', targetNode.label);
            } else {
                console.warn('Node not found for id:', idFromHash);
            }
        } else {
            console.warn('input failed');
        }

        // BOOTSTRAP_SEARCH 実行（成功時は true）
        return u1f_performIdSearch(idFromHash, { fromHash: true });
    }

    // ------------------------
    // SEARCH 処理（共通）
    // ------------------------
    // - performDepthSearch() : min/max から
    // ------------------------
    function performDepthSearch() {
        currentState = STATE.SEARCHING;
        console.log('[SEARCH] performDepthSearch start');

        // 深さ検証
        let min = Number(dom.minDepth.value);
        let max = Number(dom.maxDepth.value);
        if (!Number.isFinite(min) || !Number.isFinite(max)) {
            alert('数値を入力してください');
            currentState = STATE.IDLE;
            return;
        }
        // 整数かつ非負か確認
        if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < 0) {
            alert('0 以上の整数で入力してください');
            currentState = STATE.IDLE;
            return;
        }
        // min/max の整合
        if (min > max) {
            alert('最小深さは最大深さ以下にしてください');
            currentState = STATE.IDLE;
            return;
        }
        // データが持つ最大深さを超えていないか確認
        if (max > maxAvailableLevel) {
            alert(`指定した最大深さ [${max}] はデータの最大深さ [${maxAvailableLevel}] を超えています。表示可能な最大深さに合わせます。`);
            max = maxAvailableLevel;
            dom.maxDepth.value = String(max);
            if (min > max) {
                // min が超過してしまう場合は min を clamp
                min = Math.max(0, max);
                dom.minDepth.value = String(min);
            }
        }

        // filter nodes and edges
        const filteredNodes = nodesData.filter(n => (typeof n.level === 'number') && n.level >= min && n.level <= max);
        const filteredEdges = buildEdgesFromPaths(filteredNodes);

        // 描画
        vof_setNetworkData(filteredNodes, filteredEdges);

        // 見た目ロック（深さ検索が適用されている状態を示す）
        vof_applyVisualLock('depth');

        currentState = STATE.IDLE;
        console.log('[SEARCH] performDepthSearch done');
    }

    // label から id を検索
    // 複数マッチした場合は最初のものを返す
    function u1f_findNodeByLabel(label) {
        if (!label || label.trim() === '') {
            // 無記入の場合は id: 0 (学問)
            return nodesData.find(n => n.id === 0);
        }
        const trimmed = label.trim().toLowerCase();
        return nodesData.find(n => n.label.toLowerCase().includes(trimmed));
    }

    // label にマッチする候補を返す（全ノードデータから）
    function u1f_suggestNodesByLabel(label) {
        if (!label || label.trim() === '') {
            return [];
        }
        const trimmed = label.trim().toLowerCase();
        return nodesData.filter(n => n.label.toLowerCase().includes(trimmed)).slice(0, 10); // 最大10件
    }

    // label にマッチする候補を返す（現在表示中のノードのみ）
    function u1f_suggestVisibleNodesByLabel(label) {
        if (!label || label.trim() === '') {
            return [];
        }
        if (!network || !network.body || !network.body.data || !network.body.data.nodes) {
            return [];
        }
        const trimmed = label.trim().toLowerCase();
        const visibleNodes = network.body.data.nodes.get(); // 表示中のノード配列
        return visibleNodes.filter(n => n.label && n.label.toLowerCase().includes(trimmed)).slice(0, 10); // 最大10件
    }

    // 新規関数：label での検索実行
    function u1f_performLabelSearch(label, options = {}) {
        currentState = STATE.SEARCHING;
        console.log('[SEARCH] u1f_performLabelSearch start, label=', label, 'options=', options);

        const target = u1f_findNodeByLabel(label);
        if (!target) {
            alert('指定した学問「' + label + '」が見つかりません');
            currentState = STATE.IDLE;
            return false;
        }

        const id = target.id;
        const level = target.level;
        const min = Math.max(0, level - 1);
        let max = level + 1;
        // データの最大深さを超えている場合は clamp
        if (max > maxAvailableLevel) { max = maxAvailableLevel }

        // 深さを更新（UI に反映）
        dom.minDepth.value = String(min);
        dom.maxDepth.value = String(max);

        // node/edge フィルタ
        const filteredNodes = nodesData.filter(n => (typeof n.level === 'number') && n.level >= min && n.level <= max);
        const filteredEdges = buildEdgesFromPaths(filteredNodes);

        // 描画
        vof_setNetworkData(filteredNodes, filteredEdges);

        // 見た目ロック（label検索が適用されている状態を示す）
        vof_applyVisualLock('id');

        currentState = STATE.IDLE;
        console.log('[SEARCH] u1f_performLabelSearch done');
        return true;
    }

    // ------------------------
    // ページ内検索ハイライト管理
    // ------------------------
    let _pageSearchHighlightTimer = null;
    let _pageSearchHighlightNodeId = null;
    let _pageSearchDragListener = null;
    let _pageSearchClickListener = null;

    // ------------------------
    // 関数名   : vof_clearPageSearchHighlight()
    // 名称     : ページ内検索ハイライト解除
    // 内容     : 赤色ハイライトを解除し、デフォルト色に戻す
    // 引数     : void
    // 戻り値   : void
    // ------------------------
    function vof_clearPageSearchHighlight() {
        if (_pageSearchHighlightTimer) {
            clearTimeout(_pageSearchHighlightTimer);
            _pageSearchHighlightTimer = null;
        }
        if (_pageSearchHighlightNodeId !== null && network && network.body && network.body.data && network.body.data.nodes) {
            try {
                const existing = network.body.data.nodes.get(_pageSearchHighlightNodeId);
                if (existing) {
                    network.body.data.nodes.update({
                        id: _pageSearchHighlightNodeId,
                        color: { background: '#97C2FC', border: '#2B7CE9', highlight: { background: '#D2E5FF', border: '#2B7CE9' } }
                    });
                }
            } catch (e) {
                console.warn('[PAGE_SEARCH] clearHighlight failed:', e);
            }
        }
        // イベントリスナー解除
        if (_pageSearchClickListener && network) {
            network.off('click', _pageSearchClickListener);
            _pageSearchClickListener = null;
        }
        if (_pageSearchDragListener && network) {
            network.off('dragStart', _pageSearchDragListener);
            _pageSearchDragListener = null;
        }
        _pageSearchHighlightNodeId = null;
        console.log('[PAGE_SEARCH] highlight cleared');
    }

    // ------------------------
    // 関数名   : u1f_performPageSearch(label)
    // 名称     : ページ内検索実行
    // 内容     : 完全一致でノードを検索し、ヒット時は赤色ハイライト+フォーカス
    // 引数     : label - 検索文字列
    // 戻り値   : void
    // ------------------------
    function u1f_performPageSearch(label) {
        console.log('[PAGE_SEARCH] u1f_performPageSearch start, label=', label);

        // 既存ハイライトをクリア
        vof_clearPageSearchHighlight();

        if (!label || label.trim() === '') {
            return;
        }
        const trimmed = label.trim();

        // 完全一致検索
        const target = nodesData.find(n => n.label === trimmed);
        if (!target) {
            console.log('[PAGE_SEARCH] no exact match found for:', trimmed);
            return;
        }

        const nodeId = target.id;

        // 現在表示中のネットワークに存在するか確認
        if (!network || !network.body || !network.body.data || !network.body.data.nodes) {
            return;
        }
        const visNode = network.body.data.nodes.get(nodeId);
        if (!visNode) {
            console.log('[PAGE_SEARCH] node not in current network:', nodeId);
            return;
        }

        // カラーモードをデフォルトに変更
        const defaultRadio = document.querySelector('input[name="colorMode"][value="default-color"]');
        if (defaultRadio && !defaultRadio.checked) {
            defaultRadio.checked = true;
            refreshNetworkColors();
        }

        // ヒットノードを赤色に変更
        network.body.data.nodes.update({
            id: nodeId,
            color: { background: '#FF0000', border: '#CC0000', highlight: { background: '#FF3333', border: '#CC0000' } }
        });
        _pageSearchHighlightNodeId = nodeId;

        // フォーカス
        network.focus(nodeId, { scale: 1.2, animation: { duration: 500 } });

        // 10秒後に自動リセット
        _pageSearchHighlightTimer = setTimeout(() => {
            vof_clearPageSearchHighlight();
        }, 10000);

        // ユーザ操作でリセット
        _pageSearchClickListener = function () {
            vof_clearPageSearchHighlight();
        };
        _pageSearchDragListener = function () {
            vof_clearPageSearchHighlight();
        };
        network.on('click', _pageSearchClickListener);
        network.on('dragStart', _pageSearchDragListener);

        console.log('[PAGE_SEARCH] highlighted node:', nodeId);
    }

    // ------------------------
    // u1f_performIdSearch(id, options = {})
    // 引数：
    // - u1f_performIdSearch(id) : id 指定から
    // - id: 数値
    // - options: { fromHash: boolean } -- ハッシュ起動かどうかのフラグ
    // 戻り値：true if success, false if not
    // ------------------------
    function u1f_performIdSearch(id, options = {}) {
        currentState = STATE.SEARCHING;
        console.log('[SEARCH] u1f_performIdSearch start, id=', id, 'options=', options);

        if (!Number.isFinite(id)) {
            alert('ID が不正です');
            currentState = STATE.IDLE;
            return false;
        }

        const target = nodesData.find(n => n.id === id);
        if (!target) {
            alert('指定したIDのノードが存在しません: ' + id);
            currentState = STATE.IDLE;
            return false;
        }

        const level = target.level;
        const min = Math.max(0, level - 1);
        let max = level + 1;
        // データの最大深さを超えている場合は clamp
        if (max > maxAvailableLevel) { max = maxAvailableLevel }

        // 深さを更新（UI に反映）
        dom.minDepth.value = String(min);
        dom.maxDepth.value = String(max);

        // node/edge フィルタ
        const filteredNodes = nodesData.filter(n => (typeof n.level === 'number') && n.level >= min && n.level <= max);
        const filteredEdges = buildEdgesFromPaths(filteredNodes);

        // 描画
        vof_setNetworkData(filteredNodes, filteredEdges);

        // 見た目ロック（ID検索が適用されている状態を示す）
        vof_applyVisualLock('id');

        currentState = STATE.IDLE;
        console.log('[SEARCH] u1f_performIdSearch done');
        return true;
    }

    // perform node-focus display
    function u1f_performNodeFocus(nodeId, up = 1, down = 1) {
        currentState = STATE.SEARCHING;
        console.log('[SEARCH] u1f_performNodeFocus start, id=', nodeId, 'up=', up, 'down=', down);

        const target = nodesData.find(n => n.id === nodeId);
        if (!target) {
            alert('指定したノードが見つかりません: ' + nodeId);
            currentState = STATE.IDLE;
            return false;
        }

        const focusSet = computeFocusSet(nodeId, Math.max(0, Math.floor(Number(up) || 0)), Math.max(0, Math.floor(Number(down) || 0)));
        const filteredNodes = nodesData.filter(n => focusSet.has(n.id));
        const filteredEdges = buildEdgesFromPaths(filteredNodes);

        vof_setNetworkData(filteredNodes, filteredEdges);
        vof_applyVisualLock('id'); // reuse id-lock (visual effect)
        currentState = STATE.IDLE;
        console.log('[SEARCH] u1f_performNodeFocus done, nodes=', filteredNodes.length);
        return true;
    }

    // ------------------------
    // 見た目ロック（disabled は使わず、.dimmed のみで示す）
    // ------------------------
    let currentLock = null; // null | 'id' | 'depth'

    // ------------------------
    // 関数名   : vof_applyVisualLock(searchMode)
    // 名称     : 見た目ロック適用
    // 内容     : 指定されたモードに応じて、関連する UI 要素を dimmed にする
    // 引数     : searchMode: 'id' or 'depth'
    // 戻り値   : void
    // ------------------------
    function vof_applyVisualLock(searchMode) {
        // searchMode: 'id' or 'depth'
        currentLock = searchMode;
        console.log('[UI] vof_applyVisualLock:', searchMode);

        // 要素群（存在チェックしてから扱う）
        const depthInputControls = [dom.minDepth, dom.maxDepth].filter(Boolean);
        const depthBtnControls = [dom.updateBtn].filter(Boolean);
        const labelInputControls = [dom.labelSearchInput, dom.labelSearchSuggestions].filter(Boolean);
        const labelBtnControls = [dom.labelSearchBtn].filter(Boolean);

        // いったん全要素から dimmed を除去
        [...depthInputControls, ...depthBtnControls, ...labelInputControls, ...labelBtnControls].forEach(el => {
            if (el && el.classList) {
                el.classList.remove('dimmed');
                el.classList.remove('btn-dim');
            }
        });

        if (searchMode === 'id') {
            // ラベル（id）検索モードでは深さ操作を弱める
            depthInputControls.forEach(el => { if (el && el.classList) el.classList.add('dimmed'); });
            depthBtnControls.forEach(el => { if (el && el.classList) el.classList.add('btn-dim'); });
        } else if (searchMode === 'depth') {
            // 深さモードではラベル操作を弱める
            labelInputControls.forEach(el => { if (el && el.classList) el.classList.add('dimmed'); });
            labelBtnControls.forEach(el => { if (el && el.classList) el.classList.add('btn-dim'); });
        }
    }

    // ------------------------
    // 関数名   : vof_clearVisualLock()
    // 名称     : 見た目ロック解除処理
    // 内容     : 現在の見た目ロックを解除する
    // 引数     : void
    // 戻り値   : void
    // ------------------------
    function vof_clearVisualLock() {
        if (!currentLock) return;
        console.log('[UI] vof_clearVisualLock from', currentLock);
        currentLock = null;

        const depthControls = [dom.minDepth, dom.maxDepth, dom.updateBtn].filter(Boolean);
        const labelControls = [dom.labelSearchInput, dom.labelSearchBtn, dom.labelSearchSuggestions].filter(Boolean);

        [...depthControls, ...labelControls].forEach(el => {
            if (el && el.classList) {
                el.classList.remove('dimmed');
                el.classList.remove('btn-dim');
            }
        });
    }

    // 再フォーカス時の解除（ユーザがどれかに focus したら見た目を戻す）
    [dom.labelSearchInput, dom.minDepth, dom.maxDepth].forEach(el => {
        el.addEventListener('focus', () => {
            if (currentLock) vof_clearVisualLock();
        });
    });

    // 再レンダリング（現在表示中のノードの色だけを差分更新する。レイアウトは維持される）
    function refreshNetworkColors() {
        if (!network || !network.body || !network.body.data || !network.body.data.nodes) return;
        try {
            const colorModeEl = document.querySelector('input[name="colorMode"]:checked');
            const colorMode = colorModeEl ? colorModeEl.value : 'default-color';

            const currentNodes = network.body.data.nodes.get(); // 表示中のノード配列
            const updates = currentNodes.map(n => ({
                id: n.id,
                color: computeNodeColorObj(n, colorMode)
            }));
            network.body.data.nodes.update(updates);
            console.log('[UI] refreshNetworkColors executed (in-place), nodes=', updates.length);
        } catch (e) {
            console.warn('[UI] refreshNetworkColors failed:', e);
        }
    }

    // ------------------------
    // ノード説明パネル
    // ------------------------
    function showNodeInfo(node) {
        const panel = document.getElementById('nodeInfoPanel');
        const title = document.getElementById('nodeInfoTitle');
        const titleEn = document.getElementById('nodeInfoTitleEn');
        const body = document.getElementById('nodeInfoBody');

        title.textContent = node.label;
        titleEn.textContent = node.labelEn || '';

        // ノード説明：node.description が無いなら空文字
        // innerHTML を使用して TeX デリミタ ($...$) を MathJax が認識できるようにする
        const desc = node.description || "説明はありません。";
        body.innerHTML = desc;

        // MathJax による数式レンダリング（動的に挿入されたコンテンツ用）
        // MathJax 3 の CDN スクリプトは defer + 内部非同期初期化があるため、
        // typesetPromise が利用可能になるまでポーリングで待機する
        _typesetWhenReady(body);

        panel.classList.remove('hidden');
    }

    /**
     * MathJax が利用可能になるまで待機し、対象要素を typeset する。
     * CDN の読み込み遅延や MathJax 内部の非同期初期化を吸収する。
     * @param {HTMLElement} element - typeset 対象の要素
     */
    function _typesetWhenReady(element) {
        // 既に ready なら即座に実行
        if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
            _doTypeset(element);
            return;
        }

        // MathJax.startup.promise が存在すれば、それを待つ
        if (typeof MathJax !== 'undefined' && MathJax.startup && MathJax.startup.promise) {
            MathJax.startup.promise
                .then(() => _doTypeset(element))
                .catch(err => console.error('[MathJax] startup error:', err));
            return;
        }

        // CDN がまだロードされていない → ポーリングで待機（最大 10 秒）
        let elapsed = 0;
        const interval = 100; // ms
        const maxWait = 10000; // ms
        const timer = setInterval(() => {
            elapsed += interval;
            if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
                clearInterval(timer);
                _doTypeset(element);
            } else if (elapsed >= maxWait) {
                clearInterval(timer);
                console.warn('[MathJax] MathJax did not become available after', maxWait, 'ms. TeX will not be rendered.');
            }
        }, interval);
    }

    /**
     * MathJax の typeset を実行する（二重レンダリング防止付き）
     * @param {HTMLElement} element - typeset 対象の要素
     */
    function _doTypeset(element) {
        if (typeof MathJax.typesetClear === 'function') {
            MathJax.typesetClear([element]);
        }
        MathJax.typesetPromise([element])
            .catch(err => console.error('[MathJax] typeset error:', err));
    }

    function hideNodeInfo() {
        const panel = document.getElementById('nodeInfoPanel');
        panel.classList.add('hidden');
    }

    // ノードクリック判定用タイムスタンプ（短時間の document.click を無視する）
    let __lastNodeClickAt = 0;
    // タッチによる操作タイムスタンプ（スマホ用）
    let __lastTouchAt = 0;

    // スマホのタッチは click に遅延でフォールバックが来るため
    // network 上での touchstart を記録して、直後の document.click による誤閉じを防ぐ
    if (dom && dom.networkContainer) {
        dom.networkContainer.addEventListener('touchstart', function (ev) {
            __lastTouchAt = Date.now();
        }, { passive: true });
    }

    document.addEventListener('click', function (e) {
        const panel = document.getElementById('nodeInfoPanel');

        // 既にパネルが hidden なら無視
        if (!panel || panel.classList.contains('hidden')) return;

        // パネルをクリックした場合 → 閉じない
        if (panel.contains(e.target)) return;

        // ノードクリック直後の document click は無視（vis の click と document click が同時発火するため）
        // タッチ操作の場合は遅延が大きめなので余裕を持たせる
        const now = Date.now();
        if ((__lastNodeClickAt && (now - __lastNodeClickAt) < 500) ||
            (__lastTouchAt && (now - __lastTouchAt) < 700)) {
            return;
        }
        // その他の場所をクリック → 閉じる
        hideNodeInfo();
    });

    // ------------------------
    // クリック／イベントハンドラの初期登録（STATE.IDLE で動く）
    // ------------------------
    function registerUiHandlers() {
        // 深さ検索ボタン
        dom.updateBtn.addEventListener('click', () => {
            console.log('[UI] depth search clicked');
            // 実行時は id input をクリア（仕様）
            dom.labelSearchInput.value = '';
            dom.labelSearchSuggestions.style.display = 'none';
            performDepthSearch();
        });

        // label 検索ボタン
        dom.labelSearchBtn.addEventListener('click', () => {
            console.log('[UI] label search clicked');
            const label = String(dom.labelSearchInput.value);
            u1f_performLabelSearch(label);
        });

        // label input でのリアルタイム候補表示
        dom.labelSearchInput.addEventListener('input', () => {
            const label = dom.labelSearchInput.value;
            const suggestions = u1f_suggestNodesByLabel(label);

            if (suggestions.length === 0) {
                dom.labelSearchSuggestions.style.display = 'none';
                return;
            }

            // サジェスト一覧をクリア
            dom.labelSearchSuggestions.innerHTML = '';
            console.log('[UI] label search suggestions are cleared');

            // 候補を追加
            for (const node of suggestions) {
                const li = document.createElement('li');
                li.style.cssText = 'padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #eee;';
                li.textContent = node.label;
                li.addEventListener('mouseover', () => {
                    li.style.backgroundColor = '#f0f0f0';
                });
                li.addEventListener('mouseout', () => {
                    li.style.backgroundColor = '';
                });
                li.addEventListener('click', () => {
                    dom.labelSearchInput.value = node.label;
                    dom.labelSearchSuggestions.style.display = 'none';
                    u1f_performLabelSearch(node.label);
                });
                dom.labelSearchSuggestions.appendChild(li);
            }

            dom.labelSearchSuggestions.style.display = 'block';
        });

        // Enter キーで検索
        dom.labelSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const label = dom.labelSearchInput.value;
                dom.labelSearchSuggestions.style.display = 'none';
                u1f_performLabelSearch(label);
            }
        });

        // 外クリックで候補を非表示（学問検索）
        document.addEventListener('click', (e) => {
            if (!dom.labelSearchInput.contains(e.target) && !dom.labelSearchSuggestions.contains(e.target)) {
                dom.labelSearchSuggestions.style.display = 'none';
            }
        });

        // network をクリック時の動作
        // network の click イベント（node クリック）
        // 注意: network 初期化後にセットされる（u1f_initNetworkIfNeeded で）
        function getClickMode() {
            const radios = document.getElementsByName('clickMode');
            for (const r of radios) {
                if (r.checked) return r.value;
            }
            return 'select';
        }

        // we keep a single handler: if network is not ready, we ignore clicks
        dom.networkContainer.addEventListener('click', (ev) => {
            // do nothing special here; actual node clicks handled by vis event registered below
        });
        // register vis 'click' when network ready
        if (u1f_initNetworkIfNeeded()) {
            network.on('click', function (params) {
                try {
                    // ノードが選択されているか判定
                    if (!params.nodes || !params.nodes.length) {
                        // ノード以外（背景・エッジ等）をクリックした場合はパネルを閉じる
                        console.log('[NETWORK] background/edge clicked - hiding panel');
                        hideNodeInfo();
                        return;
                    }

                    const nodeId = params.nodes[0];
                    const node = (network.body && network.body.data && network.body.data.nodes) ? network.body.data.nodes.get(nodeId) : null;
                    if (!node) {
                        console.warn('[NETWORK] node not found in internal dataset:', nodeId);
                        return;
                    }
                    const clickMode = getClickMode();
                    console.log('[NETWORK] node clicked', nodeId, node, 'clickMode=', clickMode);

                    // ノードクリック時刻を記録（document.click 側の誤閉じ防止）
                    __lastNodeClickAt = Date.now();

                    if (clickMode === 'select') {
                        // パネル表示
                        try {
                            console.log("[click] Selecting node:", node.label);
                            showNodeInfo(node);
                        } catch (e) {
                            console.warn('[NETWORK] select failed:', e);
                        }
                    } else if (clickMode === 'nodeFocus') {
                        // ノードフォーカスモード：上方/下方の入力値を取得して表示
                        const up = dom.focusUp ? Number(dom.focusUp.value) : 1;
                        const down = dom.focusDown ? Number(dom.focusDown.value) : 1;
                        u1f_performNodeFocus(node.id, up, down);
                    } else {
                        // link モード: released フラグを確認 (存在しなければ 0 扱い)
                        const releasedFlag = Number(node.released) === 1 ? 1 : 0;
                        if (releasedFlag !== 1) {
                            // 公開されていないのでリンク遷移は行わない。説明パネルで案内する。
                            console.log('[NETWORK] node is not released, blocking link open:', nodeId);
                            showNodeInfo(node);
                            return;
                        }
                        // 公開済みなら新しいタブで開く
                        if (node.url) {
                            window.open(node.url, '_blank');
                        } else {
                            console.warn('[NETWORK] node has no URL:', node);
                        }
                    }
                } catch (e) {
                    console.error('[NETWORK] click handler error:', e);
                }
            });
        }

        // カラーモードラジオの変更を検知して再描画（レインボー適用）
        if (dom.colorModeRadios && dom.colorModeRadios.length) {
            for (const r of dom.colorModeRadios) {
                r.addEventListener('change', () => {
                    console.log('[UI] colorMode changed ->', document.querySelector('input[name="colorMode"]:checked').value);
                    // ページ内検索ハイライトをクリア
                    vof_clearPageSearchHighlight();
                    // 現在表示しているノード/エッジを再取得して色を再適用
                    refreshNetworkColors();
                });
            }
        }

        // ページ内検索ボタン
        dom.pageSearchBtn.addEventListener('click', () => {
            console.log('[UI] page search clicked');
            const label = String(dom.pageSearchInput.value);
            dom.pageSearchSuggestions.style.display = 'none';
            u1f_performPageSearch(label);
        });

        // ページ内検索 Enter キー
        dom.pageSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const label = dom.pageSearchInput.value;
                dom.pageSearchSuggestions.style.display = 'none';
                u1f_performPageSearch(label);
            }
        });

        // ページ内検索 サジェスト表示（表示中ノードのみから候補を列挙）
        dom.pageSearchInput.addEventListener('input', () => {
            const label = dom.pageSearchInput.value;
            const suggestions = u1f_suggestVisibleNodesByLabel(label);

            if (suggestions.length === 0) {
                dom.pageSearchSuggestions.style.display = 'none';
                return;
            }

            dom.pageSearchSuggestions.innerHTML = '';

            for (const node of suggestions) {
                const li = document.createElement('li');
                li.textContent = node.label;
                li.addEventListener('mouseover', () => {
                    li.style.backgroundColor = '#f0f0f0';
                });
                li.addEventListener('mouseout', () => {
                    li.style.backgroundColor = '';
                });
                li.addEventListener('click', () => {
                    dom.pageSearchInput.value = node.label;
                    dom.pageSearchSuggestions.style.display = 'none';
                    u1f_performPageSearch(node.label);
                });
                dom.pageSearchSuggestions.appendChild(li);
            }

            dom.pageSearchSuggestions.style.display = 'block';
        });

        // 外クリックでページ内検索サジェスト非表示
        document.addEventListener('click', (e) => {
            if (!dom.pageSearchInput.contains(e.target) && !dom.pageSearchSuggestions.contains(e.target)) {
                dom.pageSearchSuggestions.style.display = 'none';
            }
        });
    }

    // ------------------------
    // 初期化フロー（状態遷移順）
    // ------------------------
    (function mainFlow() {
        try {
            console.log('[MAIN] start state machine');
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

            // register UI handlers after network ready
            registerUiHandlers();

            // STATE 3: hash bootstrap (if any)
            const hashHandled = bootstrapFromHash();
            if (hashHandled) {
                // BOOTSTRAP_SEARCH did internal drawing
                console.log('[MAIN] bootstrap handled, entering IDLE');
                currentState = STATE.IDLE;
                return;
            }

            // otherwise draw default graph according to selects
            currentState = STATE.IDLE;
            console.log('[MAIN] entering IDLE state');
            // initial draw (respect current min/max selects)
            performDepthSearch();
        } catch (e) {
            console.error('[MAIN] unexpected error:', e);
            currentState = STATE.ERROR;
        }
    })();

    // ------------------------
    // パネル ドラッグ移動
    // ------------------------
    (function initPanelDrag() {
        const panel = document.getElementById('controlsPanel');
        const header = document.getElementById('controlsHeader');
        if (!panel || !header) return;

        let isDragging = false;
        let startX = 0, startY = 0;
        let panelStartX = 0, panelStartY = 0;

        function onDragStart(clientX, clientY) {
            isDragging = true;
            startX = clientX;
            startY = clientY;
            const rect = panel.getBoundingClientRect();
            panelStartX = rect.left;
            panelStartY = rect.top;
            header.classList.add('dragging');
        }

        function onDragMove(clientX, clientY) {
            if (!isDragging) return;
            let newX = panelStartX + (clientX - startX);
            let newY = panelStartY + (clientY - startY);

            // ビューポート外へのクランプ
            const pw = panel.offsetWidth;
            const ph = panel.offsetHeight;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            newX = Math.max(0, Math.min(newX, vw - pw));
            newY = Math.max(0, Math.min(newY, vh - Math.min(ph, 40)));

            panel.style.left = newX + 'px';
            panel.style.top = newY + 'px';
        }

        function onDragEnd() {
            isDragging = false;
            header.classList.remove('dragging');
        }

        // Mouse events
        header.addEventListener('mousedown', function (e) {
            // トグルボタンの場合はドラッグしない
            if (e.target.closest('.controls-toggle-btn')) return;
            e.preventDefault();
            onDragStart(e.clientX, e.clientY);
        });
        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            e.preventDefault();
            onDragMove(e.clientX, e.clientY);
        });
        document.addEventListener('mouseup', onDragEnd);

        // Touch events
        header.addEventListener('touchstart', function (e) {
            if (e.target.closest('.controls-toggle-btn')) return;
            const t = e.touches[0];
            onDragStart(t.clientX, t.clientY);
        }, { passive: true });
        document.addEventListener('touchmove', function (e) {
            if (!isDragging) return;
            const t = e.touches[0];
            onDragMove(t.clientX, t.clientY);
        }, { passive: false });
        document.addEventListener('touchend', onDragEnd);
    })();

    // ------------------------
    // パネル 縮小/拡大トグル
    // ------------------------
    (function initPanelToggle() {
        const panel = document.getElementById('controlsPanel');
        const toggleBtn = document.getElementById('controlsToggleBtn');
        if (!panel || !toggleBtn) return;

        toggleBtn.addEventListener('click', function () {
            const isCollapsed = panel.classList.toggle('collapsed');
            toggleBtn.textContent = isCollapsed ? '▲' : '▼';
            toggleBtn.title = isCollapsed ? 'パネルを開く' : 'パネルを閉じる';
        });
    })();

    // ------------------------
    // 公開（デバッグ用）
    // ------------------------
    window.__SiteGraph = {
        STATE,
        getCurrentState: () => currentState,
        getErrorFlags: () => ({ ...errorFlags }),
        reinitNetwork: () => { networkInitialized = false; return u1f_initNetworkIfNeeded(); },
        performDepthSearch,
        u1f_performLabelSearch,
        u1f_performIdSearch,
        vof_clearVisualLock
    };
}); // DOMContentLoaded end
