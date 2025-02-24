document.addEventListener('DOMContentLoaded', function() {
    // 2集合の場合のデータ（total size と重なりサイズ）
    const twoSetData = [
        { sets: ['Set 1'], size: 3 },
        { sets: ['Set 2'], size: 3 },
        { sets: ['Set 1', 'Set 2'], size: 1 } // 交差部分のサイズ
    ];

    // 単集合の排他的な数を計算する関数
    function computeExclusiveCounts(data) {
        let counts = {};
        // 単一集合（全体）の数を初期化
        data.forEach(function(item) {
            if(item.sets.length === 1) {
                counts[item.sets[0]] = item.size;
            }
        });
        // 交差領域の数を各集合から引く
        data.forEach(function(item) {
            if(item.sets.length > 1) {
                item.sets.forEach(function(set) {
                    counts[set] -= item.size;
                });
            }
        });
        return counts;
    }

    // 排他的な数を取得し、各データに label プロパティを追加する
    let exclusiveCounts = computeExclusiveCounts(twoSetData);
    twoSetData.forEach(function(item) {
        if(item.sets.length === 1) {
            // 単一領域は排他的な数（例: 3 - 1 = 2）を表示
            item.label = exclusiveCounts[item.sets[0]].toString();
        } else {
            // 交差領域はそのままのサイズを表示
            item.label = item.size.toString();
        }
    });

    // Venn Diagram の描画
    d3.select("#venn-diagram0").append("div").text("2つの集合のベン図");
    const chart = venn.VennDiagram().width(400).height(350);
    d3.select("#venn-diagram0").append("div").datum(twoSetData).call(chart);

    // 描画完了後に、各単一集合の円の外側にセット名を追加
    // ※図の描画が完了するまで少し待つため、setTimeout を使用
    setTimeout(function() {
        var svg0 = d3.select("#venn-diagram0").select("svg");

        // 単一集合（円）のみ対象とする
        svg0.selectAll(".venn-area.venn-circle").each(function(d) {
            // <path> 要素の getBBox() を使って位置とサイズを取得
            var bbox = d3.select(this).select("path").node().getBBox();
            var cx = bbox.x + bbox.width / 2;
            var cy = bbox.y + bbox.height / 2;
            var r = bbox.width / 2;  // 円の場合は幅＝高さ

            var offset = 10; // 円とラベルの間の隙間

            // 円の下側に配置：x 座標は中央、y 座標は中心 + 半径 + オフセット
            svg0.append("text")
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
