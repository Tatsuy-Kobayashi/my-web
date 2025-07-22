document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    const paymentButton = document.getElementById('paymentButton');
    const paymentModal = document.getElementById('paymentModal');
    const modalClose = document.getElementById('modalClose');
    const modalBackdrop = document.getElementById('modalBackdrop');
    // MasterCard: 2221~2720 JCB: 1800, 2131, 3088~3094, 3096~3120, 3112~3118, 3158 Diners Club: 3000~3059, 3095 Amex: 3

    // モーダルの表示制御
    paymentButton.addEventListener('click', () => {
        paymentModal.classList.add('active');
        modalBackdrop.classList.add('active');
    });

    modalClose.addEventListener('click', () => {
        paymentModal.classList.remove('active');
        modalBackdrop.classList.remove('active');
    });

    modalBackdrop.addEventListener('click', () => {
        paymentModal.classList.remove('active');
        modalBackdrop.classList.remove('active');
    });

    // フォーム送信処理
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // ページリロードを防止

        // フォームデータの収集
        const lastName = document.getElementById('lastName').value;
        const firstName = document.getElementById('firstName').value;
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;

        // バリデーション（簡易版）
        if (!lastName || !firstName || !cardNumber || !expiryDate) {
            alert("すべてのフィールドを入力してください。");
            return;
        }

        // サーバにデータを送信
        try {
            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lastName,
                    firstName,
                    cardNumber,
                    expiryDate,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("支払い情報が正常に送信されました！");
                form.reset(); // フォームをリセット
                paymentModal.classList.remove('active');
                modalBackdrop.classList.remove('active');
            } else {
                alert(`エラーが発生しました: ${result.error}`);
            }
        } catch (error) {
            alert(`リクエスト中にエラーが発生しました: ${error.message}`);
        }
    });
});
