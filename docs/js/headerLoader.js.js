$(document).ready(function() {
    // Ajax通信
    // header.htmlを一度だけ読み込む
    $("header").load("header.html", function() {
        console.log('header.htmlが読み込まれました');

        // ハンバーガーメニューのトグル機能
        $('#menu-btn').on('click', function() {
            console.log('ハンバーガーメニューが押されました');
            $('#nav').toggleClass('active'); // メニューを開閉
        });

        // 動的に生成された#stickyToggleにもイベントをバインド
        // sticky headerの処理
        const $header = $("header");
        $(document).on('click', '#stickyToggle', function() {
            if ($(this).prop('checked')) {
                $header.addClass('sticky_header');
            } else {
                $header.removeClass('sticky_header');
            }
        });
    });

    // drawerNav.htmlを読み込む
    $('#nav').load('drawerNav.html', function() {
        console.log('drawerNav.htmlが読み込まれました');
    });

    // 画面の横幅を取得
    var windowWidth = $(window).width();

    // stickyHeaderの生成消滅を制御
    function handleStickyHeaderVisibility() {
        if (windowWidth > 768) {
            // 768px以上の時、stickyHeaderを表示
            $(".stickyHeader").show();  // 表示
        } else {
            // 768px以下の時、stickyHeaderを非表示
            $(".stickyHeader").hide();  // 非表示
        }
    }

    // 初期表示の確認
    handleStickyHeaderVisibility();

    // 画面サイズ変更時の再確認
    $(window).resize(function() {
        windowWidth = $(window).width();  // 最新の画面幅を取得
        handleStickyHeaderVisibility();   // 表示/非表示を再度確認
    });
});

