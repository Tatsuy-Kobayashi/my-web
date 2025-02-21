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
            // 単一領域は排他的な数を表示
            item.label = exclusiveCounts[item.sets[0]].toString();
        } else {
            // 交差領域はそのままのサイズを表示
            item.label = item.size.toString();
        }
    });

    // Venn Diagram の描画
    d3.select("#venn-diagram").append("div").text("Two-Set Venn Diagram with Counts");
    const chart = venn.VennDiagram().width(400).height(400);
    d3.select("#venn-diagram").append("div").datum(twoSetData).call(chart);
});
