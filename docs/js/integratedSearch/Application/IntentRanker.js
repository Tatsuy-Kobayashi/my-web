export function getIntentDefinition(intentName, queryIntents) {
    if (!Array.isArray(queryIntents)) return null;
    return queryIntents.find(intent => intent && (intent.name === intentName || intent.intentId === intentName)) || null;
}

export function buildSearchDataIndexes(data) {
    const conceptBySiteId = new Map();
    const relationByConceptId = new Map();
    const keywordEdgesBySiteId = new Map();
    const rankingBySiteId = new Map();

    if (Array.isArray(data.concepts)) {
        data.concepts.forEach(concept => {
            if (concept && concept.siteRef && Number.isFinite(Number(concept.siteRef.id))) {
                conceptBySiteId.set(Number(concept.siteRef.id), concept);
            }
        });
    }

    if (Array.isArray(data.relations)) {
        data.relations.forEach(relation => {
            if (!relation) return;
            [relation.from, relation.to].forEach(conceptId => {
                if (!relationByConceptId.has(conceptId)) relationByConceptId.set(conceptId, []);
                relationByConceptId.get(conceptId).push(relation);
            });
        });
    }

    if (Array.isArray(data.keywordEdges)) {
        data.keywordEdges.forEach(edge => {
            if (!edge) return;
            [Number(edge.from), Number(edge.to)].forEach(siteId => {
                if (!Number.isFinite(siteId)) return;
                if (!keywordEdgesBySiteId.has(siteId)) keywordEdgesBySiteId.set(siteId, []);
                keywordEdgesBySiteId.get(siteId).push(edge);
            });
        });
    }

    if (data.rankingData && Array.isArray(data.rankingData.scores)) {
        data.rankingData.scores.forEach((score, index) => {
            const siteId = Number(score && score.id);
            if (!Number.isFinite(siteId)) return;
            rankingBySiteId.set(siteId, Object.assign({ __rankIndex: index }, score));
        });
    }

    return { conceptBySiteId, relationByConceptId, keywordEdgesBySiteId, rankingBySiteId };
}

export function getTextForIntentScoring(result, concept) {
    const sectionsText = Array.isArray(result.sections)
        ? result.sections.map(section => `${section.h2 || ''} ${section.text || ''}`).join(' ')
        : '';
    const conceptText = concept
        ? `${concept.description || ''} ${(concept.searchHints || []).join(' ')} ${(concept.tags || []).join(' ')} ${(concept.aliases || []).join(' ')}`
        : '';
    return `${result.label || ''} ${result.labelEn || ''} ${result.description || ''} ${sectionsText} ${conceptText}`.toLowerCase();
}

export function getRankingBoost(rankingScore, intentName) {
    if (!rankingScore) return 0;

    const intentScore = rankingScore.intentScores && Number.isFinite(Number(rankingScore.intentScores[intentName]))
        ? Number(rankingScore.intentScores[intentName])
        : 0;
    const overallScore = Number(rankingScore.overallScore) || 0;
    const contentScore = Number(rankingScore.contentScore) || 0;
    const popularity = Number(rankingScore.popularity) || 0;
    const freshnessScore = Number(rankingScore.freshnessScore) || 0;

    return intentScore * 0.9 + overallScore * 0.45 + contentScore * 0.2 + popularity * 0.15 + freshnessScore * 0.1;
}

export function applyIntentRanking(results, queryInfo = {}, data = {}) {
    const intentName = queryInfo.intent || 'definition_lookup';
    const intent = getIntentDefinition(intentName, data.queryIntents);
    const indexes = buildSearchDataIndexes(data);
    const query = String(queryInfo.original || queryInfo.query || '').toLowerCase();

    const ranked = (Array.isArray(results) ? results : []).map((result, index) => {
        const concept = indexes.conceptBySiteId.get(Number(result.id));
        const conceptRelations = concept ? (indexes.relationByConceptId.get(concept.conceptId) || []) : [];
        const keywordMatches = indexes.keywordEdgesBySiteId.get(Number(result.id)) || [];
        const rankingScore = indexes.rankingBySiteId.get(Number(result.id));
        const text = getTextForIntentScoring(result, concept);
        let score = 0;
        const reasons = [];

        if (query && text.includes(query)) {
            score += 1;
            reasons.push('文字列一致');
        }
        if (concept) {
            score += 0.5;
            reasons.push('概念データあり');
        }

        switch (intentName) {
            case 'learning_roadmap':
                score += scoreRelations(conceptRelations, ['depends_on', 'supports', 'part_of']);
                if (concept && (concept.parentConceptIds?.length || concept.childConceptIds?.length)) {
                    score += 0.5;
                    reasons.push('階層情報あり');
                }
                break;
            case 'related_concepts':
                score += scoreRelations(conceptRelations, ['adjacent_to', 'glossary_supports', 'methodologically_relevant_to']);
                if (keywordMatches.length > 0) {
                    score += Math.min(1, keywordMatches.reduce((sum, edge) => sum + Number(edge.weight || 0), 0));
                    reasons.push('共通タグ関係あり');
                }
                break;
            case 'application_or_method':
                if (/応用|利用|方法|実践|工学|技術|プログラミング|application|method|use/.test(text)) {
                    score += 1.2;
                    reasons.push('応用・方法語に一致');
                }
                score += scoreRelations(conceptRelations, ['applied_to', 'uses', 'methodologically_relevant_to']);
                break;
            case 'history_lookup':
                if (/歴史|成立|発展|背景|由来|影響|history|historical|inspired/.test(text)) {
                    score += 1.2;
                    reasons.push('歴史語に一致');
                }
                score += scoreRelations(conceptRelations, ['inspired_by', 'historically_precedes']);
                break;
            case 'dependency_search':
                score += scoreRelations(conceptRelations, ['depends_on', 'supports', 'methodologically_relevant_to']);
                break;
            case 'hierarchy_lookup':
                if (concept && (concept.parentConceptIds?.length || concept.childConceptIds?.length)) {
                    score += 1;
                    reasons.push('階層概念あり');
                }
                break;
            case 'lexicon_navigation':
                if (concept && concept.kind === 'term_collection') {
                    score += 2;
                    reasons.push('用語集');
                }
                if (/用語|索引|一覧|term|glossary|index/.test(text)) {
                    score += 1;
                    reasons.push('用語検索語に一致');
                }
                break;
            case 'definition_lookup':
            default:
                if ((concept && concept.description) || result.description) {
                    score += 1;
                    reasons.push('定義説明あり');
                }
                break;
        }

        const rankingBoost = getRankingBoost(rankingScore, intentName);
        if (rankingBoost > 0) {
            score += rankingBoost;
            reasons.push('ランキング補正');
        }

        return Object.assign({}, result, {
            __intentScore: Number(score.toFixed(4)),
            __intentName: intentName,
            __intentLabel: intent ? (intent.description || intent.name) : intentName,
            __intentReasons: reasons,
            __rankingScore: rankingScore || null,
            __rankingBoost: Number(rankingBoost.toFixed(4)),
            __originalIndex: index
        });
    });

    ranked.sort((a, b) => {
        if (b.__intentScore !== a.__intentScore) return b.__intentScore - a.__intentScore;
        const aOverall = a.__rankingScore ? Number(a.__rankingScore.overallScore || 0) : 0;
        const bOverall = b.__rankingScore ? Number(b.__rankingScore.overallScore || 0) : 0;
        if (bOverall !== aOverall) return bOverall - aOverall;
        return a.__originalIndex - b.__originalIndex;
    });

    return ranked;
}

function scoreRelations(relations, relationTypes) {
    const matched = relations.filter(relation =>
        relationTypes.includes(relation.type) || relationTypes.includes(relation.inverseType)
    );
    return matched.reduce((sum, relation) => sum + Number(relation.strength), 0);
}
