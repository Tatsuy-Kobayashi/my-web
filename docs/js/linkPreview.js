document.addEventListener('DOMContentLoaded', function() {
    const PROCESSED_ATTR = 'data-lp-initialized';

    // === 初期化関数 ===
    function initContainers(root = document) {
        const containers = root.querySelectorAll('.link-container:not([' + PROCESSED_ATTR + '])');
        containers.forEach(container => {
            try {
                const link = container.querySelector('.preview-link');
                const preview = container.querySelector('.link-preview');

                // 必要な要素が揃っていなければスキップして初期化済みにマーク
                if (!link || !preview) {
                    console.debug('linkPreview: skip (missing preview-link or link-preview)', container);
                    container.setAttribute(PROCESSED_ATTR, '1');
                    return;
                }

                // 二重初期化防止
                container.setAttribute(PROCESSED_ATTR, '1');

                let isHoveringLink = false;
                let isHoveringPreview = false;

                // 関数：プレビューを表示する
                const showPreview = () => {
                    // 768px 以下ならプレビューを無効化
                    if (window.innerWidth <= 768) {
                        preview.style.display = 'none'; // 表示しない
                        return; // 処理終了
                    }
                    // 768px を超える場合のみ表示
                    preview.style.display = 'block';
                };

                // 関数：プレビューを非表示にする
                const hidePreview = () => {
                    if (!isHoveringLink && !isHoveringPreview) {
                        preview.style.display = 'none';
                    }
                };

                // マウスイベント（存在チェック済みのため安全）
                link.addEventListener('mouseover', function() {
                    if (window.innerWidth <= 768) return; // 768px 以下なら処理しない
                    isHoveringLink = true;

                    // プレビューの内容を取得
                    const image = preview.querySelector('.preview-image');
                    const title = preview.querySelector('.preview-title');
                    const description = preview.querySelector('.preview-description');

                    if (image && link.getAttribute('data-image')) {
                        image.src = link.getAttribute('data-image');
                    }
                    if (title && link.getAttribute('data-title')) {
                        title.textContent = link.getAttribute('data-title');
                    }
                    if (description && link.getAttribute('data-description')) {
                        description.textContent = link.getAttribute('data-description');
                    }

                    // 表示位置の簡易調整（必要なら更に調整）
                    preview.style.top = '100%'; // 通常の位置に表示
                    const bounding = preview.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    if (bounding.bottom > window.innerHeight || bounding.bottom > containerRect.bottom) {
                        preview.style.top = '-100%'; // 上に表示
                    }

                    showPreview();
                });

                // リンクからマウスが離れたときの処理
                link.addEventListener('mouseout', function() {
                    isHoveringLink = false;
                    setTimeout(hidePreview, 100); // 少し遅延を入れる
                });

                // プレビューボックスにマウスが乗ったときの処理
                preview.addEventListener('mouseover', function() {
                    isHoveringPreview = true;
                    showPreview();
                });

                // プレビューボックスからマウスが離れたときの処理
                preview.addEventListener('mouseout', function() {
                    isHoveringPreview = false;
                    setTimeout(hidePreview, 100); // 少し遅延を入れる
                });
            } catch (err) {
                console.error('linkPreview init error', err, container);
                // 例外が起きても二度と同じ要素で止まらないようにマーク
                container.setAttribute(PROCESSED_ATTR, '1');
            }
        });
    }

    // 初期化（DOMContentLoaded 時）
    initContainers();

    // 動的に挿入されるコンテンツ（例: include.js が nav を注入）に対応するため監視
    if (window.innerWidth > 768) { // スマホでは監視を停止
        let observerTimeout = null; // 呼びすぎ防止（デバウンス）

        const mo = new MutationObserver(() => {
            // 多数のDOM変更をまとめて処理
            clearTimeout(observerTimeout);
            observerTimeout = setTimeout(() => {
                // 単純に未初期化の .link-container を探して初期化する
                initContainers();
            }, 200);
        });

        mo.observe(document.body, { childList: true, subtree: true });
    }
});
