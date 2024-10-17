$(document).ready(function() {
    const $stickyToggle = $("#stickyToggle");
    const $header = $("header");
    console.log($stickyToggle);

    if (!stickyToggle) {
        return false;
    }

    $stickyToggle.on('change', function() {
        console.log("Checkbox clicked: ", this.checked);

        if (this.checked) {
            $header.addClass('sticky');
        } else {
            $header.removeClass('sticky');
        }
    });
});
