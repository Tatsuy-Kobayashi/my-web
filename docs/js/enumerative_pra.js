document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateCircles');
    const circlesContainer = document.getElementById('circles-container');
    const box = document.getElementById('box');
    const countDisplay = document.getElementById('count');

    if (!generateButton || !circlesContainer || !box || !countDisplay) {
        console.error('必要な要素が見つかりません。');
        return;
    }

    // 円の幅と高さ（固定サイズ）
    const circleSize = 50; // ピクセル単位
    const margin = 10;      // 各円の間隔

    // 現在ドラッグ中の状態
    let activeCircle = null;   // 操作中の円
    let offsetX = 0; // タッチ開始時のXオフセット
    let offsetY = 0; // タッチ開始時のYオフセット

    // 箱の中の円の数を数える関数
    function getBoxCircleCount() {
        return box.querySelectorAll('.circle').length;
    }

    // カウンタ表示を更新する関数
    function refreshCount() {
        countDisplay.innerText = getBoxCircleCount();
    }

    // 箱の中の全円をグリッド配置し直す関数
    function repositionAllCirclesInBox() {
        const circles = box.querySelectorAll('.circle');
        const boxWidth = box.clientWidth;
        const circlesPerRow = Math.max(1, Math.floor(boxWidth / (circleSize + margin)));

        circles.forEach((circle, index) => {
            const row = Math.floor(index / circlesPerRow);
            const col = index % circlesPerRow;
            const xPos = col * (circleSize + margin);
            const yPos = row * (circleSize + margin);

            circle.style.position = 'absolute';
            circle.style.left = `${xPos}px`;
            circle.style.top = `${yPos}px`;
            // ドラッグ用に上げていた z-index / transition を戻す
            circle.style.zIndex = '';
            circle.style.transition = '';
        });
    }

    // 箱とコンテナ内の全ての円を削除する関数
    function removeAllCircles() {
        // 箱の中の円をすべて削除（<p>タグは残す）
        box.querySelectorAll('.circle').forEach(c => c.remove());

        // コンテナ内の円をすべて削除
        circlesContainer.innerHTML = '';

        // カウンタをリセット
        refreshCount();
    }

    // 動的に円を生成する関数
    function generateCircles() {
        const circleCount = parseInt(document.getElementById('circleCount').value, 10);

        // 既存の円を削除
        removeAllCircles();

        // 円を指定された数だけ生成
        for (let i = 1; i <= circleCount; i++) {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            circle.setAttribute('id', `circle${i}`);

            // Pointer Events でマウス・タッチを統一処理
            circle.addEventListener('pointerdown', pointerDown);

            // 円をコンテナに追加
            circlesContainer.appendChild(circle);
        }
    }

    // ------- Pointer（マウス・タッチ共通）処理 -------
    function pointerDown(event) {
        // 主ボタン（左クリック）または指のみ
        if (event.button !== undefined && event.button !== 0) return;

        event.preventDefault();
        activeCircle = event.currentTarget;

        const circleRect = activeCircle.getBoundingClientRect();
        offsetX = event.clientX - circleRect.left;
        offsetY = event.clientY - circleRect.top;

        // ドラッグ中は最前面に、追従を滑らかに見せるため transition は無効化
        activeCircle.style.zIndex = '1000';
        activeCircle.style.transition = 'none';

        // このポインタのイベントを円で受け取り続ける（指が要素外に出ても追従）
        activeCircle.setPointerCapture(event.pointerId);

        // move / up は円自身にキャプチャされているので円に登録すればよい
        activeCircle.addEventListener('pointermove', pointerMove);
        activeCircle.addEventListener('pointerup', pointerUp);
        activeCircle.addEventListener('pointercancel', pointerUp);
    }

    function pointerMove(event) {
        if (!activeCircle) return;

        const circle = activeCircle;

        const newViewportLeft = event.clientX - offsetX;
        const newViewportTop = event.clientY - offsetY;

        // 要素を絶対配置に変更（これにより offsetParent が確定する）
        if (circle.style.position !== 'absolute') {
            circle.style.position = 'absolute';
        }

        // offsetParent（位置基準となる親要素）を取得
        const parent = circle.offsetParent || document.documentElement;
        const parentRect = parent.getBoundingClientRect();
        const parentStyle = window.getComputedStyle(parent);
        const borderLeft = parseFloat(parentStyle.borderLeftWidth) || 0;
        const borderTop = parseFloat(parentStyle.borderTopWidth) || 0;

        // bodyやhtmlが親の場合はスクロール量を相殺（parentRectに既に反映されているため）
        const isBodyOrHtml = (parent === document.body || parent === document.documentElement);
        const scrollLeft = isBodyOrHtml ? 0 : parent.scrollLeft;
        const scrollTop = isBodyOrHtml ? 0 : parent.scrollTop;

        // offsetParent のローカル座標系に変換
        const nextLeft = newViewportLeft - parentRect.left - borderLeft + scrollLeft;
        const nextTop = newViewportTop - parentRect.top - borderTop + scrollTop;

        // 指の位置に基づいて円の位置を移動
        circle.style.left = `${nextLeft}px`;
        circle.style.top = `${nextTop}px`;
    }

    function pointerUp(event) {
        if (!activeCircle) return;

        const circle = activeCircle;

        // イベント解除
        circle.removeEventListener('pointermove', pointerMove);
        circle.removeEventListener('pointerup', pointerUp);
        circle.removeEventListener('pointercancel', pointerUp);
        if (circle.hasPointerCapture && circle.hasPointerCapture(event.pointerId)) {
            circle.releasePointerCapture(event.pointerId);
        }

        // ★ 判定は全て clientX/clientY（ビューポート座標）で統一 → スクロールずれ解消
        const boxRect = box.getBoundingClientRect();
        const wasInBox = box.contains(circle);

        // 指が離れたときに円が箱の範囲内にあるか確認（client座標系で統一）
        const isInsideBox =
            event.clientX > boxRect.left && event.clientX < boxRect.right &&
            event.clientY > boxRect.top && event.clientY < boxRect.bottom;

        if (isInsideBox) {
            if (!wasInBox) {
                // 箱の外から中へ → 箱に追加
                box.appendChild(circle);
                circle.classList.add('circle-inside-box');
                repositionAllCirclesInBox();
                refreshCount();
            } else {
                // 箱の中で移動しただけ → 再配置のみ
                repositionAllCirclesInBox();
            }
        } else {
            if (wasInBox) {
                // 箱の中から外へ → 箱から削除（消失＝「食べた」）
                console.log('箱の外に出ました:', circle);
                circle.remove();
                repositionAllCirclesInBox();
                refreshCount();
            } else {
                // 箱の外→外：見た目のクリーンアップだけ
                circle.style.zIndex = '';
                circle.style.transition = '';
            }
            // 箱の外から外へ移動した場合は何もしない（元の位置に戻る動作はブラウザ任せ）
        }

        activeCircle = null;
    }

    generateButton.addEventListener('click', function () {
        const inputValue = document.getElementById('circleCount').value;
        const a = parseInt(inputValue, 10);

        if (!Number.isNaN(a) && a > 0 && a <= 10) {
            generateCircles();
        } else {
            alert('1から10の間で入力してください');
            document.getElementById('circleCount').value = inputValue.replace(/[^0-9]/g, '').slice(0, 2);
        }
    });
});