document.addEventListener('DOMContentLoaded', function() {
    // 集合のデータ
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([3, 4, 5]);
    const set3 = new Set([1, 3, 5, 6]);

    // 集合間の計算関数
    function calculateRegions(set1, set2, set3 = null) {
        const result = [];

        // A - B
        const onlyA = [...set1].filter(x => !set2.has(x) && (!set3 || !set3.has(x)));
        result.push({ sets: ['A'], size: onlyA.length });

        // B - A
        const onlyB = [...set2].filter(x => !set1.has(x) && (!set3 || !set3.has(x)));
        result.push({ sets: ['B'], size: onlyB.length });

        if (set3) {
            // C - A - B
            const onlyC = [...set3].filter(x => !set1.has(x) && !set2.has(x));
            result.push({ sets: ['C'], size: onlyC.length });

            // A ∩ B ∩ C
            const intersectionABC = [...set1].filter(x => set2.has(x) && set3.has(x));
            result.push({ sets: ['A', 'B', 'C'], size: intersectionABC.length });

            // A ∩ B - C
            const intersectionAB = [...set1].filter(x => set2.has(x) && !set3.has(x));
            result.push({ sets: ['A', 'B'], size: intersectionAB.length });

            // A ∩ C - B
            const intersectionAC = [...set1].filter(x => set3.has(x) && !set2.has(x));
            result.push({ sets: ['A', 'C'], size: intersectionAC.length });

            // B ∩ C - A
            const intersectionBC = [...set2].filter(x => set3.has(x) && !set1.has(x));
            result.push({ sets: ['B', 'C'], size: intersectionBC.length });
        } else {
            // A ∩ B
            const intersectionAB = [...set1].filter(x => set2.has(x));
            result.push({ sets: ['A', 'B'], size: intersectionAB.length });
        }

        return result;
    }

    // データ準備
    const twoSetData = calculateRegions(set1, set2);
    const threeSetData = calculateRegions(set1, set2, set3);

    // ベン図を描画する関数
    function renderVennDiagram(selector, data, title) {
        const container = d3.select(selector);

        // タイトルを追加
        container.append("h2").text(title);

        // ベン図を描画
        const chart = venn.VennDiagram()
            .width(400)
            .height(400);

        const diagram = container
            .append("div")
            .datum(data)
            .call(chart);

        // 各領域に要素数を表示
        container.selectAll(".venn-area")
            .append("text")
            .attr("class", "label")
            .attr("x", d => d.center ? d.center.x : 0)
            .attr("y", d => d.center ? d.center.y : 0)
            .text(d => d.size) // 領域の要素数を表示
            .style("fill", "black")
            .style("font-size", "14px")
            .style("text-anchor", "middle");
    }

    // 2つの集合を描画
    renderVennDiagram("#venn-diagram", twoSetData, "2つの集合のベン図");

    // 3つの集合を描画
    renderVennDiagram("#venn-diagram", threeSetData, "3つの集合のベン図");
});
