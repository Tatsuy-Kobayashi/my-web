$(document).ready(function() {
    // header.html と drawerNav.html の読み込み完了を待つための Deferred オブジェクト
    const loadHeader = $.Deferred();
    const loadDrawer = $.Deferred();

    // header, footer, drawerNav を動的に読み込む
    $("header").load("https://tatsuy-kobayashi.github.io/my-web/docs/header.html", function(response, status, xhr) {
        if (status === "error") {
            console.error("header の読み込みに失敗:", xhr.statusText);
        }
        loadHeader.resolve();
    });

    $("footer").load("https://tatsuy-kobayashi.github.io/my-web/docs/footer.html", function(response, status, xhr) {
        if (status === "error") {
            console.error("footer の読み込みに失敗:", xhr.statusText);
        }
    });

    $("#nav").load("https://tatsuy-kobayashi.github.io/my-web/docs/drawerNav.html", function(response, status, xhr) {
        if (status === "error") {
            console.error("drawerNav の読み込みに失敗:", xhr.statusText);
        }
        loadDrawer.resolve();
    });

    // イベントデリゲーションを使用して、動的に読み込まれた要素にクリックイベントをバインド
    // ドキュメント全体で open_nav ボタンに対するクリックイベント（常に有効）
    $(document).on('click', '#open_nav', function() {
        $('#wrapper, #nav').toggleClass('show');
    });

    // header と drawerNav の読み込み完了後に各種イベントをバインド
    $.when(loadHeader, loadDrawer).done(function() {
        // 少し遅延して DOM の描画が完了してからバインド
        setTimeout(function() {
            // ハンバーガーメニューのトグル処理
            $('#header-menu-btn').on('click', function() {
                $('.navicon').toggleClass('menu-trigger-open'); // 新しいクラスを適用
                $('.lines').toggleClass('menu-trigger-close');
                $('#nav').toggleClass('active'); // メニューを開閉
                $('#nav_container').toggleClass('active'); // メニューを開閉
            });

            // drawerNav のメニュー開閉処理
            $('#drawer-menu-btn').on('click', function() {
                $('.lines').toggleClass('menu-trigger-close'); // 新しいクラスを適用
                $('.navicon').toggleClass('menu-trigger-open');
                $('#nav').toggleClass('active'); // メニューを開閉
                $('#nav_container').toggleClass('active'); // メニューを開閉
            });

            // sticky header の切り替え処理
            const $header = $("header");
            $(document).on('click', '#stickyToggle', function() {
                if ($(this).prop('checked')) {
                    $header.addClass('sticky_header');
                } else {
                    $header.removeClass('sticky_header');
                }
            });

            // 画面幅に応じた stickyHeader の表示/非表示処理
            handleStickyHeaderVisibility();
        }, 100); // 100ms遅延してイベントをバインド
    });

    // 画面幅に応じた stickyHeader の表示/非表示を制御する関数
    var windowWidth = $(window).width();

    // stickyHeaderの生成消滅を制御する関数
    function handleStickyHeaderVisibility() {
        if (windowWidth > 768) {
            $(".stickyHeader").show();  // 768px以上の時は表示
        } else {
            $(".stickyHeader").hide();  // 768px以下の時は非表示
        }
    }

    // 画面サイズ変更時に再確認
    $(window).resize(function() {
        windowWidth = $(window).width();  // 最新の画面幅を取得
        handleStickyHeaderVisibility();   // 表示/非表示を再度確認
    });
});
