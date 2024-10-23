$(document).ready(function() {
    // Ajax通信
    // header.htmlを一度だけ読み込む
    $("header").load("header.html", function() {
        // ハンバーガーメニューのトグル機能
        $('#menu-btn').on('click', function() {
            console.log('ハンバーガーメニューが押されました');
            $('#nav').toggleClass('active'); // メニューを開閉
        });


    });

    // drawerNav.htmlを読み込む
    $('#nav').load('drawerNav.html', function() {
        console.log('drawerNav.htmlが読み込まれました');
    });


});

