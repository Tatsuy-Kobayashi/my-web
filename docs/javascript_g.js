// パスワードの表示・非表示制御
let mouseDown = false; // この変数は、マウスボタンが押されているかどうかを追跡している
function showPassword(event) { // 'event'は、この関数がイベントハンドラとして使用されるときに、関連するイベントオブジェクトを参照する
    let txtPass = document.getElementById("user_auth_password");
    let btnEye = document.getElementById("buttonEye");
    txtPass.type = "text"; // 入力フィールドのtype属性を"text"に再設定
    btnEye.className = "fa fa-eye-slash"; // 同様に以下再設定
    mouseDown = true;
    event.preventDefault(); // ブラウザのデフォルトのイベントアクションをキャンセル
}
function hidePassword(event) {
    let txtPass = document.getElementById("user_auth_password");
    let btnEye = document.getElementById("buttonEye");
    if (!mouseDown) { // 'mouseDown'変数の値がfalseである場合に、以下のコードブロックを実行
        txtPass.type = "password";
        btnEye.className = "fa fa-eye";
    }
    event.preventDefault();
}
// 'onmousedown'イベントハンドラ
document.onmousedown = function() { // 下と対称性がないように見えるが、ブロック内に関数がないので引数'event'は必要ない
    mouseDown = true;
    // 動作は一見対称的だが、'showPassword(event)'と'hidePassword(event)'の非対称性により、'showPassword(event);'は不要となる。
    // 'showPassword(event)'関数は既に<span .... onmousedown="showPassword(event)" ....></span>のonmousedownイベントで呼び出されている
}
// 'onmouseup'イベントハンドラ
document.onmouseup = function(event) {
    mouseDown = false;
    hidePassword(event);
}

// ログイン制御
document.addEventListener('DOMContentLoaded', (event) => {
	// 社員コードの入力フィールド
	let employeeCodeInput = document.getElementById('user_auth_sign_in_id');
	// パスワードの入力フィールド
	let passwordInput = document.getElementById('user_auth_password');
	// ログインボタン
	let loginButton = document.getElementById('submit-btn');
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
        let validEmployeeCodes = ['user0000', 'user1111'];
        let validPasswords = ['uplp0000', 'uplp1111'];
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