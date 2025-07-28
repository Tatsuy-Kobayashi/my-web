document.addEventListener('DOMContentLoaded', function() {
    // 集合を定義
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([3, 4, 5]);

    // 2集合の場合のデータ（total size と重なりサイズ）
    const twoSetData = [
        { sets: ['Set 1'], size: set1.size },
        { sets: ['Set 2'], size: set2.size },
        { sets: ['Set 1', 'Set 2'], size: [...set1].filter(x => set2.has(x)).length } // 交差部分のサイズ
    ];

    // 各領域ごとに要素リストを計算して item.elements に格納
    twoSetData.forEach(function(item) {
        let elems;
        if (item.sets.length === 1) {
            if (item.sets[0] === 'Set 1') {
                elems = [...set1].filter(x => !set2.has(x));  // Set1 - Set2
            } else {
                elems = [...set2].filter(x => !set1.has(x));  // Set2 - Set1
            }
        } else {
            elems = [...set1].filter(x => set2.has(x));       // Set1 ∩ Set2
        }
        item.elements = elems;
        // 内部ラベルに要素数と要素名を設定
        item.label = `Count: ${elems.length}\n` + `Element: ${elems.join(',')}`;
    });

    // Venn Diagram の描画
    d3.select("#venn-diagram2").append("div").text("2つの集合のベン図");
    const chart = venn.VennDiagram().width(400).height(350);
    d3.select("#venn-diagram2").append("div").datum(twoSetData).call(chart);

    // 描画完了後に、各単一集合の円の外側にセット名を追加
    // ※図の描画が完了するまで少し待つため、setTimeout を使用
    setTimeout(function() {
        const svg2 = d3.select("#venn-diagram2").select("svg");

        // 単一集合（円）のみ対象とする
        svg2.selectAll(".venn-area.venn-circle").each(function(d) {
            // <path> 要素の getBBox() を使って位置とサイズを取得
            const bbox = d3.select(this).select("path").node().getBBox();
            const cx = bbox.x + bbox.width / 2;
            const cy = bbox.y + bbox.height / 2;
            const r = bbox.width / 2;  // 円の場合は幅＝高さ

            const offset = 10; // 円とラベルの間の隙間

            // 円の下側に配置：x 座標は中央、y 座標は中心 + 半径 + オフセット
            svg2.append("text")
                .attr("x", cx)
                .attr("y", cy + r + offset)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "hanging")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text(d.sets[0]);
        });
    }, 1000); // 1秒後に実行（描画環境によっては調整が必要）
});
