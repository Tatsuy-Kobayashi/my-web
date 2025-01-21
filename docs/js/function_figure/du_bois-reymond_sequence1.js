document.addEventListener('DOMContentLoaded', function() {
    // 関数の定義
    function f2(x) {
        return Math.tan(x);
    }
    function g(x) {
        return x;
    }

    // x 値の生成
    const xValues = [];
    const yValuesF2 = [];
    const yValuesG = [];
    const xStart = -10; // x の開始点
    const xEnd = 10;    // x の終了点
    const step = 0.001;   // 分割間隔

    for (let x = xStart; x <= xEnd; x += step) {
        xValues.push(x);
        yValuesF2.push(f2(x));
        yValuesG.push(g(x));
    }

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

    // レイアウト設定
    const layout = {
        title: 'Graph of f2(x) = tan(x) and g(x) = x',
        xaxis: {title: 'x', showgrid: true, zeroline: true},
        yaxis: {title: 'y', showgrid: true, zeroline: true, range: [-16, 16]},
        showlegend: true,
        width: 800,
        height: 450
    };

    // グラフの描画
    Plotly.newPlot('du_bois-reymond_sequence1', data, layout);
});
