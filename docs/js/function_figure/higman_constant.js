document.addEventListener('DOMContentLoaded', function() {
    // データの定義
    const Groups_of_order_ = [0, 1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51, 1, 2, 1, 14, 1, 2, 2, 14, 1, 6, 1, 4, 2, 2, 1, 52, 2, 5, 1, 5, 1, 15, 2, 13, 2, 2, 1, 13, 1, 2, 4, 267, 1, 4, 1, 5, 1, 4, 1, 50, 1, 2, 3, 4, 1, 6, 1, 52, 15, 2, 1, 15, 1, 2, 1, 12, 1, 10, 1, 4, 2, 2, 1, 231, 1, 5, 2, 16, 1, 4, 1, 14, 2, 2, 1, 45, 1, 6, 2, 43, 1, 6, 1, 5, 4, 2, 1, 47, 2, 2, 1, 4, 5, 16, 1, 2328, 2, 4, 1, 10, 1, 2, 5, 15, 1, 4, 1, 11, 1, 2, 1, 197, 1, 2, 6, 5, 1, 13, 1, 12, 2, 4, 2, 18, 1, 2, 1, 238, 1, 55, 1, 5, 2, 2, 1, 57, 2, 4, 5, 4, 1, 4, 2, 42, 1, 2, 1, 37, 1, 4, 2, 12, 1, 6, 1, 4, 13, 4, 1, 1543, 1, 2, 2, 12, 1, 10, 1, 52, 2, 2, 2, 12, 2, 2, 2, 51, 1, 12, 1, 5, 1, 2, 1, 177, 1, 2, 2, 15, 1, 6, 1, 197, 6, 2, 1, 15, 1, 4, 2, 14, 1, 16, 1, 4, 2, 4, 1, 208, 1, 5, 67, 5, 2, 4, 1, 12, 1, 15, 1, 46, 2, 2, 1, 56092, 1, 6, 1, 15, 2, 2, 1, 39, 1, 4, 1, 4, 1, 30, 1, 54, 5, 2, 4, 10, 1, 2, 4, 40]

    // 関数の定義
    function GO(n) {
        return Groups_of_order_[n] || 0; // Ensure no undefined values are returned
    }

    function logBase(value, base) {
        return Math.log(value) / Math.log(base);
    }

    // Slider elements
    const slider1 = document.getElementById('slider-k1');
    const sliderValue1 = document.getElementById('slider-value1');
    const slider2 = document.getElementById('slider-k2');
    const sliderValue2 = document.getElementById('slider-value2');

    // Function to recalculate and redraw graphs
    function updateGraphs(k) {
        // Constant A
        const A = 2 / 27 - k;

        // X and Z definitions
        const X_1 = Array.from({length: 10}, (_, i) => Math.pow(2, i)); // 2^0 to 2^9
        const X_2 = Array.from({length: 7}, (_, i) => Math.pow(3, i));  // 3^0 to 3^6
        const X_3 = Array.from({length: 5}, (_, i) => Math.pow(5, i));  // 5^0 to 5^4

        const Z_1 = X_1.map(x => Math.pow(2, A * Math.pow(logBase(x, 2), 3)));
        const Z_2 = X_2.map(x => Math.pow(3, A * Math.pow(logBase(x, 3), 3)));
        const Z_3 = X_3.map(x => Math.pow(5, A * Math.pow(logBase(x, 5), 3)));

        // Plotly data creation
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
                name: 'z = 2^(Am^3)',
                line: {color: 'green'}
            },
            {
                x: X_2,
                y: Z_2,
                mode: 'lines+markers',
                name: 'z = 3^(Am^3)',
                line: {color: 'red'}
            },
            {
                x: X_3,
                y: Z_3,
                mode: 'lines+markers',
                name: 'z = 5^(Am^3)',
                line: {color: 'yellow'}
            }
        ];

        // レイアウト設定
        const layout = {
            title: 'Groups of Order',
            xaxis: {title: 'Order', range: [-1, 285]},
            yaxis: {title: 'Value', range: [-5, 400]},  // y-axis range
            showlegend: true,
            width: 1000,
            height: 450
        };

        // グラフの描画
        Plotly.newPlot('higman-constant', plotlyData, layout);

        // 対数スケールグラフのレイアウト
        const layoutLogarithm = {
            title: 'Groups of Order (Logarithmic Scale)',
            xaxis: {title: 'Order', range: [-1, 285]},
            yaxis: {title: 'Value', type: 'log'},  // Logarithmic y-axis
            showlegend: true,
            width: 1000,
            height: 450
        };

        // 対数スケールグラフの描画
        Plotly.newPlot('higman-constant-logarithm', plotlyData, layoutLogarithm);
    }

    // Initialize graphs
    updateGraphs(parseFloat(slider1.value));

    // Synchronize sliders and update graphs
    function synchronizeSliders(value) {
        slider1.value = value;
        slider2.value = value;
        sliderValue1.textContent = parseFloat(value).toFixed(3);
        sliderValue2.textContent = parseFloat(value).toFixed(3);
        updateGraphs(parseFloat(value));
    }

    // Add event listeners for both sliders
    slider1.addEventListener('input', function() {
        synchronizeSliders(slider1.value);
    });

    slider2.addEventListener('input', function() {
        synchronizeSliders(slider2.value);
    });
});
