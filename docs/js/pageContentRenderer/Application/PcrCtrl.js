// ----------------------------------------------------------------------------
// ファイル名    : PcrCtrl.js
// 名称          : ページコンテンツ描画機能のコントロール
// 内容          : 各描画関数を順序どおり呼び出すオーケストレータ
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
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
 * 全描画パーツを順序どおり実行する
 * @param {Object} data - { siteData, concepts, relations, relationTypes, viewStats }
 * @param {Object} currentNode - 現在の記事ノード
 */
export function renderAllParts(data, currentNode) {
    const { siteData, concepts, relations, relationTypes, viewStats } = data;

    // A. パンくずリスト生成
    renderBreadcrumbs(siteData, currentNode);
    // B. 公開日・編集日生成
    renderDateInfo(currentNode);
    // C. 下層記事一覧生成
    renderChildList(siteData, currentNode, 3);
    // D. タグ一覧生成
    renderTagList(currentNode);
    // D2. 型付き概念関係生成
    renderTypedRelations(siteData, currentNode, concepts, relations, relationTypes);
    // E. 関連記事リンク生成
    renderRelatedLinks(siteData, currentNode);
    // F. 前後記事リンク生成
    renderPager(siteData, currentNode);
    // G. 人気記事
    renderPopularSection(siteData, viewStats);
    // H. カテゴリー一覧生成
    renderCategoryList(siteData);
}
