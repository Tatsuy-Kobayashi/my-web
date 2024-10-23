$(document).ready(function() {
    // header.htmlとdrawerNav.htmlの読み込みが両方完了するまで待機する
    const loadHeader = $.Deferred();
    const loadDrawer = $.Deferred();

    // header.htmlを読み込む
    $("header").load("header.html", function() {
        console.log("header.htmlが読み込まれました");
        loadHeader.resolve(); // headerの読み込みが完了
    });

    // drawerNav.htmlを読み込む
    $('#nav').load('drawerNav.html', function() {
        console.log("drawerNav.htmlが読み込まれました");
        loadDrawer.resolve(); // drawerNavの読み込みが完了
    });

    // 両方の読み込みが完了した後に実行する
    $.when(loadHeader, loadDrawer).done(function() {
        console.log("すべての読み込みが完了しました");

        // DOMの描画が完了した後に少し遅れてイベントをバインドする
        setTimeout(function() {
            // ハンバーガーメニューのトグル機能
            $('#menu-btn').on('click', function() {
                console.log('ハンバーガーメニューが押されました');
                $('#nav').toggleClass('active'); // メニューを開閉
            });

            // sticky headerの処理
            const $header = $("header");
            $(document).on('click', '#stickyToggle', function() {
                if ($(this).prop('checked')) {
                    $header.addClass('sticky_header');
                } else {
                    $header.removeClass('sticky_header');
                }
            });

            // 画面幅に応じた表示/非表示の処理
            handleStickyHeaderVisibility();
        }, 100); // 100ms遅延してイベントをバインド
    });

    // 画面の横幅を取得
    var windowWidth = $(window).width();

    // stickyHeaderの生成消滅を制御する関数
    function handleStickyHeaderVisibility() {
        if (windowWidth > 768) {
            $(".stickyHeader").show();  // 768px以上の時は表示
        } else {
            $(".stickyHeader").hide();  // 768px以下の時は非表示
        }
    }

    // 画面サイズ変更時の再確認
    $(window).resize(function() {
        windowWidth = $(window).width();  // 最新の画面幅を取得
        handleStickyHeaderVisibility();   // 表示/非表示を再度確認
    });
});
