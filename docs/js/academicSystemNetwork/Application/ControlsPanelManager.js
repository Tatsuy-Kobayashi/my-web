// ----------------------------------------------------------------------------
// ファイル名      : ControlsPanelManager.js
// モジュール記号  : CTRLPNLMNG / CtrlPnlMng
// モジュール名    : 操作パネル管理 (SW309-APP-CTRLPNLMNG) Source File
// 内容            : 操作パネルの制御ロジックを実装
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Import
// ----------------------------------------------------------------------------
import { $id } from '../Middleware/DomWriter.js';

/**
 * 名称     : パネルドラッグ初期化
 * 内容     : パネルのドラッグ機能を初期化する
 * @returns {void}
 */
export function CTRLPNLMNG_InitPanelDrag() {
    const panel = $id('controlsPanel');
    const header = $id('controlsHeader');
    if (!panel || !header) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let panelStartX = 0, panelStartY = 0;

    function onDragStart(clientX, clientY) {
        isDragging = true;
        startX = clientX;
        startY = clientY;
        const rect = panel.getBoundingClientRect();
        panelStartX = rect.left;
        panelStartY = rect.top;
        header.classList.add('dragging');
    }

    function onDragMove(clientX, clientY) {
        if (!isDragging) return;
        let newX = panelStartX + (clientX - startX);
        let newY = panelStartY + (clientY - startY);

        // ビューポート外へのクランプ
        const pw = panel.offsetWidth;
        const ph = panel.offsetHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        newX = Math.max(0, Math.min(newX, vw - pw));
        newY = Math.max(0, Math.min(newY, vh - Math.min(ph, 40)));

        panel.style.left = newX + 'px';
        panel.style.top = newY + 'px';
    }

    function onDragEnd() {
        isDragging = false;
        header.classList.remove('dragging');
    }

    // Mouse events
    header.addEventListener('mousedown', function (e) {
        // トグルボタンの場合はドラッグしない
        if (e.target.closest('.controls-toggle-btn')) return;
        e.preventDefault();
        onDragStart(e.clientX, e.clientY);
    });
    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        e.preventDefault();
        onDragMove(e.clientX, e.clientY);
    });
    document.addEventListener('mouseup', onDragEnd);

    // Touch events
    header.addEventListener('touchstart', function (e) {
        // トグルボタンの場合はドラッグしない
        if (e.target.closest('.controls-toggle-btn')) return;
        const t = e.touches[0];
        onDragStart(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        const t = e.touches[0];
        onDragMove(t.clientX, t.clientY);
    }, { passive: false });
    document.addEventListener('touchend', onDragEnd);
}

/**
 * 名称     : パネルトグル初期化
 * 内容     : パネルの開閉機能を初期化する
 * @returns {void}
 */
export function CTRLPNLMNG_InitPanelToggle() {
    const panel = $id('controlsPanel');
    const toggleBtn = $id('controlsToggleBtn');
    if (!panel || !toggleBtn) return;

    toggleBtn.addEventListener('click', function () {
        const isCollapsed = panel.classList.toggle('collapsed');
        toggleBtn.textContent = isCollapsed ? '▲' : '▼';
        toggleBtn.title = isCollapsed ? 'パネルを開く' : 'パネルを閉じる';
    });
}
