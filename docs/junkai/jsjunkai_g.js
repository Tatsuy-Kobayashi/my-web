// ログイン制御
document.addEventListener('DOMContentLoaded', (event) => {
	// 社員コードの入力フィールド
	let employeeCodeInput = document.getElementById('loginid');
	// パスワードの入力フィールド
	let passwordInput = document.getElementById('password');
	// ログインボタン
	let loginButton = document.getElementById('btnLogin');
	// 社員コードの入力フィールドでEnterキーが押されたときのイベント
	employeeCodeInput.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			passwordInput.focus();  // パスワードの入力フィールドにフォーカスを移動
		}
	});
	// パスワードの入力フィールドでEnterキーが押されたときのイベント
	passwordInput.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			loginButton.click();  // ログインボタンをクリック
		}
	});
	loginButton.addEventListener('click', function(event) {
        // 社員コードとパスワードの入力値を取得
        let employeeCode = employeeCodeInput.value;
        let password = passwordInput.value;
        // 社員コードとパスワードの形式を検証
        let employeeCodePattern = /^[a-z0-9]+$/; // アルファベット小文字と数字のみ
        let passwordPattern = /^[a-z0-9]+$/; // アルファベット小文字と数字のみ
        // 正しい社員コードとパスワード
        let validEmployeeCodes = ['user0000', 'user1111', 'astt1', 'astt2', 'astt3'];
        let validPasswords = ['uplp0000', 'uplp1111', 'astt1', 'astt2', 'astt3'];
        if (!employeeCodePattern.test(employeeCode) || !passwordPattern.test(password)) {
            // 社員コードまたはパスワードの形式が不正な場合、エラーメッセージを表示してリダイレクトを防ぐ
            alert('社員コードとパスワードはアルファベット小文字と数字のみを使用してください。');
            event.preventDefault();
        } else if (!validEmployeeCodes.includes(employeeCode) || !validPasswords.includes(password)) {
            // 社員コードまたはパスワードが不正な場合、エラーメッセージを表示してリダイレクトを防ぐ
            alert('社員コードまたはパスワードが正しくありません。');
            event.preventDefault();
        }
    });
});
