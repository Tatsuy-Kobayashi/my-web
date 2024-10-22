$(document).ready(function() {
    // header.htmlを読み込む
    $('header').load('header.html', function() {
        // ハンバーガーメニューのトグル機能
        $('#menu-btn').on('click', function() {
            $('#nav').toggleClass('active'); // メニューを開閉
        });
    });

    // drawerNav.htmlを読み込む
    $('#nav').load('drawerNav.html', function() {
        console.log('drawerNav.htmlが読み込まれました');
    });
});
