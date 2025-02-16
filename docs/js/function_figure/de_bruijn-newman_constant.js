document.addEventListener('DOMContentLoaded', function() {
    // 初期値 λ = 0.2
    let lambda = 0.2;

    // Simpson の公式による数値積分関数
    function simpsonIntegration(f, a, b, n) {
        // Simpson 公式は区間数が偶数である必要があるので調整
        if(n % 2 !== 0) { n++; }
        let h = (b - a) / n;
        let sum = f(a) + f(b);
        for (let i = 1; i < n; i++) {
            let x = a + i * h;
            sum += (i % 2 === 0) ? 2 * f(x) : 4 * f(x);
        }
        return sum * h / 3;
    }

    // H(λ, z) を返す関数
    // H(λ, z) = 8 * ∫₀¹ exp(λ * u²) * (2π² exp(9u) - 3π exp(5u)) * exp(-π exp(4u)) * cos(z*u) du
    function h(z) {
        // 積分対象の関数
        function integrand(u) {
            return Math.exp(lambda * u*u) * (2 * Math.pow(Math.PI, 2) * Math.exp(9 * u) - 3 * Math.PI * Math.exp(5 * u)) * Math.exp(- Math.PI * Math.exp(4 * u)) * Math.cos(z * u);
        }
        // [0, 1] 区間を 200 分割して Simpson の公式で数値積分
        const integral = simpsonIntegration(integrand, 0, 1, 200);
        return 8 * integral;
    }

    const slider = document.getElementById('slider-lambda');
    const sliderValue = document.getElementById('slider-value');

    // グラフの更新
    function updateGraphs() {
        const xValues = [];
        const yValues = [];
        const xStart = -5; // x の開始点
        const xEnd = 35;    // x の終了点
        const step = 0.1;   // 分割間隔

        for (let x = xStart; x <= xEnd; x += step) {
            xValues.push(x);
            yValues.push(h(x));
        }

        // グラフデータの設定
        const data = [{
            x: xValues,
            y: yValues,
            mode: 'lines',
            type: 'scatter',
            name: 'H(λ, z)',
            line: { color: 'blue', width: 2 }
        }];

        // レイアウト設定
        const layout = {
            title: 'Graph of H(λ, z) when λ = ' + lambda.toFixed(2),
            xaxis: {
                title: 'z',
                showgrid: true,
                zeroline: true
            },
            yaxis: {
                title: 'H(λ, z)',
                showgrid: true,
                zeroline: true
            }
        };

        Plotly.newPlot('de_bruijn-newman_constant', data, layout);
    }

    slider.addEventListener('input', function () {
        lambda = parseFloat(slider.value);
        sliderValue.textContent = lambda.toFixed(2);
        updateGraphs();
    });

    // 初期描画
    updateGraphs();
});
