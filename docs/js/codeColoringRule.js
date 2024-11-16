document.addEventListener('DOMContentLoaded', function () {
    try {
        // matchBraces プラグインがロードされているか確認し、必要なら仮登録
        if (!Prism.plugins.matchBraces) {
            console.warn("matchBraces plugin is not loaded. Attempting manual registration.");
            Prism.plugins.matchBraces = {
                // デバッグ用に仮登録
                register: function () {
                    console.log("Manually registered matchBraces plugin.");
                }
            };
        }

        // File Highlight プラグインの初期化
        if (Prism.plugins.fileHighlight) {
            console.log("File Highlight plugin initialized.");
            Prism.plugins.fileHighlight.highlight();
        } else {
            console.warn("File Highlight plugin is not loaded.");
        }

        // after-highlight フック: File Highlight 後に再ハイライト処理を行う
        Prism.hooks.add('after-highlight', function (env) {
            if (env.element.matches('pre[data-src]')) {
                console.log("Re-highlighting for File Highlight:", env.element);
                const codeElement = env.element.querySelector('code');
                if (codeElement) {
                    Prism.highlightElement(codeElement);
                    // match-braces 処理を強制的に再実行
                    console.log("Applying match-braces after File Highlight:", codeElement);
                    Prism.hooks.run('complete', { element: codeElement });
                } else {
                    console.warn("No <code> element found inside:", env.element);
                }
            }
        });

        // complete フック: match-braces 処理を実行
        Prism.hooks.add('complete', function (env) {
            try {
                if (env.element.parentNode.matches('pre[data-src][data-src-status="loaded"]')) {
                    console.log("Executing matchBraces for loaded data-src:", env.element);
                    if (Prism.plugins.matchBraces) {
                        console.log("matchBraces plugin is active for:", env.element);
                    } else {
                        console.warn("matchBraces plugin is not active for:", env.element);
                    }
                }
            } catch (error) {
                console.error("Error during complete hook:", error);
            }
        });

        // デバッグ用: Prism オブジェクトとプラグイン状態をログ出力
        console.log("Prism object:", Prism);
        console.log("Prism.plugins:", Prism.plugins);
        if (Prism.plugins && Prism.plugins.matchBraces) {
            console.log("matchBraces plugin is successfully loaded.");
        } else {
            console.warn("matchBraces plugin is missing or not initialized.");
        }

    } catch (error) {
        console.error("Error during Prism.js initialization:", error);
    }
});
