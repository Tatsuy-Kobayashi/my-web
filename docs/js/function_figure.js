document.addEventListener('DOMContentLoaded', function() {
    // データの定義
    const Groups_of_order_ = [0, 1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51, 1, 2, 1, 14, 1, 2, 2, 14, 1, 6, 1, 4, 2, 2, 1, 52, 2, 5, 1, 5, 1, 15, 2, 13, 2, 2, 1, 13, 1, 2, 4, 267, 1, 4, 1, 5, 1, 4, 1, 50, 1, 2, 3, 4, 1, 6, 1, 52, 15, 2, 1, 15, 1, 2, 1, 12, 1, 10, 1, 4, 2, 2, 1, 231, 1, 5, 2, 16, 1, 4, 1, 14, 2, 2, 1, 45, 1, 6, 2, 43, 1, 6, 1, 5, 4, 2, 1, 47, 2, 2, 1, 4, 5, 16, 1, 2328, 2, 4, 1, 10, 1, 2, 5, 15, 1, 4, 1, 11, 1, 2, 1, 197, 1, 2, 6, 5, 1, 13, 1, 12, 2, 4, 2, 18, 1, 2, 1, 238, 1, 55, 1, 5, 2, 2, 1, 57, 2, 4, 5, 4, 1, 4, 2, 42, 1, 2, 1, 37, 1, 4, 2, 12, 1, 6, 1, 4, 13, 4, 1, 1543, 1, 2, 2, 12, 1, 10, 1, 52, 2, 2, 2, 12, 2, 2, 2, 51, 1, 12, 1, 5, 1, 2, 1, 177, 1, 2, 2, 15, 1, 6, 1, 197, 6, 2, 1, 15, 1, 4, 2, 14, 1, 16, 1, 4, 2, 4, 1, 208, 1, 5, 67, 5, 2, 4, 1, 12, 1, 15, 1, 46, 2, 2, 1, 56092, 1, 6, 1, 15, 2, 2, 1, 39, 1, 4, 1, 4, 1, 30, 1, 54, 5, 2, 4, 10, 1, 2, 4, 40]

    // 関数の定義
    function GO(n) {
        return Groups_of_order_[n];
    }

    // XとZの定義
    const X_1 = Array.from({length: 9}, (_, i) => 2 ** i);
    const X_2 = Array.from({length: 6}, (_, i) => 3 ** i);
    const X_3 = Array.from({length: 4}, (_, i) => 5 ** i);
    const Z_1 = X_1.map(x => GO(x));
    const Z_2 = X_2.map(x => GO(x));
    const Z_3 = X_3.map(x => GO(x));

    // Plotlyのデータ作成
    const plotlyData = [
        {
            x: Array.from({length: Groups_of_order_.length}, (_, i) => i),
            y: Groups_of_order_,
            mode: 'lines+markers',
            name: 'Groups of Order'
        },
        {
            x: X_1,
            y: Z_1,
            mode: 'lines+markers',
            name: 'z = GO(2**m)',
            line: {color: 'green'}
        },
        {
            x: X_2,
            y: Z_2,
            mode: 'lines+markers',
            name: 'z = GO(3**m)',
            line: {color: 'red'}
        },
        {
            x: X_3,
            y: Z_3,
            mode: 'lines+markers',
            name: 'z = GO(5**m)',
            line: {color: 'yellow'}
        }
    ];

    // Plotlyのレイアウト設定
    const layout = {
        title: 'Groups of Order',
        xaxis: {title: 'Order'},
        yaxis: {title: 'Value', range: [-5, 400]},  // y軸の範囲を設定
        width: 900,
        height: 300,
        showlegend: true
    };

    // グラフの描画
    Plotly.newPlot('higman-constant', plotlyData, layout);

    // 対数スケールのグラフのレイアウト設定
    const layoutLogarithm = {
        title: 'Groups of Order (Logarithmic Scale)',
        xaxis: {title: 'Order'},
        yaxis: {title: 'Value', type: 'log'},  // y軸を対数スケールに設定
        showlegend: true,
        width: 900,  // 幅を900ピクセルに設定
        height: 300  // 高さを300ピクセルに設定
    };

    // 対数スケールのグラフの描画
    Plotly.newPlot('higman-constant-logarithm', plotlyData, layoutLogarithm);
});
