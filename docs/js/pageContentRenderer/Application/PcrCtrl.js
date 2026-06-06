// ----------------------------------------------------------------------------
// ファイル名     : PcrCtrl.js
// モジュール記号  : PCR / Pcr
// モジュール名    : PCR制御 (SW300-APP-PCR) Source File
// 内容           : 各描画関数を順序どおり呼び出すオーケストレータ
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { renderBreadcrumbs } from './BreadcrumbRenderer.js';
import { renderDateInfo } from './DateInfoRenderer.js';
import { renderChildList } from './ChildListRenderer.js';
import { renderTagList } from './TagListRenderer.js';
import { renderTypedRelations } from './TypedRelationRenderer.js';
import { renderRelatedLinks } from './RelatedLinksRenderer.js';
import { renderPager } from './PagerRenderer.js';
import { renderPopularSection } from './PopularRenderer.js';
import { renderCategoryList } from './CategoryListRenderer.js';

/**
 * 名称     : 全パーツを描画
 * 内容     : 全描画パーツを順序どおり実行する
 * @param {Object} siteData - サイトデータ
 * @param {Object} concepts - 概念データ
 * @param {Object} relations - 関係データ
 * @param {Object} relationTypes - 関係種別データ
 * @param {Object} viewStats - 表示統計データ
 * @param {Object} currentNode - 現在の記事ノード
 * @returns {Promise<void>}
 */
export function PCR_renderAllParts(siteData, concepts, relations, relationTypes, viewStats, currentNode) {
    // A. パンくずリスト生成
    renderBreadcrumbs(siteData, currentNode);
    // B. 公開日・編集日生成
    renderDateInfo(currentNode);
    // C. 下層記事一覧生成
    renderChildList(siteData, currentNode, 3);
    // D. タグ一覧生成
    renderTagList(currentNode);
    // E. 型付き概念関係生成
    renderTypedRelations(siteData, currentNode, concepts, relations, relationTypes);
    // F. 関連記事リンク生成
    renderRelatedLinks(siteData, currentNode);
    // G. 前後記事リンク生成
    renderPager(siteData, currentNode);
    // H. 人気記事
    renderPopularSection(siteData, viewStats);
    // I. カテゴリー一覧生成
    renderCategoryList(siteData);
}
