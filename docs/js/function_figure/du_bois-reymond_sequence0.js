document.addEventListener('DOMContentLoaded', function() {
    // 関数の定義
    function f1(x) {
        if (x === 0) return null; // x = 0 の場合は未定義なので null を返す
        return (x * Math.cos(x) - Math.sin(x))/(x^2);
    }

    // x 値の生成
    const xValues = [];
    const yValues = [];
    const xStart = -1; // x の開始点
    const xEnd = 10;    // x の終了点
    const step = 0.01;   // 分割間隔

    for (let x = xStart; x <= xEnd; x += step) {
        if (x === 0) continue; // x = 0 をスキップ
        xValues.push(x);
        yValues.push(f1(x));
    }

    const data = [
        // グラフデータの設定
        {
            x: xValues,
            y: yValues,
            mode: 'lines',
            type: 'scatter',
            name: 'f1(x)',
            line: { color: 'blue', width: 2 }
        }
    ];

    // レイアウト設定
    const layout = {
        title: 'Plot of f1(x)',
        xaxis: {title: 'x', showgrid: true, zeroline: true},
        yaxis: {title: 'f1(x)', showgrid: true, zeroline: true},
        showlegend: true,
        width: 600,
        height: 450
    };

    // グラフの描画
    Plotly.newPlot('du_bois-reymond_sequence0', data, layout);
});
