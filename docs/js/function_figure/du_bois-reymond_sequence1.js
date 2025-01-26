document.addEventListener('DOMContentLoaded', function() {
    // 関数の定義
    function f2(x) {
        return Math.tan(x);
    }
    function g(x) {
        return x;
    }
    // 漸近線の位置を計算
    function findAsymptotes(start, end) {
        const asymptotes = [];
        for (let k = Math.ceil((start - Math.PI / 2) / Math.PI); k <= Math.floor((end - Math.PI / 2) / Math.PI); k++) {
            const asymptote = k * Math.PI + Math.PI / 2;
            if (asymptote > start && asymptote < end) {
                asymptotes.push(asymptote);
            }
        }
        return asymptotes;
    }

    // x 値の生成
    const xValues = [];
    const yValuesF2 = [];
    const yValuesG = [];
    const xStart = -1; // x の開始点
    const xEnd = 21;    // x の終了点
    const step = 0.001;   // 分割間隔
    const yLimit = 100;

    for (let x = xStart; x <= xEnd; x += step) {
        const yF2 = f2(x);
        const yG = g(x);

        // 発散点をスキップ
        if (Math.abs(yF2) > yLimit) {
            xValues.push(null); // 発散点では線を切るため null を挿入
            yValuesF2.push(null);
            yValuesG.push(null);
        } else {
            xValues.push(x);
            yValuesF2.push(yF2);
            yValuesG.push(yG);
        }
    }

    // 漸近線の位置を計算
    const asymptotes = findAsymptotes(xStart, xEnd);

    // グラフデータの設定
    const data = [
        {
            x: xValues,
            y: yValuesF2,
            mode: 'lines',
            type: 'scatter',
            name: 'f2(x) = tan(x)',
            line: { color: 'blue', width: 2 }
        },
        {
            x: xValues,
            y: yValuesG,
            mode: 'lines',
            type: 'scatter',
            name: 'g(x) = x',
            line: { color: 'red', width: 2 }
        }
    ];

    // 漸近線を追加
    asymptotes.forEach(asymptote => {
        data.push({
            x: [asymptote, asymptote],
            y: [-26, 36], // 表示範囲に合わせる
            mode: 'lines',
            type: 'scatter',
            line: { color: 'gray', width: 2, dash: 'dot' },
            showlegend: false, // 凡例から非表示
            hoverinfo: 'none', // ホバー時の情報を非表示
        });
    });

    // レイアウト設定
    const layout = {
        title: 'Graph of y = tan(x) and y = x',
        xaxis: {title: 'x', showgrid: true, zeroline: true},
        yaxis: {title: 'y', showgrid: true, zeroline: true, range: [-6, 26]},
        showlegend: true,
        width: 900,
        height: 450
    };

    // グラフの描画
    Plotly.newPlot('du_bois-reymond_sequence1', data, layout);
});
