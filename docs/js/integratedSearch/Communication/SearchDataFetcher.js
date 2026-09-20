import { loadDataSet } from '../../common/siteHierarchy/HierarchyLoader.mjs';

function getDefaultViewStats() {
    return [
        {
            id: 3011,
            label: '集合論',
            url: 'https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/set_theory.html',
            totalViews: 90210,
            weeklyViews: 420,
            monthlyViews: 1800
        },
        {
            id: 304022,
            label: '特殊関数',
            url: 'https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_functions/special_functions/special_functions.html',
            totalViews: 80123,
            weeklyViews: 380,
            monthlyViews: 1600
        }
    ];
}

export async function fetchAllSearchData() {
    const data = await loadDataSet(['siteData','siteHierarchy','searchSource','concepts','relations','queryIntents','keywordEdges','ranking']);
    return { siteData:data.nodes, searchSource:data.searchSource, concepts:data.concepts, relations:data.relations,
        queryIntents:data.queryIntents, keywordEdges:data.keywordEdges, rankingData:data.ranking, viewStats:getDefaultViewStats() };
}
