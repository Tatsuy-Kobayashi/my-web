$(document).ready(function() {
    // イベントデリゲーションを使用して、動的に読み込まれた要素にクリックイベントをバインド
    $(document).on('click', '#open_nav', function() {
        $('#wrapper, #nav').toggleClass('show');
    });

    // ヘッダーとフッターを動的に読み込む
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('header').innerHTML = data;
        });

    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('footer').innerHTML = data;
        });
    
    fetch('drawerNav.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('nav').innerHTML = data;
        });
});