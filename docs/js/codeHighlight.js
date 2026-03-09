/**
 * codeHighlight.js
 * ソースコードフィールド（15行以上のもの）に「全文表示/スクロール表示」切替用のボタンを追加し、その挙動を制御する。
 */
document.addEventListener("DOMContentLoaded", () => {
    // Prism.js等の描画後を考慮し、少し遅延を入れて高さを判定する
    setTimeout(() => {
        const wrappers = document.querySelectorAll('.coding_file_wrapper');

        wrappers.forEach(wrapper => {
            const codeMain = wrapper.querySelector('.code-main');
            if (!codeMain) return;

            // 要素内のコンテンツが枠（最大高さ15行）を超えているか判定
            if (codeMain.scrollHeight > codeMain.clientHeight) {
                const title = wrapper.querySelector('.fileTitle');
                if (title) {
                    // 切替ボタン生成
                    const btn = document.createElement('span');
                    btn.classList.add('toggle-code-btn');
                    btn.textContent = '■';
                    btn.title = '全文表示 / スクロール表示 切替';

                    title.appendChild(btn);

                    // クリックイベントの登録
                    btn.addEventListener('click', () => {
                        wrapper.classList.toggle('is-expanded');
                    });
                }
            }
        });
    }, 300); // UIレイアウトの計算が終わるのを待つため300ms遅延
});
