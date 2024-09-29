document.addEventListener('DOMContentLoaded', function() {
    const linkContainers = document.querySelectorAll('.link-container');
  
    linkContainers.forEach(container => {
        const link = container.querySelector('.preview-link');
        const preview = container.querySelector('.link-preview');

        let isHoveringLink = false;
        let isHoveringPreview = false;

        // 関数：プレビューを表示する
        const showPreview = () => {
            preview.style.display = 'block';
        };

        // 関数：プレビューを非表示にする
        const hidePreview = () => {
            if (!isHoveringLink && !isHoveringPreview) {
                preview.style.display = 'none';
            }
        };

        // リンクにマウスが乗ったときの処理
        link.addEventListener('mouseover', function() {
            isHoveringLink = true;
            
            // プレビューの内容を取得
            const image = preview.querySelector('.preview-image');
            const title = preview.querySelector('.preview-title');
            const description = preview.querySelector('.preview-description');
            
            image.src = link.getAttribute('data-image');
            title.textContent = link.getAttribute('data-title');
            description.textContent = link.getAttribute('data-description');
            
            // プレビューボックスの位置を調整
            const bounding = preview.getBoundingClientRect();
            const drawerBounding = container.getBoundingClientRect();
            
            if (bounding.bottom > window.innerHeight || bounding.bottom > drawerBounding.bottom) {
                preview.style.top = '-100%'; // 上に表示
            } else {
                preview.style.top = '100%';  // 通常の位置に表示
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
    });
});
