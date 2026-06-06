// ----------------------------------------------------------------------------
// ファイル名    : BreadcrumbRenderer.js
// 名称          : パンくずリスト生成
// 内容          : mainPath や auxPath からパンくずリストHTMLを構築し出力する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { getFirstPath, getAuxPaths, parsePathIds } from './PathUtils.js';
import { buildPreviewLinkHtml } from '../Middleware/PreviewLinkBuilder.js';
import { writeToContainer } from '../Middleware/DomWriter.js';

/**
 * パンくずリストをレンダリングする
 * @param {Array} allData - サイトデータの配列
 * @param {Object} current - 現在の記事ノード
 */
// options:
//  - includeHome: boolean (first column only)
//  - treatAsMain: boolean (mainPath column: exclude last id because it's current)
export function renderBreadcrumbs(allData, current) {
    const renderColumnFromPath = (pathStr, options = {}) => {
        const { includeHome = false, treatAsMain = false } = options;
        if (!pathStr || typeof pathStr !== 'string') return '';
        const parts = parsePathIds(pathStr);
        if (parts.length === 0) return '';

        // HTML 生成
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
            html += buildPreviewLinkHtml(pathNode, { asLink: true });
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
    const mainPath = getFirstPath(current);
    const auxPaths = getAuxPaths(current, mainPath);

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

    writeToContainer('breadcrumb-list', finalHtml);
}
