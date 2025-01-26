document.addEventListener('DOMContentLoaded', function() {
    let m = 1; // 初期値

    // 関数の定義
    function f2(x) {
        if (x === 0) return 1; // x = 0 の場合は未定義なので null を返す
        return (Math.sin(x) / x) ** m;
    }
    function g(x) {
        return Math.abs((m * ((Math.sin(x) / x) ** m) * (x * Math.cos(x) - Math.sin(x)))/(x * Math.sin(x)));
    }
    // 漸近線の位置を計算
    function findAsymptotes(start, end) {
        const asymptotes = [];
        for (let k = Math.ceil((start - Math.PI / 2) / Math.PI); k <= Math.floor((end - Math.PI / 2) / Math.PI); k++) {
            const asymptote = k * Math.PI;
            if (asymptote > start && asymptote < end) {
                asymptotes.push(asymptote);
            }
        }
        return asymptotes;
    }

    // スライダー要素
    const slider = document.getElementById('slider-m');
    const sliderValue = document.getElementById('slider-value');

    // t cos(t) - sin(t) = 0 の数値解を探索
    function findRoots(start, end, step) {
        const roots = [];
        for (let t = start; t < end; t += step) {
            const f1 = t * Math.cos(t) - Math.sin(t);
            const f2 = (t + step) * Math.cos(t + step) - Math.sin(t + step);

            // 符号が変わる箇所に解が存在
            if (f1 * f2 < 0) {
                const root = bisect(t, t + step);
                roots.push(root);
            }
        }
        return roots;
    }

    // 二分法で根を求める
    function bisect(a, b, tol = 1e-6) {
        let mid;
        while ((b - a) > tol) {
            mid = (a + b) / 2;
            const fMid = mid * Math.cos(mid) - Math.sin(mid);
            const fA = a * Math.cos(a) - Math.sin(a);

            if (fMid === 0) return mid; // 解が見つかった
            if (fA * fMid < 0) b = mid;
            else a = mid;
        }
        return (a + b) / 2;
    }

    // グラフの更新
    function updateGraphs() {
        const xValues = [];
        const yValuesF2 = [];
        const yValuesG = [];
        const xStart = -1; // x の開始点
        const xEnd = 11;   // x の終了点
        const step = 0.1;  // 分割間隔
        const yLimit = 100;

        for (let x = xStart; x <= xEnd; x += step) {
            const yF2 = f2(x);
            const yG = g(x);

            // 発散点をスキップ
            if (Math.abs(yF2) > yLimit) {
                xValues.push(null);
                yValuesF2.push(null);
                yValuesG.push(null);
            } else {
                xValues.push(x);
                yValuesF2.push(yF2);
                yValuesG.push(yG);
            }
        }

        const asymptotes = findAsymptotes(xStart, xEnd);
        const roots = findRoots(xStart, xEnd, step);

        const data = [
            {
                x: xValues,
                y: yValuesF2,
                mode: 'lines',
                type: 'scatter',
                name: `f2(x) = (sin(x)/x)^${m}`,
                line: { color: 'blue', width: 2 }
            },
            {
                x: xValues,
                y: yValuesG,
                mode: 'lines',
                type: 'scatter',
                name: 'd/dx phi(x)',
                line: { color: 'red', width: 2 }
            }
        ];

        // 漸近線を追加 (n * π)
        asymptotes.forEach(asymptote => {
            data.push({
                x: [asymptote, asymptote],
                y: [-yLimit, yLimit],
                mode: 'lines',
                type: 'scatter',
                line: { color: 'gray', width: 2, dash: 'dot' },
                showlegend: false,
                hoverinfo: 'none',
            });
        });

        // t cos(t) - sin(t) = 0 の解の線を追加
        roots.forEach(root => {
            data.push({
                x: [root, root],
                y: [-yLimit, yLimit],
                mode: 'lines',
                type: 'scatter',
                line: { color: 'green', width: 2, dash: 'dash' },
                showlegend: false,
                hoverinfo: 'none',
            });
        });

        const layout = {
            title: 'Graph of f2(x) and g(x)',
            xaxis: { title: 'x', showgrid: true, zeroline: true },
            yaxis: { title: 'y', showgrid: true, zeroline: true, range: [-0.3, 1.1] },
            showlegend: true,
            width: 900,
            height: 450
        };

        Plotly.newPlot('du_bois-reymond_sequence2', data, layout);
    }

    slider.addEventListener('input', function () {
        m = parseInt(slider.value, 10);
        sliderValue.textContent = m;
        updateGraphs();
    });

    // 初期描画
    updateGraphs();
});
