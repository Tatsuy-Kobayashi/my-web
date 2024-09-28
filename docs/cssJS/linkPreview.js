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
  
      // リンクにマウスが乗った時の処理
      link.addEventListener('mouseover', function() {
        isHovering = true;
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
        showPreview(); // 再度プレビューを表示
      });
  
      // プレビューボックスからマウスが離れた時の処理
      preview.addEventListener('mouseout', function() {
        isHovering = false;
        setTimeout(hidePreview, 100); // 少し遅延を入れる
      });
    });
  });
