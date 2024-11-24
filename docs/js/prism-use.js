document.addEventListener('DOMContentLoaded', () => {
    // 各テキストエリア
    const htmlEditor = document.getElementById('html-editor');
    const cssEditor = document.getElementById('css-editor');
    const jsEditor = document.getElementById('js-editor');
    let previewFrame = document.getElementById('preview');
    const consoleView = document.getElementById('console');

    // テストコード
    function attachEventHandlers(iframeDocument) {
        const target = iframeDocument.getElementById('toggle-button');
        if (target) {
            target.addEventListener('click', () => {
                console.log('クリックされました');
            });
        } else {
            console.warn('iframe 内のターゲット要素が見つかりません。');
        }
    }// テストコード

    // Reset ボタンの機能
    const resetButton = document.getElementById('reset-button');
    // Clear ボタンの機能
    const clearButton = document.getElementById('clear-button');

    resetButton.addEventListener('click', () => {
        // 確認ダイアログを表示
        const userConfirmedReset = confirm("リアルタイムプレビューをリセットしますか？");

        // 「はい」を選択した場合にリセット処理を実行
        if (userConfirmedReset) {
            // 古い iframe を削除
            const oldIframe = document.getElementById('preview');
            oldIframe.remove();

            // 新しい iframe を生成
            const newIframe = document.createElement('iframe');
            newIframe.id = 'preview';
            newIframe.sandbox = 'allow-scripts';

            // iframe の親要素に追加
            const outputWrapper = document.querySelector('.output_wrapper');
            outputWrapper.appendChild(newIframe);

            // 新しい iframe にエラーハンドラを再設定
            /*
            newIframe.onload = () => {
                console.log('iframe がリセットされ、正常に読み込まれました。');
            };

            newIframe.onerror = () => {
                console.error('リセット後の iframe の読み込み中にエラーが発生しました。');
                alert('リセット後のプレビューの表示に失敗しました。JavaScriptコードに誤りがないか確認してください。');
            };*/

            // iframe 更新用の変数を再設定
            previewFrame = newIframe;
            //console.log('リアルタイムプレビューがリセットされました。'); // コンソールにログを表示
        }
    });

    clearButton.addEventListener('click', () => {
        // 確認ダイアログを表示
        const userConfirmedClear = confirm("コンソールをクリアしますか？");

        // 「はい」を選択した場合にクリア処理を実行
        if (userConfirmedClear) {
            consoleView.innerHTML = ''; // コンソールを白紙に
            //console.log('コンソールがクリアされました。'); // コンソールにログを表示
        }
    });

    // プレビュー更新 (Blob版)
    function updatePreview() {
        const htmlContent = htmlEditor.value;
        const cssContent = `<style>${cssEditor.value}</style>`;
        const jsContent = `
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    // エラーキャッチ用
                    window.onerror = function(message, source, lineno, colno, error) {
                        window.parent.postMessage({
                            type: 'error',
                            message: \`Error: \${message} at \${source} (\${lineno}:\${colno})\`
                        }, '*');
                    };

                    // 非同期エラーキャッチ用
                    window.onunhandledrejection = function(event) {
                        window.parent.postMessage({
                            type: 'error',
                            message: \`Unhandled Rejection: \${event.reason}\`
                        }, '*');
                    };

                    (function() {
                        const originalError = console.error;
                        // 標準のconsole.errorが破壊されている場合は復元
                        if (typeof originalError !== 'function') {
                            console.error = function(...args) {
                                console.log('[Fallback Console.Error]', ...args);
                            };
                            console.log('console.errorが破壊されていたため、復元しました。');
                        }

                        // originalErrorの中身を確認
                        console.log('originalError の中身:', originalError);
                        console.log('originalError の型:', typeof originalError);

                        console.error = function(...args) {
                            try {
                                console.log('args の中身:', args);
                                console.log('args の型:', args.map(arg => typeof arg));

                                originalError.apply(console, args); // 元のconsole.errorを呼び出し
                                const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');
                                window.parent.postMessage({ type: 'error', message }, '*');
                            } catch (e) {
                                console.log('カスタムconsole.errorの処理中にエラーが発生しました:', e.message);
                            }
                        };

                        // 実行中のユーザーコード
                        try {
                            ${jsEditor.value}
                        } catch (e) {
                            console.error('Error:', e.message);
                        }

                        const originalLog = console.log;
                        console.log = function(...args) {
                            originalLog.apply(console, args);
                            window.parent.postMessage({ type: 'log', message: args.join(' ') }, '*');
                        };
                    })();
                });
            <\/script>`;

            const fullContent = `
                <!DOCTYPE html>
                <html lang="ja">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${cssContent}
                </head>
                <body>
                    ${htmlContent}
                    ${jsContent}
                </body>
                </html>
            `;

        // iframeに表示するHTMLをBlobに変換
        const blob = new Blob([fullContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        previewFrame.src = url;
    }

    // カスタムコンソールへのメッセージ受信処理
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type) {
            const logElement = document.createElement('div');
            logElement.textContent = `[${event.data.type.toUpperCase()}] ${event.data.message}`;
            logElement.style.color = event.data.type === 'error' ? 'red' : '#272822';
            consoleView.appendChild(logElement);
            consoleView.scrollTop = consoleView.scrollHeight; // 自動スクロール
        }
    });

    // iframeのエラー処理
    /*
    previewFrame.onload = () => {
        console.log('iframe が正常に読み込まれました');
    };
    previewFrame.onerror = () => {
        console.error('iframe の読み込み中にエラーが発生しました。');
        alert('プレビューの表示に失敗しました。JavaScriptコードに誤りがないか確認してください。');
    };*/

    // 初期化
    htmlEditor.addEventListener('input', updatePreview);
    cssEditor.addEventListener('input', updatePreview);
    jsEditor.addEventListener('input', updatePreview);

    // iframe内のconsole.logとconsole.errorをオーバーライド
    // (updatePreview関数内で実行されるJavaScriptコードの中で実行される)
    (function() {
        const originalError = console.error;
        // 標準のconsole.errorが破壊されている場合は復元
        if (typeof originalError !== 'function') {
            console.error = function(...args) {
                console.log('[Fallback Console.Error]', ...args);
            };
            console.log('console.errorが破壊されていたため、復元しました。');
        }
        console.error = function(...args) {
            try {
                console.log('args の中身:', args);
                console.log('args の型:', args.map(arg => typeof arg));

                originalError.apply(console, args); // 元のconsole.errorを呼び出し
                const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');
                window.parent.postMessage({ type: 'error', message }, '*');
            } catch (e) {
                console.log('カスタムconsole.errorの処理中にエラーが発生しました:', e.message);
            }
        };

        const originalLog = console.log;
        console.log = function(...args) {
            originalLog.apply(console, args);
            window.parent.postMessage({ type: 'log', message: args.join(' ') }, '*');
        };
    })();

    // 初期プレビューの呼び出し
    updatePreview();
});
