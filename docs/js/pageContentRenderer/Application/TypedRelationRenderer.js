// ----------------------------------------------------------------------------
// ファイル名      : TypedRelationRenderer.js
// モジュール記号  : TRLTRENDR / TRltRendr
// モジュール名    : 型付き概念関係生成
// 内容            : concepts.json と relations.json から関係パネルを描画する
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------

import { HTMLHLPR_EscapeHtml } from '../Middleware/HtmlHelper.js';
import { DOMWRITER_GetContainer, DOMWRITER_InsertAfterElement } from '../Middleware/DomWriter.js';

/**
 * 型付き概念関係をレンダリングする
 * @param {Array} allData - サイトデータ
 * @param {Object} current - 現在の記事ノード
 * @param {Array} conceptData - 概念データ
 * @param {Array} relationData - 関係データ
 * @param {Array} relationTypeData - 関係種別データ
 */
export function TRLTRENDR_RenderTypedRelations(allData, current, conceptData, relationData, relationTypeData) {
    if (!current || !Array.isArray(conceptData) || !Array.isArray(relationData)) return;

    const currentConcept = conceptData.find(concept => concept && concept.siteRef && Number(concept.siteRef.id) === Number(current.id));
    if (!currentConcept) return;

    const relationTypeMap = new Map();
    if (Array.isArray(relationTypeData)) {
        relationTypeData.forEach(typeDef => {
            if (typeDef && typeDef.type) relationTypeMap.set(typeDef.type, typeDef);
        });
    }

    const conceptById = new Map(conceptData.map(concept => [concept.conceptId, concept]));
    const siteById = new Map((Array.isArray(allData) ? allData : []).map(node => [Number(node.id), node]));
    const relatedRelations = relationData.filter(relation =>
        relation && (relation.from === currentConcept.conceptId || relation.to === currentConcept.conceptId)
    );

    const existingContainer = DOMWRITER_GetContainer('typed-relations-panel');
    const container = existingContainer || document.createElement('section');
    container.id = 'typed-relations-panel';
    container.className = 'typed-relations-panel';

    if (!existingContainer) {
        const tagContainer = DOMWRITER_GetContainer('article-page-topic');
        if (tagContainer && tagContainer.parentNode) {
            DOMWRITER_InsertAfterElement(tagContainer, container);
        } else {
            const relatedContainer = DOMWRITER_GetContainer('related-entries');
            if (relatedContainer && relatedContainer.parentNode) {
                relatedContainer.parentNode.insertBefore(container, relatedContainer);
            }
        }
    }

    if (!container) return;
    if (relatedRelations.length === 0) {
        container.innerHTML = '';
        return;
    }

    const TRltRendr_GetConceptLabel = (concept) => {
        if (!concept) return '';
        return (concept.labels && concept.labels.ja) || (concept.siteRef && concept.siteRef.label) || concept.conceptId || '';
    };

    const TRltRendr_GetConceptUrl = (concept) => {
        if (!concept || !concept.siteRef) return '';
        const siteNode = siteById.get(Number(concept.siteRef.id));
        return (siteNode && siteNode.url) || concept.siteRef.url || '';
    };

    const grouped = new Map();
    relatedRelations.forEach(relation => {
        const isOutgoing = relation.from === currentConcept.conceptId;
        const type = isOutgoing ? relation.type : (relation.inverseType || relation.type);
        if (!grouped.has(type)) grouped.set(type, []);
        grouped.get(type).push(Object.assign({}, relation, { __isOutgoing: isOutgoing, __displayType: type }));
    });

    const sortByWeight = (a, b) => Number(b.weight || b.confidence || 0) - Number(a.weight || a.confidence || 0);

    // HTML 生成
    let html = '<section class="typed-relations">';
    html += '<h2 class="typed-relations-heading">型付き関係</h2>';
    html += '<div class="typed-relations-groups">';

    Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).forEach(([type, items]) => {
        const typeDef = relationTypeMap.get(type) || {};
        const typeLabel = typeDef.label || type;
        const typeDescription = typeDef.description || '';
        html += '<section class="typed-relations-group">';
        html += `<h3 class="typed-relations-type" title="${HTMLHLPR_EscapeHtml(typeDescription)}">${HTMLHLPR_EscapeHtml(typeLabel)}</h3>`;
        html += '<ul class="typed-relations-list">';

        items.sort(sortByWeight).forEach(relation => {
            const targetConceptId = relation.__isOutgoing ? relation.to : relation.from;
            const targetConcept = conceptById.get(targetConceptId);
            const targetLabel = TypRltRendr_GetConceptLabel(targetConcept) || targetConceptId;
            const targetUrl = TypRltRendr_GetConceptUrl(targetConcept);
            const score = relation.weight != null ? relation.weight : relation.confidence;
            const scoreText = Number.isFinite(Number(score)) ? ` <span class="typed-relation-score">(${Number(score).toFixed(2)})</span>` : '';
            const noteText = relation.note ? `<span class="typed-relation-note">${HTMLHLPR_EscapeHtml(relation.note)}</span>` : '';
            const targetHtml = targetUrl
                ? `<a href="${HTMLHLPR_EscapeHtml(targetUrl)}">${HTMLHLPR_EscapeHtml(targetLabel)}</a>`
                : `<span>${HTMLHLPR_EscapeHtml(targetLabel)}</span>`;

            html += '<li class="typed-relation-item">';
            html += `<span class="typed-relation-target">${targetHtml}</span>${scoreText}`;
            html += noteText;
            html += '</li>';
        });

        html += '</ul>';
        html += '</section>';
    });

    html += '</div>';
    html += '</section>';
    container.innerHTML = html;
}
