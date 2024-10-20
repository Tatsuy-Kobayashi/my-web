$(document).ready(function() {
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

    // 画面サイズに応じて表示/非表示を切り替え
    handleStickyHeaderVisibility();

    // sticky headerの処理は768px以上の画面でのみ実行
    if (windowWidth > 768) {
        // Ajax通信
        $("header").load("header.html", function() {
            // const $stickyToggle = $("#stickyToggle");
            const $header = $("header");

            // しかし、load()メソッドは非同期にheader.htmlをロードするため、要素のクリックイベントのバインディングがうまくいかない場合がある。
            // なので、on()メソッドを使って動的に追加された要素にも対応できるようにする。
            // 動的に生成された#stickyToggleにもイベントをバインド
            $(document).on('click', '#stickyToggle', function() {
                /*
                console.log("Checkbox clicked: ", $(this).prop('checked'));  // $(this).prop('checked') を使用
                */
                if ($(this).prop('checked')) {
                    $header.addClass('sticky_header');
                } else {
                    $header.removeClass('sticky_header');
                }
            });
        });
    }

    // 画面サイズ変更時にもチェック
    $(window).resize(function() {
        windowWidth = $(window).width();  // 最新の画面幅を取得
        handleStickyHeaderVisibility();   // 表示/非表示を再度確認
    });
});
