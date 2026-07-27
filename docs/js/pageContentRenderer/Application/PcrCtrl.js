// ----------------------------------------------------------------------------
// ファイル名      : PcrCtrl.js
// モジュール記号  : PCR / Pcr
// モジュール名    : PCR制御 (SW300-APP-PCR) Source File
// 内容            : 各描画関数を順序どおり呼び出すオーケストレータ
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { BREADRENDR_RenderBreadcrumbs } from './BreadcrumbRenderer.js';
import { DINFORENDR_RenderDateInfo } from './DateInfoRenderer.js';
import { CHLISTRENDR_RenderChildList } from './ChildListRenderer.js';
import { TLISTRENDR_RenderTagList } from './TagListRenderer.js';
import { TRLTRENDR_RenderTypedRelations } from './TypedRelationRenderer.js';
import { RLTLINKRENDR_RenderRelatedLinks } from './RelatedLinksRenderer.js';
import { PAGRRENDR_RenderPager } from './PagerRenderer.js';
import { POPRENDR_RenderPopularSection } from './PopularRenderer.js';
import { CTLISTRENDR_RenderCategoryList } from './CategoryListRenderer.js';

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
export function PCR_RenderAllParts(siteData, concepts, relations, relationTypes, viewStats, currentNode) {
    // A. パンくずリスト生成
    BREADRENDR_RenderBreadcrumbs(siteData, currentNode);
    // B. 公開日・編集日生成
    DINFORENDR_RenderDateInfo(currentNode);
    // C. 下層記事一覧生成
    CHLISTRENDR_RenderChildList(siteData, currentNode, 3);
    // D. タグ一覧生成
    TLISTRENDR_RenderTagList(currentNode);
    // E. 型付き概念関係生成
    TRLTRENDR_RenderTypedRelations(siteData, currentNode, concepts, relations, relationTypes);
    // F. 関連記事リンク生成
    RLTLINKRENDR_RenderRelatedLinks(siteData, currentNode);
    // G. 前後記事リンク生成
    PAGRRENDR_RenderPager(siteData, currentNode);
    // H. 人気記事
    POPRENDR_RenderPopularSection(siteData, viewStats);
    // I. カテゴリー一覧生成
    CTLISTRENDR_RenderCategoryList(siteData);
}
