document.addEventListener('DOMContentLoaded', function() {
    // 3集合のデータ
    const threeSetData = [
        { sets: ['Set 1'], size: 3 },
        { sets: ['Set 2'], size: 3 },
        { sets: ['Set 3'], size: 4 },
        { sets: ['Set 1', 'Set 2'], size: 1 },
        { sets: ['Set 1', 'Set 3'], size: 2 },
        { sets: ['Set 2', 'Set 3'], size: 2 },
        { sets: ['Set 1', 'Set 2', 'Set 3'], size: 1 }
    ];

    // inclusion-exclusion による排他的な数を計算する関数
    function computeExclusiveCountsMulti(data) {
        let counts = {};
        data.forEach(function(item) {
            item.sets.forEach(function(setName) {
                if (!(setName in counts)) {
                    counts[setName] = 0;
                }
                // 単一集合はそのまま、2集合はマイナス、3集合はプラス…といった具合
                if(item.sets.length === 1) {
                    counts[setName] += item.size;
                } else {
                    // (-1)^(n-1)
                    let sign = ((item.sets.length - 1) % 2 === 1) ? -1 : 1;
                    counts[setName] += sign * item.size;
                }
            });
        });
        return counts;
    }

    // 排他的な数を算出して、単一集合データの label に設定
    let exclusiveCounts = computeExclusiveCountsMulti(threeSetData);
    threeSetData.forEach(function(item) {
        if(item.sets.length === 1) {
            // 単一領域は排他的な数を表示（例: Set 1: 3 - (1+2) + 1 = 1）
            item.label = exclusiveCounts[item.sets[0]].toString();
        } else if(item.sets.length === 2) {
            // 2集合の交差領域は、与えられたサイズからその交差領域の上位（3集合）のサイズを引く
            let superset = threeSetData.find(x => x.sets.length === 3 && item.sets.every(s => x.sets.includes(s)));
            let exclusive = item.size;
            if(superset) {
                exclusive -= superset.size;
            }
            item.label = exclusive.toString();
        } else {
            // 3集合の交差領域はそのまま表示
            item.label = item.size.toString();
        }
    });

    // Venn Diagram の描画
    d3.select("#venn-diagram1").append("div").text("3つの集合のベン図");
    const chart = venn.VennDiagram().width(500).height(530);
    d3.select("#venn-diagram1").append("div").datum(threeSetData).call(chart);

    // 描画完了後に、各単一集合の円に対して外部ラベルを追加
    // Set 1, Set 2 は上側、Set 3 は下側に配置
    setTimeout(function() {
        var svg1 = d3.select("#venn-diagram1").select("svg");
        var offset = 10; // 円とラベルの間隔

        // 単一集合（円）のみ対象
        svg1.selectAll(".venn-area.venn-circle").each(function(d) {
            // <path> 要素の getBBox() で位置・サイズを取得
            var bbox = d3.select(this).select("path").node().getBBox();
            var cx = bbox.x + bbox.width / 2;
            var cy = bbox.y + bbox.height / 2;
            var r = bbox.width / 2;  // 円の場合、width==height

            // 配置位置はセットごとに決める
            var lx = cx, ly, anchor = "middle";
            if(d.sets[0] === "Set 3") {
                // Set 3 は円の下側に配置
                ly = cy + r + offset;
            } else {
                // Set 1, Set 2 は円の上側に配置
                lx = cx + 100;
                ly = cy - r - offset + 20;
            }

            svg1.append("text")
                .attr("x", lx)
                .attr("y", ly)
                .attr("text-anchor", anchor)
                // 上側なら "baseline" を "auto"（もしくは "bottom"）に、下側なら "hanging" にする
                .attr("alignment-baseline", d.sets[0] === "Set 3" ? "hanging" : "bottom")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text(d.sets[0]);
        });
    }, 1000); // 描画完了待ち（必要に応じて調整してください）
});
