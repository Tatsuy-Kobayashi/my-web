document.addEventListener('DOMContentLoaded', function() {
    const linkContainers = document.querySelectorAll('.link-container');
  
    linkContainers.forEach(container => {
        const link = container.querySelector('.preview-link');
        const preview = container.querySelector('.link-preview');

        let isHovering = false;

        // 関数：プレビューを表示する
        const showPreview = () => {
            preview.style.display = 'block';
        };

        // 関数：プレビューを非表示にする
        const hidePreview = () => {
            if (!isHovering) {
                preview.style.display = 'none';
            }
        };

        // リンクにマウスが乗ったとき、プレビュー内容を更新し、プレビューを表示
        link.addEventListener('mouseover', function() {
            isHovering = true;

            const image = preview.querySelector('.preview-image');
            const title = preview.querySelector('.preview-title');
            const description = preview.querySelector('.preview-description');

            // data-*属性から動的にプレビュー内容を取得
            image.src = link.getAttribute('data-image');
            title.textContent = link.getAttribute('data-title');
            description.textContent = link.getAttribute('data-description');

            // Adjust preview position dynamically to ensure visibility
            const bounding = preview.getBoundingClientRect();
            if (bounding.bottom > window.innerHeight) {
                preview.style.top = '-100%'; // Adjust upwards if out of bounds
            } else {
                preview.style.top = '100%'; // Default to below the link
            }

            showPreview();
        });

        // リンクからマウスが離れた時の処理
        link.addEventListener('mouseout', function() {
            isHovering = false;
            setTimeout(hidePreview, 100); // 少し遅延を入れる
        });

        // プレビューボックスにマウスが乗った時の処理
        preview.addEventListener('mouseover', function() {
            isHovering = true;

            const image = preview.querySelector('.preview-image');
            const title = preview.querySelector('.preview-title');
            const description = preview.querySelector('.preview-description');

            // data-*属性から動的にプレビュー内容を取得
            image.src = link.getAttribute('data-image');
            title.textContent = link.getAttribute('data-title');
            description.textContent = link.getAttribute('data-description');

            showPreview(); // 再度プレビューを表示
        });
  
        // プレビューボックスからマウスが離れた時の処理
        preview.addEventListener('mouseout', function() {
            isHovering = false;
            setTimeout(hidePreview, 100); // 少し遅延を入れる
        });
    });
});
