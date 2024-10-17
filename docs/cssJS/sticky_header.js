$(document).ready(function() {
    // Ajaxでヘッダーをロードしてからイベントリスナーを設定
    $("header").load("header.html", function() {
        const $header = $("header");

        // 動的に生成された#stickyToggleにもイベントをバインド
        $(document).on('click', '#stickyToggle', function() {
            console.log("Checkbox clicked: ", $(this).prop('checked'));  // $(this).prop('checked') を使用

            if ($(this).prop('checked')) {
                $header.addClass('sticky');
            } else {
                $header.removeClass('sticky');
            }
        });
    });
});
