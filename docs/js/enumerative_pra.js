document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateCircles');
    const circlesContainer = document.getElementById('circles-container');
    const box = document.getElementById('box');
    const countDisplay = document.getElementById('count');
/* DebugLog top */
    const debugLogOutput = document.getElementById('debugLogOutput');
/* DebugLog down */

    if (!generateButton || !circlesContainer || !box || !countDisplay) {
        console.error('必要な要素が見つかりません。');
        return;
    }

/* DebugLog top */
    const debugLogEntries = [];
    const debugLogLimit = 120;
    const debugLogThrottleMs = 80;
    let lastDebugLogAt = 0;

    function appendDebugLog(message, level = 'info') {
        if (!debugLogOutput) return;

        const now = Date.now();
        if (now - lastDebugLogAt < debugLogThrottleMs && debugLogEntries.length > 0) {
            return;
        }

        lastDebugLogAt = now;
        const timestamp = new Date().toTimeString().split(' ')[0];
        debugLogEntries.push({ timestamp, message, level });

        if (debugLogEntries.length > debugLogLimit) {
            debugLogEntries.splice(0, debugLogEntries.length - debugLogLimit);
        }

        debugLogOutput.innerHTML = debugLogEntries
            .map(({ timestamp, message, level }) => {
                const levelClass = level === 'warn' ? 'debug-log-entry--warn' : level === 'error' ? 'debug-log-entry--error' : '';
                return `<div class="debug-log-entry ${levelClass}">[${timestamp}] ${message}</div>`;
            })
            .join('');

        debugLogOutput.scrollTop = debugLogOutput.scrollHeight;
    }
/* DebugLog down */

    // 円の幅と高さ（固定サイズ）
    const circleSize = 50; // ピクセル単位
    const margin = 10; // 各円の間隔

    // タッチイベントの処理
    let currentTouch = null; // 現在操作している円を保存
    let offsetX = 0; // タッチ開始時のXオフセット
    let offsetY = 0; // タッチ開始時のYオフセット

    // ドロップ処理済みフラグ（dragEnd との二重処理を防止）
    let dropHandled = false;

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
        const circlesPerRow = Math.floor(boxWidth / (circleSize + margin));

        circles.forEach((circle, index) => {
            const row = Math.floor(index / circlesPerRow);
            const col = index % circlesPerRow;
            const xPos = col * (circleSize + margin);
            const yPos = row * (circleSize + margin);

            circle.style.position = 'absolute';
            circle.style.left = `${xPos}px`;
            circle.style.top = `${yPos}px`;
        });

/* DebugLog top */
        appendDebugLog(`repositionAllCirclesInBox: boxWidth=${boxWidth}px, circlesPerRow=${circlesPerRow}, count=${circles.length}`, 'info');
/* DebugLog down */
    }

    // 箱とコンテナ内の全ての円を削除する関数
    function removeAllCircles() {
        // 箱の中の円をすべて削除（<p>タグは残す）
        box.querySelectorAll('.circle').forEach(c => c.remove());

        // コンテナ内の円をすべて削除
        circlesContainer.innerHTML = '';

/* DebugLog top */
        appendDebugLog('removeAllCircles: reset circles and box state', 'info');
/* DebugLog down */

        // カウンタをリセット
        refreshCount();
    }

    // 動的に円を生成する関数
    function generateCircles() {
        const circleCount = parseInt(document.getElementById('circleCount').value, 10);

/* DebugLog top */
        appendDebugLog(`generateCircles: requested=${circleCount}`, 'info');
/* DebugLog down */

        // 既存の円を削除
        removeAllCircles();

        // 円を指定された数だけ生成
        for (let i = 1; i <= circleCount; i++) {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            circle.setAttribute('draggable', 'true');
            circle.setAttribute('id', `circle${i}`);

            // マウスイベントリスナーを追加
            circle.addEventListener('dragstart', dragStart);
            circle.addEventListener('dragend', dragEnd);

            // タッチイベントリスナーを追加
            circle.addEventListener('touchstart', touchStart);
            circle.addEventListener('touchmove', touchMove);
            circle.addEventListener('touchend', touchEnd);

            // 円をコンテナに追加
            circlesContainer.appendChild(circle);
        }
    }

    function touchStart(event) {
        currentTouch = event.target;
        event.preventDefault();

        // タッチ位置と円の位置のオフセットを取得
        const touch = event.touches[0];
        const circleRect = currentTouch.getBoundingClientRect();

        // タッチ位置と円の左上角との距離を保存
        offsetX = touch.pageX - circleRect.left;
        offsetY = touch.pageY - circleRect.top;

/* DebugLog top */
        appendDebugLog(
            `touchstart: target=${currentTouch.id || currentTouch.className} page=(${touch.pageX}, ${touch.pageY}) client=(${touch.clientX}, ${touch.clientY}) circleRect=(${Math.round(circleRect.left)}, ${Math.round(circleRect.top)}, ${Math.round(circleRect.width)}x${Math.round(circleRect.height)}) offset=(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})`,
            'info'
        );
/* DebugLog down */
    }

    function touchMove(event) {
        if (!currentTouch) return;

        const touch = event.touches[0];
        const circle = currentTouch;
/* DebugLog top */
        const nextLeft = touch.pageX - offsetX;
        const nextTop = touch.pageY - offsetY;
        const circleRect = circle.getBoundingClientRect();
        const boxRect = box.getBoundingClientRect();
/* DebugLog down */

        // 指の位置に基づいて円の位置を移動（オフセットを考慮）
        circle.style.position = 'absolute';
        circle.style.left = `${nextLeft}px`;
        circle.style.top = `${nextTop}px`;

/* DebugLog top */
        appendDebugLog(
            `touchmove: target=${circle.id || circle.className} nextPos=(${Math.round(nextLeft)}, ${Math.round(nextTop)}) page=(${touch.pageX}, ${touch.pageY}) client=(${touch.clientX}, ${touch.clientY}) circleRect=(${Math.round(circleRect.left)}, ${Math.round(circleRect.top)}) boxRect=(${Math.round(boxRect.left)}, ${Math.round(boxRect.top)}, ${Math.round(boxRect.width)}x${Math.round(boxRect.height)})`,
            'info'
        );
/* DebugLog down */
    }

    function touchEnd(event) {
        if (!currentTouch) return;

        const touch = event.changedTouches[0];
        const boxRect = box.getBoundingClientRect();
        const circle = currentTouch;
        const wasInBox = box.contains(circle);

        // 指が離れたときに円が箱の範囲内にあるか確認
        const isInsideBox =
            touch.pageX > boxRect.left && touch.pageX < boxRect.right &&
            touch.pageY > boxRect.top && touch.pageY < boxRect.bottom;

/* DebugLog top */
        appendDebugLog(
            `touchend: target=${circle.id || circle.className} wasInBox=${wasInBox} isInsideBox=${isInsideBox} endPage=(${touch.pageX}, ${touch.pageY}) endClient=(${touch.clientX}, ${touch.clientY})`,
            'info'
        );
/* DebugLog down */

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
/* DebugLog top */
                appendDebugLog(`touchend: remove circle from box because it left the box`, 'warn');
/* DebugLog down */
                console.log('箱の外に出ました:', circle);
                circle.remove();
                repositionAllCirclesInBox();
                refreshCount();
            }
            // 箱の外から外へ移動した場合は何もしない（元の位置に戻る動作はブラウザ任せ）
        }

        currentTouch = null;
    }

    // ドラッグスタートの処理
    function dragStart(event) {
        dropHandled = false; // フラグをリセット
        event.dataTransfer.setData('circleId', event.target.id);
/* DebugLog top */
        appendDebugLog(`dragstart: target=${event.target.id}`, 'info');
/* DebugLog down */
    }

    // ドラッグオーバーの処理（ドロップを許可するために必要）
    function dragOver(event) {
        event.preventDefault();
    }

    // ドロップの処理
    function drop(event) {
        event.preventDefault();

        // ドラッグされた円のIDを取得
        const circleId = event.dataTransfer.getData('circleId');
        const draggedCircle = document.getElementById(circleId);

        if (!draggedCircle) {
/* DebugLog top */
            appendDebugLog(`drop: circle not found for id=${circleId}`, 'error');
/* DebugLog down */
            console.error('円が見つかりません:', circleId);
            return;
        }

        dropHandled = true; // ドロップ処理済みフラグを立てる
/* DebugLog top */
        appendDebugLog(`drop: target=${draggedCircle.id} insideBox=${box.contains(draggedCircle)}`, 'info');
/* DebugLog down */

        if (box.contains(draggedCircle)) {
            // 既に箱に含まれている円を箱にドロップ → 再配置のみ
            repositionAllCirclesInBox();
        } else {
            // 箱の外からドロップ → 箱に追加
            box.appendChild(draggedCircle);
            draggedCircle.classList.add('circle-inside-box');
            repositionAllCirclesInBox();
            refreshCount();
        }
    }

    // ドラッグ終了時の処理
    function dragEnd(event) {
        // drop で既に処理済みなら何もしない
        if (dropHandled) {
            dropHandled = false;
            return;
        }

        const circle = event.target;
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        const boxRect = box.getBoundingClientRect();

        const isOutsideBox =
            mouseX < boxRect.left || mouseX > boxRect.right ||
            mouseY < boxRect.top || mouseY > boxRect.bottom;

        if (isOutsideBox && box.contains(circle)) {
            // ドラッグ終了位置が箱の範囲外 → 箱から削除（消失＝「食べた」）
            appendDebugLog(`dragend: remove circle from box because pointer left the box`, 'warn');
            console.log('箱の外に出ました:', circle);
            circle.remove();
            repositionAllCirclesInBox();
            refreshCount();
        }

        dropHandled = false;
    }

    generateButton.addEventListener('click', function () {
        const inputValue = document.getElementById('circleCount').value;
        const a = parseInt(inputValue, 10);

        if (!Number.isNaN(a) && a > 0 && a <= 10) {
            appendDebugLog(`button click: generate ${a} circles`, 'info');
            generateCircles();
        } else {
            appendDebugLog(`button click: invalid input=${inputValue}`, 'warn');
            alert('1から10の間で入力してください');
            document.getElementById('circleCount').value = inputValue.replace(/[^0-9]/g, '').slice(0, 2);
        }
    });

    // ドロップゾーン（箱）に対してドラッグオーバーとドロップのイベントリスナーを設定
    box.addEventListener('dragover', dragOver);
    box.addEventListener('drop', drop);

    // ページ全体でのドラッグオーバー許可（ブラウザのデフォルト動作を防止）
    document.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    // ページ全体でのドロップ時、ブラウザのデフォルト動作を防止
    document.addEventListener('drop', (event) => {
        event.preventDefault();
    });

    appendDebugLog('debug panel ready: touch and drag logs will appear here', 'info');
});
