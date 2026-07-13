document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ===== 紐付けアプリ =====
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const stage = document.getElementById('pairing-stage');
    const svg = document.getElementById('pairing-svg');
    const umbrellaRow = document.getElementById('umbrella-row');
    const koalaRow = document.getElementById('koala-row');
    const umbrellaInput = document.getElementById('umbrella-count');
    const koalaInput = document.getElementById('koala-count');
    const resetBtn = document.getElementById('pairing-reset-btn');
    const pairCountSpan = document.getElementById('pair-count');

    // pairing-app が存在しなければ何もしない
    if (!stage || !svg) return;

    // 状態管理
    let pairings = [];       // { line, fromEl, toEl }
    let dragging = false;
    let dragLine = null;
    let dragFrom = null;     // 始点の .pairing-item 要素
    let pairCount = 0;

    // ---- ユーティリティ ----

    /** 要素の中心座標を stage 基準で返す */
    function centerOf(el) {
        const stageRect = stage.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        return {
            x: elRect.left + elRect.width / 2 - stageRect.left,
            y: elRect.top + elRect.height / 2 - stageRect.top
        };
    }

    /** ポインタ座標を stage 基準で返す */
    function pointerPos(e) {
        const stageRect = stage.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        return {
            x: touch.clientX - stageRect.left,
            y: touch.clientY - stageRect.top
        };
    }

    /** 要素の種類を返す: 'umbrella' | 'koala' | null */
    function itemType(el) {
        if (!el) return null;
        return el.dataset.type || null;
    }

    /** 指定座標にある .pairing-item を探す */
    function itemAtPoint(clientX, clientY) {
        const els = document.elementsFromPoint(clientX, clientY);
        for (const el of els) {
            if (el.classList && el.classList.contains('pairing-item')) return el;
        }
        return null;
    }

    /** カウンタ更新 */
    function updateCounter() {
        pairCount = pairings.length;
        pairCountSpan.textContent = pairCount;
    }

    /** 既に紐付け済みかを確認（要素が既にペアに参加していないか） */
    function isAlreadyPaired(el) {
        return pairings.some(p => p.fromEl === el || p.toEl === el);
    }

    /** ペアを削除 */
    function removePairing(pairing) {
        if (pairing.line && pairing.line.parentNode) {
            pairing.line.parentNode.removeChild(pairing.line);
        }
        if (pairing.fromEl) pairing.fromEl.classList.remove('paired');
        if (pairing.toEl) pairing.toEl.classList.remove('paired');
        pairings = pairings.filter(p => p !== pairing);
        updateCounter();
    }

    /** 要素に紐づいたペアを外す */
    function removePairingOf(el) {
        const existing = pairings.find(p => p.fromEl === el || p.toEl === el);
        if (existing) removePairing(existing);
    }

    // ---- 画像の生成 ----

    function buildItems() {
        // 既存ペアをクリア
        pairings.forEach(p => {
            if (p.line && p.line.parentNode) p.line.parentNode.removeChild(p.line);
        });
        pairings = [];
        pairCount = 0;
        pairCountSpan.textContent = '0';

        // ドラッグ中の線もクリア
        if (dragLine && dragLine.parentNode) dragLine.parentNode.removeChild(dragLine);
        dragLine = null;
        dragFrom = null;
        dragging = false;

        umbrellaRow.innerHTML = '';
        koalaRow.innerHTML = '';

        const uCount = Math.max(1, Math.min(10, parseInt(umbrellaInput.value, 10) || 6));
        const kCount = Math.max(1, Math.min(10, parseInt(koalaInput.value, 10) || 5));
        umbrellaInput.value = uCount;
        koalaInput.value = kCount;

        for (let i = 0; i < uCount; i++) {
            const div = document.createElement('div');
            div.className = 'pairing-item';
            div.dataset.type = 'umbrella';
            div.dataset.index = i;
            const img = document.createElement('img');
            img.src = 'umbrella.png';
            img.alt = 'かさ';
            img.draggable = false;
            div.appendChild(img);
            umbrellaRow.appendChild(div);
        }
        for (let i = 0; i < kCount; i++) {
            const div = document.createElement('div');
            div.className = 'pairing-item';
            div.dataset.type = 'koala';
            div.dataset.index = i;
            const img = document.createElement('img');
            img.src = 'koala.png';
            img.alt = 'コアラ';
            img.draggable = false;
            div.appendChild(img);
            koalaRow.appendChild(div);
        }
    }

    // ---- SVG 線描画 ----

    function createLine(x1, y1, x2, y2, color) {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color || '#42a5f5');
        line.setAttribute('stroke-width', '3');
        svg.appendChild(line);
        return line;
    }

    // ---- ドラッグ操作 ----

    function onDragStart(e) {
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        const target = itemAtPoint(touch.clientX, touch.clientY);
        if (!target) return;

        // 既にペアに参加している場合、そのペアを外す
        removePairingOf(target);

        dragging = true;
        dragFrom = target;
        dragFrom.classList.add('active-drag');

        const c = centerOf(dragFrom);
        const p = pointerPos(e);
        dragLine = createLine(c.x, c.y, p.x, p.y, '#90caf9');
        dragLine.setAttribute('stroke-dasharray', '6 4');
    }

    function onDragMove(e) {
        if (!dragging || !dragLine) return;
        e.preventDefault();
        const p = pointerPos(e);
        dragLine.setAttribute('x2', p.x);
        dragLine.setAttribute('y2', p.y);
    }

    function onDragEnd(e) {
        if (!dragging) return;

        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const target = itemAtPoint(touch.clientX, touch.clientY);

        // ドラッグ元のハイライト解除
        if (dragFrom) dragFrom.classList.remove('active-drag');

        // 仮線を消す
        if (dragLine && dragLine.parentNode) dragLine.parentNode.removeChild(dragLine);
        dragLine = null;

        // バリデーション
        let valid = false;
        if (target && dragFrom && target !== dragFrom) {
            const fromType = itemType(dragFrom);
            const toType = itemType(target);

            // 同種同士は無効
            if (fromType !== toType) {
                // 接続先が既にペア済みなら外す
                removePairingOf(target);

                valid = true;
            }
        }

        if (valid) {
            // 確定線を描画
            const c1 = centerOf(dragFrom);
            const c2 = centerOf(target);
            const line = createLine(c1.x, c1.y, c2.x, c2.y, '#43a047');
            line.setAttribute('stroke-width', '3.5');

            dragFrom.classList.add('paired');
            target.classList.add('paired');

            pairings.push({ line, fromEl: dragFrom, toEl: target });
            updateCounter();
        }

        dragging = false;
        dragFrom = null;
    }

    // ---- ペア線の位置を再計算（リサイズ時） ----

    function refreshLines() {
        pairings.forEach(p => {
            const c1 = centerOf(p.fromEl);
            const c2 = centerOf(p.toEl);
            p.line.setAttribute('x1', c1.x);
            p.line.setAttribute('y1', c1.y);
            p.line.setAttribute('x2', c2.x);
            p.line.setAttribute('y2', c2.y);
        });
    }

    // ---- イベント登録 ----

    // マウス
    stage.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    // タッチ
    stage.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);

    // リセット
    resetBtn.addEventListener('click', buildItems);

    // 個数変更
    umbrellaInput.addEventListener('change', buildItems);
    koalaInput.addEventListener('change', buildItems);

    // リサイズ時に線の位置を再計算
    window.addEventListener('resize', refreshLines);

    // 初期描画
    buildItems();
});
