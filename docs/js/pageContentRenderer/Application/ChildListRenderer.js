// ----------------------------------------------------------------------------
// ファイル名      : ChildListRenderer.js
// モジュール記号  : CHLISTRENDR / ChListRendr
// モジュール名    : 下層記事一覧生成 (SW303-APP-CHILDLIST) Source File
// 内容            : 現在ノード配下の子孫を階層ツリーで描画する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { PATHUTILS_GetFirstPath, PATHUTILS_ParsePathIds } from './PathUtils.js';
import { HTMLHLPR_EnsureArray } from '../Middleware/HtmlHelper.js';
import { PREVLINK_BuildPreviewCardHtml } from '../Middleware/PreviewLinkBuilder.js';
import { DOMWRITER_WriteToContainer } from '../Middleware/DomWriter.js';

/**
 * 下層記事一覧（階層構造メニュー）を生成する
 * @param {Array|Object} allData - siteData.jsonの中身
 * @param {Object} current - 現在の記事データ
 * @param {number} maxDepth - 最大展開深度
 */
export function CHLISTRENDR_RenderChildList(allData, current, maxDepth) {
    // siteData（allData）から子孫を取得する。
    // current.dir_path に依存せず mainPath を用いた抽出に委ねる。
    allData = HTMLHLPR_EnsureArray(allData);

    // mainPath を使って現在ノードの下位（descendant）を階層的に表示する実装
    const currentPath = PATHUTILS_GetFirstPath(current);
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
                const parts = PATHUTILS_ParsePathIds(ap);
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

    // parentId -> [ { tailId, node }, ... ] 形式に変換
    const auxInsertionsByParent = new Map();
    auxMatchesMap.forEach(({ node, matchedAuxPaths }) => {
        if (!Array.isArray(matchedAuxPaths)) return;
        matchedAuxPaths.forEach(ap => {
            if (typeof ap !== 'string') return;
            const parts = PATHUTILS_ParsePathIds(ap);
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
    const ChListRendr_immediateChildrenOf = (parentPath) => {
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

        //  --- auxPath による挿入: auxMatchesMap から parentPath の最後の ID を親として参照するものを追加 ---
        const parentId = parseInt(parentParts[parentParts.length - 1], 10);
        if (!Number.isNaN(parentId)) {
            const insertions = auxInsertionsByParent.get(parentId);
            if (Array.isArray(insertions) && insertions.length > 0) {
                insertions.forEach(({ tailId, node }) => {
                    // 重複挿入を避ける: すでに results に同一ノード（auxPath であっても）が存在しないか確認してから追加
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
            const p = PATHUTILS_GetFirstPath(item) || '';
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
    const ChListRendr_buildList = (parentPath, depth = 0, maxD) => {
        const children = ChListRendr_immediateChildrenOf(parentPath);
        if (!children || children.length === 0) return '';
        let out = '';
        children.forEach(child => {
            const childPath = PATHUTILS_GetFirstPath(child);
            const hasDesc = descendants.some(d => {
                const dps = Array.isArray(d.mainPath) ? d.mainPath : [d.mainPath];
                return dps.some(mp => typeof mp === 'string' && mp.startsWith(childPath + ':'));
            });
            out += '<li class="li_pulldownList">';
            // 深い子を持つ場合または現在ノードの直下の子（parentPath === currentPath）の場合は
            // <details><summary> でラップする。ただし内部リストは存在する場合のみ追加する。
            if ((hasDesc || parentPath === currentPath) && depth < maxD) {
                out += '<details class="details_pulldownList">';
                out += `<summary class="summary_pulldownList">${PREVLINK_BuildPreviewCardHtml(child)}</summary>`;
                const inner = ChListRendr_buildList(childPath, depth + 1, maxD);
                if (inner) out += inner;
                out += '</details>';
            } else {
                out += PREVLINK_BuildPreviewCardHtml(child);
            }
            out += '</li>';
        });
        return out;
    };

    // HTML 生成
    let html = '<ul class="ul_pulldownList">';
    html += ChListRendr_buildList(currentPath, 0, maxDepth);
    html += '</ul> <!-- /.ul_pulldownList -->';

    DOMWRITER_WriteToContainer('child-pages-list', html);
}
