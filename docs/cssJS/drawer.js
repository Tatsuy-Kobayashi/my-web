document.getElementById('menu-btn').addEventListener('click', function() {
    // ハンバーガーメニューの表示・非表示を制御
    const drawerNav = document.getElementById('drawerNav');
    if (this.checked) {
        drawerNav.style.left = '0'; // 表示
    } else {
        drawerNav.style.left = '-250px'; // 隠す
    }
});
