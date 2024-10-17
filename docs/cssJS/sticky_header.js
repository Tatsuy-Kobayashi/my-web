$(document).ready(function() {
    // Ajaxでヘッダーをロードしてからイベントリスナーを設定
    $("header").load("header.html", function() {
        const $stickyToggle = $("#stickyToggle");
        const $header = $("header");

        if ($stickyToggle.length === 0) {
            console.error("stickyToggle is not found in the DOM");
        } else {
            console.log("stickyToggle element found:", $stickyToggle);
        }

        // チェックボックスの状態に応じてクラスを追加・削除
        $stickyToggle.on('change', function() {
            console.log("Checkbox clicked: ", this.checked);

            if (this.checked) {
                $header.addClass('sticky');
            } else {
                $header.removeClass('sticky');
            }
        });
    });
});
