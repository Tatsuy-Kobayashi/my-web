// ----------------------------------------------------------------------------
// ファイル名      : NetworkAdapter.js
// モジュール記号  : ADAPTNET / AdaptNet
// モジュール名    : ネットワーク適応 (SW202-MID-ADAPTNET) Source File
// 内容            : Force-Graph 2D の初期化・データ変換・描画操作を集約する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { COLORHLPR_ComputeNodeColorObj } from './ColorHelper.js';
import { APPSTATE_STATE, APPSTATE_SetState, APPSTATE_SetErrorFlag } from './AppState.js';

// ------------------------
// Force-Graph 2D / 3D 管理（表示モード切替時にアクティブなグラフを再生成する）
// ------------------------
let AdaptNet_Network = null; // 現在アクティブなForce-Graphインスタンス
let AdaptNet_NetworkInitialized = false;
let AdaptNet_NetworkMode = '2d';
let AdaptNet_NetworkContainer = null;
let AdaptNet_RankingIdxCache = null;
let AdaptNet_CurrentNodeIds = [];
let AdaptNet_CurrentSourceNodes = [];
let AdaptNet_CurrentNodes = [];
let AdaptNet_CurrentEdges = [];
let AdaptNet_CurrentColorMode = 'default-color';
let AdaptNet_CurrentRankingData = [];
let AdaptNet_2DTouchTarget = null;
let AdaptNet_2DTouchHandlers = null;
let AdaptNet_2DTouchAction = null;

// 相互作用リスナー
const AdaptNet_InteractionListeners = {
    nodeClick: new Set(),
    nodeRightClick: new Set(),
    linkClick: new Set(),
    linkRightClick: new Set(),
    backgroundClick: new Set(),
    backgroundRightClick: new Set(),
    nodeDrag: new Set()
};

/**
 * 名称     : ランキングスコアのインデックス化
 * 内容     : ランキングスコアをインデックス化する
 * @param {Array<object>} rankingData - ランキングデータの配列
 * @returns {Object} - ランキングスコアのインデックス
 */
function AdaptNet_BuildRankingIdx(rankingData) {
    if (AdaptNet_RankingIdxCache) return AdaptNet_RankingIdxCache;

    const scores = Array.isArray(rankingData)
        ? rankingData
        : (rankingData && Array.isArray(rankingData.scores) ? rankingData.scores : []);

    const bySiteId = new Map();
    scores.forEach((score, index) => {
        const siteId = Number(score && score.id);
        if (!Number.isFinite(siteId)) return;
        bySiteId.set(siteId, Object.assign({ __rankIndex: index }, score));
    });

    AdaptNet_RankingIdxCache = {
        bySiteId,
        maxRankIndex: Math.max(1, scores.length - 1)
    };
    return AdaptNet_RankingIdxCache;
}

/**
 * 名称     : ランキングノードサイズ算出
 * 内容     : ノードの表示半径を計算する
 * @param {object} node - ノードオブジェクト
 * @param {Array<object>} rankingData - ランキングデータの配列
 * @returns {number} - ノードの表示半径
 */
function AdaptNet_ComputeRankingNodeSize(node, rankingData) {
    const index = AdaptNet_BuildRankingIdx(rankingData);
    const rankingScore = index.bySiteId.get(Number(node && node.id));
    const minSize = 18;
    const maxSize = 40;

    if (!rankingScore) return minSize;

    const rankIndex = Math.max(0, Number(rankingScore.__rankIndex) || 0);
    const denominator = Math.log1p(index.maxRankIndex + 1);
    const normalized = denominator > 0 ? 1 - (Math.log1p(rankIndex + 1) / denominator) : 0;

    return Math.round(minSize + Math.max(0, Math.min(1, normalized)) * (maxSize - minSize));
}

/**
 * 名称     : Force-Graph用ノードマッピング
 * 内容     : 元ノードをForce-Graphの描画用ノードへ変換する
 * @param {object} node - 元ノード
 * @param {string} colorMode - 色モード
 * @param {Array<object>} rankingData - ランキングデータ
 * @returns {object} - Force-Graph用ノード
 */
function AdaptNet_MapNodeForNetwork(node, colorMode, rankingData) {
    const nodeCopy = Object.assign({}, node);
    const color = COLORHLPR_ComputeNodeColorObj(node, colorMode);
    const radius = AdaptNet_ComputeRankingNodeSize(node, rankingData);
    const rankingScore = AdaptNet_BuildRankingIdx(rankingData).bySiteId.get(Number(node && node.id));

    // Force-GraphのnodeRelSize(4)で半径がおおむねradiusになる値へ変換する。
    nodeCopy.val = Math.max(1, (radius * radius) / 4);
    nodeCopy.color = color.background;
    nodeCopy.borderColor = color.border;
    nodeCopy.highlightColor = color.highlight?.background || color.background;
    nodeCopy.label = nodeCopy.label == null ? String(nodeCopy.id) : String(nodeCopy.label);

    if (rankingScore) {
        nodeCopy.rankingScore = rankingScore.overallScore;
        nodeCopy.rankingRank = rankingScore.__rankIndex + 1;
        nodeCopy.title = `${nodeCopy.title || nodeCopy.label || ''}\nランキング: ${nodeCopy.rankingRank}\n総合スコア: ${Number(rankingScore.overallScore || 0).toFixed(3)}`;
    }
    return nodeCopy;
}

/**
 * 名称     : Force-Graphのノード半径計算
 * 内容     : ノードの半径を計算する
 * @param {Object} node - ノード
 * @returns {number} - ノード半径
 */
function AdaptNet_GetNodeRadius(node) {
    return Math.sqrt(Math.max(1, Number(node && node.val) || 1) * 4);
}

/**
 * 名称     : 16進数カラーコードをRGBAへ変換
 * 内容     : 16進数カラーコードをRGBAカラーコードへ変換する
 * @param {string} hex - 16進数カラーコード
 * @param {number} opacity - 透明度
 * @returns {string} - RGBAカラーコード
 */
function AdaptNet_HexToRgba(hex, opacity) {
    if (typeof hex !== 'string') return hex;
    const match = hex.match(/^#([0-9a-f]{6})$/i);
    if (!match || !Number.isFinite(Number(opacity)) || opacity >= 1) return hex;
    const value = match[1];
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
}

/**
 * 名称     : Force-Graphのエッジカラー取得
 * 内容     : エッジのカラーコードを取得する
 * @param {Object} edge - エッジ
 * @returns {string} - エッジカラーコード
 */
function AdaptNet_GetEdgeColor(edge) {
    const edgeColor = edge && edge.color;
    if (typeof edgeColor === 'string') return edgeColor;
    if (edgeColor && typeof edgeColor.color === 'string') {
        return AdaptNet_HexToRgba(edgeColor.color, Number(edgeColor.opacity));
    }
    return '#848484';
}

/**
 * 名称     : Force-Graphのエッジのカーブ値計算
 * 内容     : エッジのカーブ値を計算する
 * @param {Object} edge - エッジ
 * @returns {number} - エッジのカーブ値
 */
function AdaptNet_GetEdgeCurvature(edge) {
    if (!edge || !edge.smooth || edge.smooth.enabled === false) return 0;
    const roundness = Number(edge.smooth.roundness);
    return Number.isFinite(roundness) ? roundness : 0.25;
}

/**
 * 名称     : Force-Graphのエッジの終点正規化
 * 内容     : エッジの終点を正規化する
 * @param {Object} endpoint - エッジの終点
 * @returns {number|string} - エッジの終点ID
 */
function AdaptNet_NormalizeEndpoint(endpoint) {
    if (endpoint && typeof endpoint === 'object' && endpoint.id != null) return endpoint.id;
    return endpoint;
}

/**
 * 名称     : Force-Graphのエッジのマッピング
 * 内容     : エッジをForce-Graph用にマッピングする
 * @param {Object} edge - エッジ
 * @returns {Object} - Force-Graph用エッジ
 */
function AdaptNet_MapEdgeForNetwork(edge) {
    const source = AdaptNet_NormalizeEndpoint(edge && edge.source != null ? edge.source : edge && edge.from);
    const target = AdaptNet_NormalizeEndpoint(edge && edge.target != null ? edge.target : edge && edge.to);
    return Object.assign({}, edge, {
        source,
        target,
        color: AdaptNet_GetEdgeColor(edge),
        _arrowLength: edge && edge.arrows === 'to' ? 8 : 0,
        _curvature: AdaptNet_GetEdgeCurvature(edge),
        _lineDash: edge && edge.dashes ? [7, 5] : null,
        _distance: Number(edge && edge.length) > 0 ? Number(edge.length) : 65
    });
}

/**
 * 名称     : Force-Graphのノード描画
 * 内容     : ノードを描画する
 * @param {Object} node - ノード
 * @param {CanvasRenderingContext2D} ctx - コンテキスト
 * @param {number} globalScale - グローバルスケール
 */
function AdaptNet_DrawNode(node, ctx, globalScale) {
    const radius = AdaptNet_GetNodeRadius(node);
    const label = node && node.label ? String(node.label) : '';

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color || '#97C2FC';
    ctx.fill();
    ctx.strokeStyle = node.borderColor || '#2B7CE9';
    ctx.lineWidth = Math.max(1, 1.5 / Math.max(globalScale, 0.01));
    ctx.stroke();

    if (!label) return;
    const fontSize = Math.max(10, 13 / Math.max(globalScale, 0.01));
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#222';
    ctx.fillText(label, node.x, node.y + radius + 3 / Math.max(globalScale, 0.01));
}

/**
 * 名称     : 角度正規化
 * 内容     : 角度を正規化する
 * @param {number} angle - 角度
 * @returns {number} - 正規化した角度
 */
function AdaptNet_NormalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}

/**
 * 名称     : 2Dグラフの座標取得
 * 内容     : 2Dグラフの座標を取得する
 * @param {number} clientX - clientX
 * @param {number} clientY - clientY
 * @returns {number} - 2Dグラフの座標
 */
function AdaptNet_Get2DGraphPoint(clientX, clientY) {
    const container = AdaptNet_NetworkContainer;
    if (!container || !AdaptNet_Network || typeof AdaptNet_Network.zoom !== 'function') return null;

    const rect = container.getBoundingClientRect();
    const zoom = Number(AdaptNet_Network.zoom());
    const center = typeof AdaptNet_Network.centerAt === 'function'
        ? AdaptNet_Network.centerAt()
        : { x: 0, y: 0 };
    const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
    const centerX = Number.isFinite(Number(center && center.x)) ? Number(center.x) : 0;
    const centerY = Number.isFinite(Number(center && center.y)) ? Number(center.y) : 0;

    return {
        x: centerX + ((clientX - rect.left) - rect.width / 2) / safeZoom,
        y: centerY + ((clientY - rect.top) - rect.height / 2) / safeZoom
    };
}

/**
 * 名称     : タッチペア取得
 * 内容     : タッチペアの取得
 * @param {Event} event - タッチイベント
 * @returns {Array<Object>} - タッチペア
 */
function AdaptNet_GetTouchPair(event) {
    if (event && event.touches && event.touches.length >= 2) {
        return [event.touches[0], event.touches[1]].map(touch => ({
            clientX: touch.clientX,
            clientY: touch.clientY
        }));
    }

    if (event && event.pointerId != null && AdaptNet_2DTouchAction) {
        const pointer = AdaptNet_2DTouchAction.pointers.get(event.pointerId);
        if (pointer) {
            pointer.clientX = event.clientX;
            pointer.clientY = event.clientY;
        }
    }
    if (AdaptNet_2DTouchAction && AdaptNet_2DTouchAction.pointers.size >= 2) {
        return [...AdaptNet_2DTouchAction.pointers.values()].slice(0, 2);
    }
    return null;
}


/**
 * 名称     : 2Dタッチ回転開始
 * 内容     : 2Dタッチ回転を開始する
 * @param {Array<Object>} pair - タッチペア
 * @returns {boolean} - 2Dタッチ回転の開始
 */
function AdaptNet_Start2DTouchRotation(pair) {
    if (!pair || pair.length < 2) return false;
    const midpoint = {
        clientX: (pair[0].clientX + pair[1].clientX) / 2,
        clientY: (pair[0].clientY + pair[1].clientY) / 2
    };
    const center = AdaptNet_Get2DGraphPoint(midpoint.clientX, midpoint.clientY);
    if (!center) return false;

    AdaptNet_2DTouchAction.rotation = {
        lastAngle: Math.atan2(
            pair[1].clientY - pair[0].clientY,
            pair[1].clientX - pair[0].clientX
        ),
        center
    };
    return true;
}

/**
 * 名称     : 2Dタッチ回転
 * 内容     : 2Dタッチ回転
 * @param {number} deltaAngle - 角度差
 * @param {Object} center - 回転中心
 * @returns {void}
 */
function AdaptNet_Rotate2DNodes(deltaAngle, center) {
    if (!Number.isFinite(deltaAngle) || !center) return;
    const cos = Math.cos(deltaAngle);
    const sin = Math.sin(deltaAngle);

    AdaptNet_CurrentNodes.forEach(node => {
        if (!Number.isFinite(Number(node.x)) || !Number.isFinite(Number(node.y))) return;
        const offsetX = Number(node.x) - center.x;
        const offsetY = Number(node.y) - center.y;
        node.x = center.x + offsetX * cos - offsetY * sin;
        node.y = center.y + offsetX * sin + offsetY * cos;

        // 固定済みノードは、表示位置と固定位置を同時に回転させる。
        if (Number.isFinite(Number(node.fx))) node.fx = node.x;
        if (Number.isFinite(Number(node.fy))) node.fy = node.y;
        if (Number.isFinite(Number(node.vx)) && Number.isFinite(Number(node.vy))) {
            const velocityX = Number(node.vx);
            const velocityY = Number(node.vy);
            node.vx = velocityX * cos - velocityY * sin;
            node.vy = velocityX * sin + velocityY * cos;
        }
    });
}

/**
 * 名称     : 2Dタッチ回転の適用
 * 内容     : 2Dタッチ回転を適用する
 * @param {Event} event - タッチイベント
 * @returns {boolean} - 2Dタッチ回転の適用
 */
function AdaptNet_Apply2DTouchRotation(event) {
    if (!AdaptNet_2DTouchAction || AdaptNet_NetworkMode !== '2d') return false;
    const pair = AdaptNet_GetTouchPair(event);
    if (!pair || pair.length < 2) return false;

    if (!AdaptNet_2DTouchAction.rotation && !AdaptNet_Start2DTouchRotation(pair)) return false;
    const angle = Math.atan2(
        pair[1].clientY - pair[0].clientY,
        pair[1].clientX - pair[0].clientX
    );
    const deltaAngle = AdaptNet_NormalizeAngle(angle - AdaptNet_2DTouchAction.rotation.lastAngle);
    AdaptNet_Rotate2DNodes(deltaAngle, AdaptNet_2DTouchAction.rotation.center);
    AdaptNet_2DTouchAction.rotation.lastAngle = angle;
    return true;
}

/**
 * 名称     : 2Dタッチ回転の停止
 * 内容     : 2Dタッチ回転を停止する
 * @param {Event} event - タッチイベント
 * @returns {void}
 */
function AdaptNet_Stop2DTouchRotation(event) {
    if (event && event.pointerId != null && AdaptNet_2DTouchAction) {
        AdaptNet_2DTouchAction.pointers.delete(event.pointerId);
    }
    if (AdaptNet_2DTouchAction) {
        AdaptNet_2DTouchAction.rotation = null;
    }
}

/**
 * 名称     : 2Dタッチイベントのブロック
 * 内容     : 2Dタッチイベントをブロックする
 * @param {Event} event - タッチイベント
 * @returns {void}
 */
function AdaptNet_Block2DTouchEvent(event) {
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
}

/**
 * 名称     : 2Dタッチ回転の解除
 * 内容     : 2Dタッチ回転の解除
 * @returns {void}
 */
function AdaptNet_Remove2DTouchRotation() {
    if (AdaptNet_2DTouchTarget && AdaptNet_2DTouchHandlers) {
        Object.entries(AdaptNet_2DTouchHandlers).forEach(([type, handler]) => {
            if (typeof handler === 'function') {
                AdaptNet_2DTouchTarget.removeEventListener(type, handler, true);
            }
        });
        if (AdaptNet_2DTouchHandlers.pointerdown) {
            AdaptNet_2DTouchTarget.style.touchAction = AdaptNet_2DTouchHandlers.originalTouchAction;
        }
    }
    AdaptNet_2DTouchTarget = null;
    AdaptNet_2DTouchHandlers = null;
    AdaptNet_2DTouchAction = null;
}

/**
 * 名称     : 2Dタッチ回転のインストール
 * 内容     : 2Dタッチ回転のインストール
 * @param {HTMLElement} container - コンテナ
 * @returns {void}
 */
function AdaptNet_Install2DTouchRotation(container) {
    AdaptNet_Remove2DTouchRotation();
    if (!container || AdaptNet_NetworkMode !== '2d') return;

    const action = {
        pointers: new Map(),
        rotation: null
    };
    const handlers = {
        originalTouchAction: container.style.touchAction,
        pointerdown: event => {
            if (event.pointerType !== 'touch') return;
            action.pointers.set(event.pointerId, {
                clientX: event.clientX,
                clientY: event.clientY
            });
            if (action.pointers.size >= 2) {
                AdaptNet_2DTouchAction = action;
                AdaptNet_Start2DTouchRotation(AdaptNet_GetTouchPair(event));
                AdaptNet_Block2DTouchEvent(event);
            }
        },
        pointermove: event => {
            if (event.pointerType !== 'touch' || !action.pointers.has(event.pointerId)) return;
            AdaptNet_2DTouchAction = action;
            if (action.pointers.size >= 2 && AdaptNet_Apply2DTouchRotation(event)) {
                AdaptNet_Block2DTouchEvent(event);
            }
        },
        pointerup: event => {
            if (event.pointerType !== 'touch' || !action.pointers.has(event.pointerId)) return;
            const wasRotating = !!action.rotation;
            AdaptNet_Stop2DTouchRotation(event);
            if (wasRotating) AdaptNet_Block2DTouchEvent(event);
        },
        pointercancel: event => {
            if (event.pointerType !== 'touch' || !action.pointers.has(event.pointerId)) return;
            const wasRotating = !!action.rotation;
            AdaptNet_Stop2DTouchRotation(event);
            if (wasRotating) AdaptNet_Block2DTouchEvent(event);
        }
    };

    // Pointer Events対応ブラウザ（現行PC/スマホ）を優先し、非対応環境はTouch Eventsで補完する。
    if (typeof window !== 'undefined' && window.PointerEvent) {
        ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(type => {
            container.addEventListener(type, handlers[type], { capture: true, passive: false });
        });
    } else {
        handlers.touchstart = event => {
            if (!event.touches || event.touches.length < 2) return;
            AdaptNet_2DTouchAction = action;
            AdaptNet_Start2DTouchRotation(AdaptNet_GetTouchPair(event));
            AdaptNet_Block2DTouchEvent(event);
        };
        handlers.touchmove = event => {
            if (!event.touches || event.touches.length < 2) return;
            AdaptNet_2DTouchAction = action;
            if (AdaptNet_Apply2DTouchRotation(event)) AdaptNet_Block2DTouchEvent(event);
        };
        handlers.touchend = event => {
            if (!action.rotation) return;
            AdaptNet_Stop2DTouchRotation(event);
            AdaptNet_Block2DTouchEvent(event);
        };
        handlers.touchcancel = handlers.touchend;
        ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(type => {
            container.addEventListener(type, handlers[type], { capture: true, passive: false });
        });
    }
    container.style.touchAction = 'none';
    AdaptNet_2DTouchTarget = container;
    AdaptNet_2DTouchHandlers = handlers;
    AdaptNet_2DTouchAction = action;
}

/**
 * 名称     : 3Dテキストスプライト作成
 * 内容     : 3Dテキストスプライトを作成する
 * @param {string} text - テキスト
 * @returns {Object|null} - 3Dテキストスプライト
 */
function AdaptNet_Create3DTextSprite(text) {
    if (typeof window === 'undefined' || !window.THREE || typeof document === 'undefined') return null;

    const THREE = window.THREE;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    const fontSize = 48;
    const label = String(text || '');
    context.font = `${fontSize}px Arial, sans-serif`;
    const textWidth = Math.ceil(context.measureText(label).width);
    canvas.width = Math.max(32, textWidth + 20);
    canvas.height = fontSize + 20;

    context.font = `${fontSize}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'rgba(255, 255, 255, 0.88)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#222222';
    context.fillText(label, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(canvas.width / 5, canvas.height / 5, 1);
    return sprite;
}

/**
 * 名称     : 3Dノードオブジェクト作成
 * 内容     : 3Dノードオブジェクトを作成する
 * @param {Object} node - ノード
 * @returns {Object|null} - 3Dノードオブジェクト
 */
function AdaptNet_Create3DNodeObject(node) {
    if (typeof window === 'undefined' || !window.THREE) return null;

    const THREE = window.THREE;
    const radius = AdaptNet_GetNodeRadius(node);
    const group = new THREE.Group();
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 20, 14),
        new THREE.MeshLambertMaterial({
            color: node.color || '#97C2FC',
            transparent: true,
            opacity: 0.92
        })
    );
    group.add(sphere);

    const labelSprite = AdaptNet_Create3DTextSprite(node.label);
    if (labelSprite) {
        labelSprite.position.set(0, radius + 8, 0);
        group.add(labelSprite);
    }
    return group;
}

/**
 * 名称     : Force-Graphのイベントディスパッチ
 * 内容     : イベントをディスパッチする
 * @param {string} type - イベントタイプ
 * @param {...*} args - イベント引数
 */
function AdaptNet_Dispatch(type, ...args) {
    for (const listener of AdaptNet_InteractionListeners[type]) {
        try {
            listener(...args);
        } catch (e) {
            console.error(`[NETWORK] ${type} listener error:`, e);
        }
    }
}

/**
 * 名称     : Force-Graphのインタラクションハンドラ適用
 * 内容     : インタラクションハンドラを適用する
 */
function AdaptNet_ApplyInteractionHandlers() {
    if (!AdaptNet_Network) return;

    AdaptNet_Network
        .onNodeClick((node, event) => AdaptNet_Dispatch('nodeClick', node, event))
        .onNodeRightClick((node, event) => AdaptNet_Dispatch('nodeRightClick', node, event))
        .onLinkClick((link, event) => AdaptNet_Dispatch('linkClick', link, event))
        .onLinkRightClick((link, event) => AdaptNet_Dispatch('linkRightClick', link, event))
        .onBackgroundClick(event => AdaptNet_Dispatch('backgroundClick', event))
        .onBackgroundRightClick(event => AdaptNet_Dispatch('backgroundRightClick', event))
        .onNodeDrag((node, translate) => AdaptNet_Dispatch('nodeDrag', node, translate));
}

/**
 * 名称     : Force-Graphの破棄
 * 内容     : Force-Graphを破棄する
 */
function AdaptNet_DestroyNetwork() {
    AdaptNet_Remove2DTouchRotation();
    if (!AdaptNet_Network) return;

    try {
        if (typeof AdaptNet_Network._destructor === 'function') {
            AdaptNet_Network._destructor();
        } else if (typeof AdaptNet_Network.pauseAnimation === 'function') {
            AdaptNet_Network.pauseAnimation();
        }
    } catch (e) {
        console.warn('[NETWORK] 旧Force-Graphの破棄中に警告:', e);
    } finally {
        AdaptNet_Network = null;
    }
}

/**
 * 名称     : Force-Graphの再描画
 * 内容     : Force-Graphを再描画する
 */
function AdaptNet_Redraw() {
    if (!AdaptNet_Network) return;
    // graphDataの再設定で、現在のノード・エッジと表示属性を両モードで再利用する。
    AdaptNet_Network.graphData({
        nodes: AdaptNet_CurrentNodes,
        links: AdaptNet_CurrentEdges.map(edge => Object.assign({}, edge))
    });
}

/**
 * 名称     : Force-Graphのフォース設定適用
 * 内容     : Force-Graphにフォース設定を適用する
 * @param {Object} network - Force-Graphインスタンス
 */
function AdaptNet_ApplyForceSettings(network) {
    const chargeForce = network.d3Force('charge');
    if (chargeForce && typeof chargeForce.strength === 'function') {
        chargeForce.strength(-40);  // 2D/3D共通の反発力
    }
    const linkForce = network.d3Force('link');
    if (linkForce && typeof linkForce.distance === 'function') {
        linkForce.distance(link => link._distance || 65);  // エッジごとの自然長
    }
}

/**
 * 名称     : Force-Graphの2Dネットワーク作成
 * 内容     : Force-Graphの2Dネットワークを作成する
 * @param {HTMLElement} container - コンテナ要素
 * @returns {Object} - Force-Graphインスタンス
 */
function AdaptNet_Create2DNetwork(container) {
    return new window.ForceGraph(container)
        .backgroundColor('#ffffff')
        .nodeRelSize(4)
        .nodeVal(node => Number(node.val) || 1)
        .nodeLabel(node => node.title || node.label || '')
        .nodeColor(node => node.color || '#97C2FC')
        .nodeCanvasObject(AdaptNet_DrawNode)
        .nodeCanvasObjectMode(() => 'replace')
        .linkColor(link => link.color || '#848484')
        .linkWidth(link => Math.max(1, Number(link.width) || 1))
        .linkLineDash(link => link._lineDash)
        .linkCurvature(link => link._curvature || 0)
        .linkDirectionalArrowLength(link => link._arrowLength || 0)
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalArrowColor(link => link.color || '#848484')
        .linkLabel(link => link.title || link.label || '')
        .enableNodeDrag(true)
        .enableZoomInteraction(true)
        .enablePanInteraction(true)
        .enablePointerInteraction(true)
        .warmupTicks(100)
        .cooldownTicks(200);
}

/**
 * 名称     : Force-Graphの3Dネットワーク作成
 * 内容     : Force-Graphの3Dネットワークを作成する
 * @param {HTMLElement} container - コンテナ要素
 * @returns {Object} - Force-Graphインスタンス
 */
function AdaptNet_Create3DNetwork(container) {
    // OrbitControls は DragControls のドラッグ終了時に発生する
    // pointerup と競合するため、3DではTrackballControlsを使用する。
    // ノードドラッグはForce-Graph側のDragControlsが引き続き担当する。
    return new window.ForceGraph3D(container, { controlType: 'trackball' })
        .backgroundColor('#ffffff')
        .showNavInfo(false)
        .nodeRelSize(4)
        .nodeVal(node => Number(node.val) || 1)
        .nodeLabel(node => node.title || node.label || '')
        .nodeColor(node => node.color || '#97C2FC')
        .nodeThreeObject(AdaptNet_Create3DNodeObject)
        .linkColor(link => link.color || '#848484')
        .linkWidth(link => Math.max(1, Number(link.width) || 1))
        .linkCurvature(link => link._curvature || 0)
        .linkDirectionalArrowLength(link => link._arrowLength || 0)
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalArrowColor(link => link.color || '#848484')
        .linkLabel(link => link.title || link.label || '')
        .enableNodeDrag(true)
        .warmupTicks(100)
        .cooldownTicks(200);
}

/**
 * 名称     : Force-Graphのモード使用可否判定
 * 内容     : 指定されたモードが使用可能か判定する
 * @param {string} mode - モード
 * @returns {boolean} - 使用可能か
 */
function AdaptNet_IsModeAvailable(mode) {
    if (typeof window === 'undefined') return false;
    if (mode === '3d') {
        return typeof window.ForceGraph3D === 'function' && !!window.THREE;
    }
    return typeof window.ForceGraph === 'function';
}

/**
 * 名称     : Force-Graphのネットワーク構築
 * 内容     : Force-Graphのネットワークを構築する
 * @param {string} mode - モード
 * @param {HTMLElement} container - コンテナ要素
 * @returns {boolean} - 構築できたか
 */
function AdaptNet_BuildActiveNetwork(mode, container) {
    if (!AdaptNet_IsModeAvailable(mode)) {
        console.error(`[ERROR] Force-Graph ${mode.toUpperCase()} が読み込まれていません。`);
        return false;
    }

    try {
        AdaptNet_DestroyNetwork();
        container.replaceChildren();
        AdaptNet_Network = mode === '3d'
            ? AdaptNet_Create3DNetwork(container)
            : AdaptNet_Create2DNetwork(container);
        AdaptNet_NetworkMode = mode;
        AdaptNet_NetworkContainer = container;
        AdaptNet_Install2DTouchRotation(container);
        AdaptNet_ApplyForceSettings(AdaptNet_Network);
        AdaptNet_ApplyInteractionHandlers();
        AdaptNet_NetworkInitialized = true;

        if (AdaptNet_CurrentNodes.length || AdaptNet_CurrentEdges.length) {
            AdaptNet_Redraw();
        }
        console.log(`[NETWORK] Force-Graph ${mode.toUpperCase()} 初期化完了`);
        return true;
    } catch (e) {
        console.error(`[ERROR] Force-Graph ${mode.toUpperCase()} 初期化に失敗しました:`, e);
        APPSTATE_SetErrorFlag('networkInitFailed', true);
        APPSTATE_SetState(APPSTATE_STATE.ERROR);
        return false;
    }
}

/**
 * 名称     : Force-Graph 2D 初期化処理
 * 内容     : 初期表示を2Dで生成する
 * @param {HTMLElement} container - 描画先コンテナ
 * @returns {boolean} - 初期化成功なら true
 */
export function ADAPTNET_InitNetworkIfNeeded(container) {
    if (AdaptNet_NetworkInitialized) return true;
    if (!container || !AdaptNet_IsModeAvailable('2d')) {
        console.error('[ERROR] Force-Graph 2D が読み込まれていません。');
        APPSTATE_SetErrorFlag('forceGraphNotAvailable', true);
        APPSTATE_SetState(APPSTATE_STATE.ERROR);
        return false;
    }
    return AdaptNet_BuildActiveNetwork('2d', container);
}

/**
 * 名称     : 2D / 3D表示モード切替
 * 内容     : 現在のノード・エッジ・表示属性を維持したまま描画器だけを切り替える
 * @param {string} mode - '2d' または '3d'
 * @param {HTMLElement} container - 描画先コンテナ
 * @returns {boolean} - 切替成功なら true
 */
export function ADAPTNET_SetDisplayMode(mode, container = AdaptNet_NetworkContainer) {
    const nextMode = mode === '3d' ? '3d' : '2d';
    if (!container || !AdaptNet_IsModeAvailable(nextMode)) return false;
    if (AdaptNet_NetworkInitialized && AdaptNet_NetworkMode === nextMode) return true;
    return AdaptNet_BuildActiveNetwork(nextMode, container);
}

export function ADAPTNET_GetDisplayMode() {
    return AdaptNet_NetworkMode;
}

/**
 * 名称     : ネットワークデータ更新
 * 内容     : 元形式のノード／エッジをForce-Graph形式へ変換して描画する
 * @param {Array<object>} nodeList - ノードリスト
 * @param {Array<object>} edgeList - エッジリスト（from/to または source/target）
 * @param {string} colorMode - 色モード
 * @param {Array<object>} rankingData - ランキングデータ
 * @returns {boolean} - 成功時 true
 */
export function ADAPTNET_SetNetworkData(nodeList, edgeList, colorMode, rankingData) {
    console.log('[NETWORK] Updating Force-Graph data...');
    if (!AdaptNet_NetworkInitialized || !AdaptNet_Network) return false;

    try {
        AdaptNet_CurrentSourceNodes = Array.isArray(nodeList) ? nodeList : [];
        AdaptNet_CurrentColorMode = colorMode || 'default-color';
        AdaptNet_CurrentRankingData = rankingData || [];
        AdaptNet_CurrentNodes = AdaptNet_CurrentSourceNodes.map(node =>
            AdaptNet_MapNodeForNetwork(node, AdaptNet_CurrentColorMode, AdaptNet_CurrentRankingData)
        );
        const availableNodeIds = new Set(AdaptNet_CurrentSourceNodes.map(node => String(node.id)));
        const mappedEdges = (Array.isArray(edgeList) ? edgeList : []).map(AdaptNet_MapEdgeForNetwork);
        const invalidEdges = mappedEdges.filter(edge =>
            edge.source == null || edge.target == null ||
            !availableNodeIds.has(String(edge.source)) ||
            !availableNodeIds.has(String(edge.target))
        );
        AdaptNet_CurrentEdges = mappedEdges.filter(edge => !invalidEdges.includes(edge));
        if (invalidEdges.length > 0) {
            console.warn('[NETWORK] 不正なエッジ端点を除外しました:', invalidEdges.map(edge => ({
                source: edge.source,
                target: edge.target,
                type: edge.type || edge.relationType || ''
            })));
        }
        AdaptNet_CurrentNodeIds = AdaptNet_CurrentSourceNodes.map(node => node.id);

        AdaptNet_Network.graphData({
            nodes: AdaptNet_CurrentNodes,
            links: AdaptNet_CurrentEdges.map(edge => Object.assign({}, edge))
        });
        console.log('[NETWORK] graphData 実行: nodes=', AdaptNet_CurrentNodes.length, 'edges=', AdaptNet_CurrentEdges.length);
        return true;
    } catch (e) {
        console.error('[ERROR] Force-Graph data更新に失敗:', e);
        return false;
    }
}

/**
 * 名称     : 現在表示中のノードID取得
 * @returns {Array<number|string>} - 現在表示中のノードID配列
 */
export function ADAPTNET_GetCurrentNodeIds() {
    return [...AdaptNet_CurrentNodeIds];
}

/**
 * 名称     : 現在表示中のノード取得
 * @returns {Array<object>} - 現在表示中のForce-Graphノード配列
 */
export function ADAPTNET_GetVisibleNodes() {
    return [...AdaptNet_CurrentNodes];
}

/**
 * 名称     : 現在表示中のノードをIDで取得
 * @param {number|string} nodeId - ノードID
 * @returns {object|null} - ノード
 */
export function ADAPTNET_GetVisibleNodeById(nodeId) {
    return AdaptNet_CurrentNodes.find(node => String(node.id) === String(nodeId)) || null;
}

/**
 * 名称     : Force-Graphインスタンス取得
 * @returns {object|null} - 現在表示中のForce-Graphインスタンス
 */
export function ADAPTNET_GetNetwork() {
    return AdaptNet_Network;
}

export function ADAPTNET_GetNetworkInitialized() {
    return AdaptNet_NetworkInitialized;
}

/**
 * 名称     : ノード表示属性の一時更新
 * @param {number|string} nodeId - ノードID
 * @param {Object} visual - 更新する表示属性
 * @returns {boolean} - 更新できた場合 true
 */
export function ADAPTNET_UpdateNodeVisual(nodeId, visual) {
    const node = ADAPTNET_GetVisibleNodeById(nodeId);
    if (!node || !visual) return false;
    Object.assign(node, visual);
    AdaptNet_Redraw();
    return true;
}

/**
 * 名称     : ノード表示属性を通常状態へ戻す
 * @param {number|string} nodeId - ノードID
 * @returns {boolean} - 更新できた場合 true
 */
export function ADAPTNET_ResetNodeVisual(nodeId) {
    const sourceNode = AdaptNet_CurrentSourceNodes.find(node => String(node.id) === String(nodeId));
    const currentNode = ADAPTNET_GetVisibleNodeById(nodeId);
    if (!sourceNode || !currentNode) return false;

    const baseNode = AdaptNet_MapNodeForNetwork(sourceNode, AdaptNet_CurrentColorMode, AdaptNet_CurrentRankingData);
    Object.assign(currentNode, {
        color: baseNode.color,
        borderColor: baseNode.borderColor,
        highlightColor: baseNode.highlightColor,
        val: baseNode.val,
        title: baseNode.title,
        rankingScore: baseNode.rankingScore,
        rankingRank: baseNode.rankingRank
    });
    AdaptNet_Redraw();
    return true;
}

/**
 * 名称     : ノードへフォーカス
 * 内容     : 表示モードに応じたカメラ操作でノードへフォーカスする
 * @param {number|string} nodeId - ノードID
 * @param {Object} options - scale、duration
 * @returns {boolean} - フォーカスできた場合 true
 */
export function ADAPTNET_FocusNode(nodeId, options = {}) {
    const node = ADAPTNET_GetVisibleNodeById(nodeId);
    if (!node || !AdaptNet_Network) return false;
    const duration = Number.isFinite(Number(options.duration)) ? Number(options.duration) : 500;
    const requestedScale = Number.isFinite(Number(options.scale)) ? Number(options.scale) : 1.2;

    if (AdaptNet_NetworkMode === '3d' && typeof AdaptNet_Network.cameraPosition === 'function') {
        const x = Number.isFinite(node.x) ? node.x : 0;
        const y = Number.isFinite(node.y) ? node.y : 0;
        const z = Number.isFinite(node.z) ? node.z : 0;
        const distance = Math.max(100, 240 / Math.max(requestedScale, 0.1));
        AdaptNet_Network.cameraPosition(
            { x, y, z: z + distance },
            { x, y, z },
            duration
        );
        return true;
    }

    if (Number.isFinite(node.x) && Number.isFinite(node.y)) {
        AdaptNet_Network.centerAt(node.x, node.y, duration);
    }
    const currentZoom = Number(AdaptNet_Network.zoom());
    const nextZoom = Number.isFinite(currentZoom) ? Math.max(currentZoom, requestedScale) : requestedScale;
    AdaptNet_Network.zoom(nextZoom, duration);
    return true;
}

/**
 * 名称     : Force-Graphイベントリスナー登録
 * 内容     : Force-Graphのイベントリスナーを登録する
 * @param {string} type - nodeClick, nodeRightClick, linkClick, linkRightClick, backgroundClick, backgroundRightClick, nodeDrag
 * @param {Function} listener - リスナー
 */
export function ADAPTNET_AddInteractionListener(type, listener) {
    if (!AdaptNet_InteractionListeners[type] || typeof listener !== 'function') return;
    AdaptNet_InteractionListeners[type].add(listener);
}

/**
 * 名称     : Force-Graphイベントリスナー削除
 * 内容     : Force-Graphのイベントリスナーを削除する
 * @param {string} type - nodeClick, nodeRightClick, linkClick, linkRightClick, backgroundClick, backgroundRightClick, nodeDrag
 * @param {Function} listener - リスナー
 */
export function ADAPTNET_RemoveInteractionListener(type, listener) {
    if (!AdaptNet_InteractionListeners[type]) return;
    AdaptNet_InteractionListeners[type].delete(listener);
}

/**
 * 名称     : ネットワークカラー再適用
 * 内容     : 現在表示中のノードの色とランキングサイズだけを更新する
 * @param {string} colorMode - 色モード
 * @param {Array<object>} rankingData - ランキングデータ
 */
export function ADAPTNET_RefreshNetworkColors(colorMode, rankingData) {
    if (!AdaptNet_NetworkInitialized) return;
    try {
        AdaptNet_CurrentColorMode = colorMode || 'default-color';
        AdaptNet_CurrentRankingData = rankingData || [];
        AdaptNet_CurrentNodes.forEach((currentNode, index) => {
            const sourceNode = AdaptNet_CurrentSourceNodes[index] || currentNode;
            const baseNode = AdaptNet_MapNodeForNetwork(sourceNode, AdaptNet_CurrentColorMode, AdaptNet_CurrentRankingData);
            Object.assign(currentNode, {
                color: baseNode.color,
                borderColor: baseNode.borderColor,
                highlightColor: baseNode.highlightColor,
                val: baseNode.val,
                title: baseNode.title,
                rankingScore: baseNode.rankingScore,
                rankingRank: baseNode.rankingRank
            });
        });
        AdaptNet_Redraw();
        console.log('[UI] refreshNetworkColors executed, nodes=', AdaptNet_CurrentNodes.length);
    } catch (e) {
        console.warn('[UI] refreshNetworkColors failed:', e);
    }
}
