// ----------------------------------------------------------------------------
// ファイル名      : DateInfoRenderer.js
// モジュール記号  : DINFORENDR / DInfoRendr
// モジュール名    : 公開日・編集日生成 (SW302-APP-DINFORENDR) Source File
// 内容            : datePublished や dateModified を整形して出力する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { DOMWRITER_WriteToContainer } from '../Middleware/DomWriter.js';

/**
 * 名称     : 記事日付情報生成
 * 内容     : 公開日と編集日をレンダリングする
 * @param {Object} current - 現在の記事ノード
 */
export function DINFORENDR_RenderDateInfo(current) {
    // ISO文字列を想定 (例: "2020-02-15T09:40:52Z")
    const rawPub = current.datePublished || null;
    const rawRev = current.dateModified || null;

    // Date に安全に変換
    const DInfoRendr_ConvDateSafe = (v) => {
        if (!v) return null;
        if (v instanceof Date) return isNaN(v) ? null : v;
        const d = new Date(v);
        return isNaN(d) ? null : d;
    };

    const pubDateObj = DInfoRendr_ConvDateSafe(rawPub);
    let revDateObj = DInfoRendr_ConvDateSafe(rawRev);

    // ===== 応急処置ロジック =====
    // 公開日 > 編集日 の場合は 編集日 = 公開日 に補正
    if (pubDateObj && revDateObj && pubDateObj.getTime() > revDateObj.getTime()) {
        console.warn('[date-info] dateModified is earlier than datePublished. ', { datePublished: pubDateObj.toISOString(), dateModified: revDateObj.toISOString(), source: current });
        revDateObj = new Date(pubDateObj.getTime());
    }

    /**
     * Date → ISO文字列
     */
    const DInfoRendr_ConvISOStringSafe = (d) => (d ? d.toISOString() : '');

    const pubDate = DInfoRendr_ConvISOStringSafe(pubDateObj);
    const revDate = DInfoRendr_ConvISOStringSafe(revDateObj);

    // HTML 生成
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

    DOMWRITER_WriteToContainer('date-info', html);
}
