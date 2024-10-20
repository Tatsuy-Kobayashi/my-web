$(document).ready(function() {
    /*
    const $stickyToggle = $("#stickyToggle");
    const $header = $("header");

    $stickyToggle.on('change', function() {
    */

    // Ajaxでヘッダーをロードしてからイベントリスナーを設定
    function handleStickyHeader() {
        // 画面の横幅を取得
        var windowWidth = $(window).width();
        if (windowWidth > 768) {
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
    }

    // 初回実行
    handleStickyHeader();

    // 画面サイズ変更時にもチェック
    $(window).resize(function() {
        handleStickyHeader();
    });
});
