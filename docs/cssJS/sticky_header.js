$(document).ready(function() {
    const $stickyToggle = $("#stickyToggle");
    const $header = $("header");

    if ($stickyToggle.length === 0) {
        console.error("stickyToggle is not found in the DOM");
    } else {
        console.log("stickyToggle element found:", $stickyToggle);
    }

    if ($header.length === 0) {
        console.error("header is not found in the DOM");
    } else {
        console.log("header element found:", $header);
    }

    if (!$stickyToggle) {
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
