// ラジオボタン: クリックに応じてチェックが切り替わる仕様
document.addEventListener('DOMContentLoaded', function(){
	// 要素を取得してクリックイベントを付与
    // 'querySelectorAll'メソッドを使用して、ページ内のすべてのラジオボタンを選択する
	var radioButtons = document.querySelectorAll('input[type="radio"]');
	var nowChecked; // 現在チェックされているラジオボタンを追跡する
	for (let i = 0; i < radioButtons.length; i++) {
		radioButtons[i].addEventListener('click', function(event){
			if(this.checked && this === nowChecked) {
				this.checked = false;
				nowChecked = null;
			} else {
				nowChecked = this;
			}
		});
	}
});

// 検索機能の実装
const sets = [
    { employee_code: '240180', employee_name: '小林竜也', birth: '1999/08/30', age: '24', service_length: '0', man_or_woman: '男', address: '大阪市都島区', nearest_home: '京橋', nearest_office: 'OBP', quslification: '普通自動車運転免許', model: '', osdbdc: 'Windows', language: 'C, Python, Java', educationYear1: '2018/03', education1: '大阪' },
    { employee_code: '', employee_name: '社員名称2', birth: '生年月日2', age: '2', service_length: '2', man_or_woman: '男', address: '住所2', nearest_home: '京橋', nearest_office: 'OBP', quslification: '資格2', model: '', osdbdc: '', language: '', educationYear1: '2020/03', education1: '' },
    { employee_code: '', employee_name: '社員名称3', birth: '生年月日3', age: '3', service_length: '3', man_or_woman: '女', address: '住所3', nearest_home: '京橋', nearest_office: 'OBP', quslification: '資格3', model: '', osdbdc: '', language: '', educationYear1: '2020/03', education1: '' },
    { employee_code: '', employee_name: '社員名称4', birth: '生年月日4', age: '4', service_length: '4', man_or_woman: '女', address: '住所4', nearest_home: '京橋', nearest_office: 'OBP', quslification: '資格4', model: '', osdbdc: '', language: '', educationYear1: '2020/03', education1: '' },
    { employee_code: '', employee_name: '社員名称5', birth: '生年月日5', age: '5', service_length: '5', man_or_woman: '女', address: '住所5', nearest_home: '京橋', nearest_office: 'OBP', quslification: '資格5', model: '', osdbdc: '', language: '', educationYear1: '2020/03', education1: '' },
    { employee_code: '', employee_name: '社員名称6', birth: '生年月日6', age: '6', service_length: '6', man_or_woman: '男', address: '住所6', nearest_home: '京橋', nearest_office: 'OBP', quslification: '資格6', model: '', osdbdc: '', language: '', educationYear1: '2020/03', education1: '' }
];

// 部分一致検索
function searchFunction() {
    const inputName = document.getElementById('employee_name').value.toLowerCase();
    const inputServiceLength = document.getElementById('service_length').value;
    const inputManorwoman = document.querySelector('input[name="man_or_woman"]:checked') ? document.querySelector('input[name="man_or_woman"]:checked').value : '';
    // 以下の2行のみについているparseInt(..., 10)とは、文字列を「10」進数に変換している。これにより整数に対する範囲検索を実装できる
    const inputAgeMin = parseInt(document.getElementById('age_min').value, 10);
    const inputAgeMax = parseInt(document.getElementById('age_max').value, 10);
    const inputQualification = document.getElementById('quslification').value.toLowerCase();
    const inputNearestHome = document.getElementById('nearest_home').value.toLowerCase();
    const inputNearestOffice = document.getElementById('nearest_office').value.toLowerCase();
    const inputModel = document.getElementById('model').value.toLowerCase();
    const inputOsdbdc = document.getElementById('osdbdc').value.toLowerCase();
    const inputLanguage = document.getElementById('language').value.toLowerCase();
    const table = document.getElementById('common_table1');
    const rows = Array.from(table.rows).slice(1); // thを除く

    // 全ての入力フィールドが空白かどうかをチェック
    if (!inputName && !inputServiceLength && !inputManorwoman && isNaN(inputAgeMin) && isNaN(inputAgeMax) && !inputQualification && !inputNearestHome && !inputNearestOffice && !inputModel && !inputOsdbdc && !inputLanguage) {
        // 全ての入力フィールドが空白の場合は何もしない
        return;
    }

    // 条件に合う社員を抽出
    const matchedConditions = sets.filter(condition => {
        return (
            (inputName === '' || condition.employee_name.toLowerCase().includes(inputName)) &&
            (inputServiceLength === '' || condition.service_length.includes(inputServiceLength)) &&
            (inputManorwoman === '' || condition.man_or_woman === inputManorwoman) &&
            (isNaN(inputAgeMin) || condition.age >= inputAgeMin) &&
            (isNaN(inputAgeMax) || condition.age <= inputAgeMax) &&
            (inputQualification === '' || condition.quslification.toLowerCase().includes(inputQualification)) &&
            (inputNearestHome === '' || condition.nearest_home.toLowerCase().includes(inputNearestHome)) &&
            (inputNearestOffice === '' || condition.nearest_office.toLowerCase().includes(inputNearestOffice)) &&
            (inputModel === '' || condition.model.toLowerCase().includes(inputModel)) &&
            (inputOsdbdc === '' || condition.osdbdc.toLowerCase().includes(inputOsdbdc)) &&
            (inputLanguage === '' || condition.language.toLowerCase().includes(inputLanguage))
        );
    });

    // テーブルの行をクリア
    rows.forEach(row => {
        for (let i = 1; i < row.cells.length; i++) {
            row.cells[i].textContent = '';
        }
    });

    // 条件に合う社員をテーブルに表示
    matchedConditions.forEach((condition, i) => {
        if (i < rows.length) {
            rows[i].cells[1].textContent = condition.employee_name;
            rows[i].cells[2].textContent = condition.birth;
            rows[i].cells[3].textContent = condition.age;
            rows[i].cells[4].textContent = condition.service_length;
            rows[i].cells[5].textContent = condition.man_or_woman;
            rows[i].cells[6].textContent = condition.address;
            rows[i].cells[7].textContent = condition.nearest_home;
            rows[i].cells[8].textContent = condition.nearest_office;
            rows[i].cells[9].textContent = condition.quslification;
        }
    });
}

/*
document.addEventListener('DOMContentLoaded', function(event) {
    passwordVisibilityControl();
    loginControl();
});

// パスワードの表示・非表示制御
function passwordVisibilityControl() {
    var mouseDown = false; // この変数は、マウスボタンが押されているかどうかを追跡している
    var txtPass = document.getElementById("user_auth_password");
    var btnEye = document.getElementById("buttonEye");
    btnEye.onmousedown = function(event) {
        txtPass.type = "text"; // 入力フィールドのtype属性を"text"に再設定
        btnEye.className = "fa fa-eye-slash"; // 同様に以下再設定
        mouseDown = true;
        event.preventDefault(); // ブラウザのデフォルトのイベントアクションをキャンセル
    }
    btnEye.onmouseup = function(event) {
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
}


// ログイン制御
function loginControl() {
    // 社員コードの入力フィールド
    var employeeCodeInput = document.getElementById('user_auth_sign_in_id');
    // パスワードの入力フィールド
    var passwordInput = document.getElementById('user_auth_password');
    // ログインボタン
    var loginButton = document.getElementById('submit-btn');
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
        var employeeCode = employeeCodeInput.value;
        var password = passwordInput.value;

        // 社員コードとパスワードの形式を検証
        var employeeCodePattern = /^[a-z0-9]+$/; // アルファベット小文字と数字のみ
        var passwordPattern = /^[a-z0-9]+$/; // アルファベット小文字と数字のみ

        // 正しい社員コードとパスワード
        var validEmployeeCodes = ['user0000', 'user1111'];
        var validPasswords = ['uplp0000', 'uplp1111'];

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
}
*/