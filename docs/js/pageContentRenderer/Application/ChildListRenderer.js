// ----------------------------------------------------------------------------
// ファイル名    : ChildListRenderer.js
// 名称          : 下層記事一覧生成
// 内容          : 現在ノード配下の子孫を階層ツリーで描画する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { getFirstPath, parsePathIds } from './PathUtils.js';
import { ensureArray } from '../Middleware/HtmlHelper.js';
import { buildPreviewCardHtml } from '../Middleware/PreviewLinkBuilder.js';
import { writeToContainer } from '../Middleware/DomWriter.js';

/**
 * 下層記事一覧（階層構造メニュー）を生成する
 * @param {Array|Object} allData - siteData.jsonの中身
 * @param {Object} current - 現在の記事データ
 * @param {number} maxDepth - 最大展開深度
 */
export function renderChildList(allData, current, maxDepth) {
    allData = ensureArray(allData);

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
                const parts = parsePathIds(ap);
                if (parts.length === 0) return;
                if (!parts.includes(currentId)) return;
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
    const auxMatches = Array.from(auxMatchesMap.values());
    console.log('auxMatches:', auxMatches);

    // parentId -> [ { tailId, node }, ... ] 形式に変換
    const auxInsertionsByParent = new Map();
    auxMatchesMap.forEach(({ node, matchedAuxPaths }) => {
        if (!Array.isArray(matchedAuxPaths)) return;
        matchedAuxPaths.forEach(ap => {
            if (typeof ap !== 'string') return;
            const parts = parsePathIds(ap);
            if (parts.length < 2) return;
            const penultimate = parts[parts.length - 2];
            const tail = parts[parts.length - 1];
            if (!Number.isFinite(penultimate) || !Number.isFinite(tail)) return;
            const arr = auxInsertionsByParent.get(penultimate) || [];
            arr.push({ tailId: tail, node });
            auxInsertionsByParent.set(penultimate, arr);
        });
    });

    if (!descendants || descendants.length === 0) return;

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

        // auxPath による挿入
        const parentId = parseInt(parentParts[parentParts.length - 1], 10);
        if (!Number.isNaN(parentId)) {
            const insertions = auxInsertionsByParent.get(parentId);
            if (Array.isArray(insertions) && insertions.length > 0) {
                insertions.forEach(({ tailId, node }) => {
                    const exists = results.some(r => {
                        if (!r.__isAux && r.id === node.id) return true;
                        if (r.__isAux && r.__auxOriginalId === node.id && r.__auxTailId === tailId) return true;
                        return false;
                    });
                    if (!exists) {
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

    // 再帰的にリストを構築
    const buildList = (parentPath, depth = 0, maxD) => {
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
            if ((hasDesc || parentPath === currentPath) && depth < maxD) {
                out += '<details class="details_pulldownList">';
                out += `<summary class="summary_pulldownList">${buildPreviewCardHtml(child)}</summary>`;
                const inner = buildList(childPath, depth + 1, maxD);
                if (inner) out += inner;
                out += '</details>';
            } else {
                out += buildPreviewCardHtml(child);
            }
            out += '</li>';
        });
        return out;
    };

    let html = '<ul class="ul_pulldownList">';
    html += buildList(currentPath, 0, maxDepth);
    html += '</ul> <!-- /.ul_pulldownList -->';

    writeToContainer('child-pages-list', html);
}
