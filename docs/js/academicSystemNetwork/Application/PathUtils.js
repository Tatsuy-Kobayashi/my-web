import { getVisibleEdges, createHierarchyIndex } from '../../common/siteHierarchy/Hierarchy.mjs';
// ----------------------------------------------------------------------------
// ファイル名      : PathUtils.js
// モジュール記号  : PATHUTILS / PathUtils
// モジュール名    : パス解析共通処理 (SW301-APP-PATHUTILS) Source File
// 内容            : mainPath や auxPath のパース・比較を行う共通ユーティリティ
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

/**
 * 名称     : リレーションタイプ定義取得
 * 内容     : リレーションタイプ定義を取得する
 * @param {string} type - リレーションタイプ
 * @param {Object[]} relationTypes - リレーションタイプ配列
 * @returns {Object} リレーションタイプ定義
 */
export function PathUtils_GetRelationTypeDef(type, relationTypes) {
    const types = Array.isArray(relationTypes) ? relationTypes : [];
    return types.find(def => def && def.type === type) || {};
}

/**
 * 名称     : 各ノード階層算出
 * 内容     : nodes に含まれる mainPath を元に、各ノードの階層（level）を計算する。ノードの階層は、グラフの構造を決定づけるため、原則として mainPath に基づいて計算する
 * @param {Object[]} nodes - ノード配列
 * @returns {number} maxAvailableLevel
 */
export function PATHUTILS_EnsureLevelsFromPaths(nodes) {
    let maxAvailableLevel = 0;

    for (const n of nodes) {
        // mainPath が存在しない場合は ASNCTRL_ValidateData で弾かれるため、ここでは安全に参照可能
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

/**
 * 名称     : エッジ情報生成
 * 内容     : filteredNodes に含まれる path を元に、エッジ情報を生成する
 * @param {Object[]} filteredNodes - ユーザ操作で選択されたノード配列
 * @param {Object[]} relationTypes - リレーションタイプ配列
 * @returns {Object[]} エッジ配列
 */
export function PATHUTILS_BuildEdgesFromPaths(filteredNodes, relationTypes) {
    return getVisibleEdges(filteredNodes).map(({ from, to, type }) => {
        const typeDef = PathUtils_GetRelationTypeDef(type, relationTypes);
        const edge = { from, to, type, relationType: type, title: typeDef.description || type, arrows: 'to' };
        if (type === 'main_path') edge.smooth = { enabled: false };
        else Object.assign(edge, {
            smooth: { enabled: true, type: 'dynamic', roundness: 0.4 },
            length: 300, dashes: true, color: { opacity: 0.6, inherit: 'from' }
        });
        return edge;
    });
}

/**
 * 名称     : キーワードレイヤーエッジ生成
 * 内容     : キーワードエッジデータからエッジ情報を生成する
 * @param {Object[]} filteredNodes - ユーザ操作で選択されたノード配列
 * @param {Object[]} keywordEdgesData - キーワードエッジデータ配列
 * @param {Object[]} relationTypes - リレーションタイプ配列
 * @returns {Object[]} エッジ配列
 */
export function PATHUTILS_BuildKeywordLayerEdges(filteredNodes, keywordEdgesData, relationTypes) {
    const visible = new Set(filteredNodes.map(n => Number(n.id)));
    if (!Array.isArray(keywordEdgesData)) return [];

    return keywordEdgesData
        .filter(edge => visible.has(Number(edge.from)) && visible.has(Number(edge.to)))
        .map(edge => {
            const keywords = Array.isArray(edge.keywords) && edge.keywords.length > 0
                ? edge.keywords.map(keyword => String(keyword).trim()).filter(Boolean)
                : [String(edge.edgeLabel || edge.label || '').replace(/^共通タグ:\s*/, '').trim()].filter(Boolean);

            const typeDef = PathUtils_GetRelationTypeDef('keyword_shared', relationTypes);
            const edgeLabelDef = typeDef.edgeLabel || typeDef.label || 'keyword_shared';
            const keywordLabel = keywords.length > 0 ? keywords.join(' / ') : edgeLabelDef;
            const fromLabel = edge.evidence?.fromLabel || String(edge.from);
            const toLabel = edge.evidence?.toLabel || String(edge.to);

            return {
                from: Number(edge.from),
                to: Number(edge.to),
                type: edge.type || 'keyword_shared',
                relationType: edge.relationType || edge.type || 'keyword_shared',
                label: keywordLabel,
                title: `共通タグ : ${keywordLabel} : ${fromLabel} ↔ ${toLabel}`,
                dashes: Boolean(typeDef.presentation?.dashes),
                arrows: typeDef.presentation?.arrows ?? '',
                // keywordEdges.weight is a generated shared-tag strength, separate from typed relation strength.
                width: Math.max(1, Math.min(4, 1 + Number(edge.weight || 0) * 3)),
                color: { color: '#8A8F98', opacity: 0.45 },
                smooth: { enabled: true, type: 'dynamic', roundness: 0.25 },
                length: 220
            };
        });
}

/**
 * 名称     : 関係タイプエッジ情報生成
 * 内容     : filteredNodes に含まれる path を元に、エッジ情報を生成する
 * @param {Object[]} filteredNodes - ユーザ操作で選択されたノード配列
 * @param {Object[]} conceptsData - コンセプトデータ配列
 * @param {Object[]} relationsData - リレーションデータ配列
 * @param {Object[]} relationTypes - リレーションタイプ配列
 * @returns {Object[]} エッジ配列
 */
export function PATHUTILS_BuildTypedRelationLayerEdges(filteredNodes, conceptsData, relationsData, relationTypes) {
    const visible = new Set(filteredNodes.map(n => Number(n.id)));
    if (!Array.isArray(conceptsData) || !Array.isArray(relationsData)) return [];

    const conceptById = new Map(conceptsData.map(concept => [concept.conceptId, concept]));
    const siteIdByConceptId = new Map();
    conceptsData.forEach(concept => {
        if (concept && concept.siteRef && Number.isFinite(Number(concept.siteRef.id))) {
            siteIdByConceptId.set(concept.conceptId, Number(concept.siteRef.id));
        }
    });

    return relationsData
        .filter(relation => relation && relation.type !== 'part_of')
        .map(relation => {
            const from = siteIdByConceptId.get(relation.from);
            const to = siteIdByConceptId.get(relation.to);
            if (!visible.has(from) || !visible.has(to)) return null;

            const typeDef = PathUtils_GetRelationTypeDef(relation.type, relationTypes);
            const fromConcept = conceptById.get(relation.from);
            const toConcept = conceptById.get(relation.to);
            const fromLabel = fromConcept?.labels?.ja || fromConcept?.siteRef?.label || relation.from;
            const toLabel = toConcept?.labels?.ja || toConcept?.siteRef?.label || relation.to;

            return {
                from,
                to,
                type: relation.type,
                relationType: relation.type,
                label: typeDef.edgeLabel || typeDef.label || relation.type,
                title: `${fromLabel} → ${toLabel}: ${typeDef.description || relation.note || relation.type}`,
                arrows: typeDef.presentation?.arrows ?? (typeDef.directed === false ? '' : 'to'),
                dashes: Boolean(typeDef.presentation?.dashes),
                width: Math.max(1, Math.min(5, 1 + Number(relation.strength) * 2 + Number(typeDef.presentation?.visualPriority || 0))),
                color: { color: '#2F6FB0', opacity: 0.75 },
                smooth: { enabled: true, type: 'dynamic', roundness: 0.2 },
                length: 180
            };
        })
        .filter(Boolean);
}

/**
 * 名称     : 可視エッジ生成
 * 内容     : 可視ノードに対応するエッジ情報を生成する
 * @param {Object[]} filteredNodes - ユーザ操作で選択されたノード配列
 * @param {Object} edgeLayerState - エッジレイヤー状態
 * @param {Object} data - データオブジェクト
 * @returns {Object[]} エッジ配列
 */
export function PATHUTILS_BuildVisibleEdges(filteredNodes, edgeLayerState, data) {
    console.log('[SEARCH] building edges for visible nodes');

    const edgeLayers = [];
    if (edgeLayerState.hierarchy) edgeLayers.push(...PATHUTILS_BuildEdgesFromPaths(filteredNodes, data.relationTypes));
    if (edgeLayerState.keyword) edgeLayers.push(...PATHUTILS_BuildKeywordLayerEdges(filteredNodes, data.keywordEdgesData, data.relationTypes));
    if (edgeLayerState.typed) edgeLayers.push(...PATHUTILS_BuildTypedRelationLayerEdges(filteredNodes, data.conceptsData, data.relationsData, data.relationTypes));
    console.log('[SEARCH] built edges for visible nodes');

    return edgeLayers;
}

/**
 * 名称     : paths から親/子関係マップを生成する処理
 * 内容     : nodesData に含まれる paths を元に、親/子関係マップを生成する
 * @param {Object[]} nodesData - ノードデータ配列
 * @returns {Object}親/子関係マップ
 */
// 備考     : 現在はノードフォーカス処理のみからコールされる。
export function PATHUTILS_BuildParentChildMaps(nodesData) {
    const index = createHierarchyIndex(nodesData);
    const parentsMap = new Map(), childrenMap = new Map();
    for (const node of nodesData) {
        parentsMap.set(node.id, new Set(index.getParents(node.id).map(edge => edge.from)));
        childrenMap.set(node.id, new Set(index.getChildren(node.id).map(edge => edge.to)));
    }
    return { parentsMap, childrenMap };
}

// compute focus set: include nodeId, ancestors up levels, descendants down levels
/**
 * 名称     : フォーカス集合計算
 * 内容     : ノードを中心に、親/子関係を元に focus set を計算する
 * @param {number} nodeId - ノードID
 * @param {number} upDepth - 上方向に探索する階層数(0以上の整数)
 * @param {number} downDepth - 下方向に探索する階層数(0以上の整数)
 * @param {Map<number, Set<number>>} parentsMap - 親IDから子のSetへのマップ
 * @param {Map<number, Set<number>>} childrenMap - 子IDから親のSetへのマップ
 * @returns {Set<number>} focus set
 */
export function PATHUTILS_ComputeFocusSet(nodeId, upDepth, downDepth, parentsMap, childrenMap) {
    const result = new Set();
    result.add(nodeId);

    // ancestors (up)
    let current = new Set([nodeId]);
    for (let d = 0; d < upDepth; d++) {
        const next = new Set();
        for (const id of current) {
            const parents = parentsMap.get(id);
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
            const children = childrenMap.get(id);
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

