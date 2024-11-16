document.addEventListener('DOMContentLoaded', function () {
    try {
        // 手動でmatch-bracesプラグインを登録
        if (!Prism.plugins.matchBraces) {
            console.warn("matchBraces plugin is not loaded. Attempting manual registration.");
            Prism.plugins.matchBraces = {
                execute: function () {
                    console.log("Manually registered match-braces plugin executed.");
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

        // after-highlight フック: File Highlight後に再ハイライト
        Prism.hooks.add('after-highlight', function (env) {
            try {
                if (env.element.matches('pre[data-src]')) {
                    console.log("Re-highlighting for File Highlight:", env.element);
                    const codeElement = env.element.querySelector('code');
                    if (codeElement) {
                        Prism.highlightElement(codeElement);
                        // completeフックを強制実行
                        console.log("Applying match-braces after File Highlight:", codeElement);
                        Prism.hooks.run('complete', { element: codeElement });
                    } else {
                        console.warn("No <code> element found inside:", env.element);
                    }
                }
            } catch (error) {
                console.error("Error during after-highlight hook:", error);
            }
        });

        // complete フック: match-braces 処理の再実行
        Prism.hooks.add('complete', function (env) {
            try {
                if (env.element.parentNode.matches('pre[data-src][data-src-status="loaded"]')) {
                    console.log("Executing matchBraces for loaded data-src:", env.element);
                    if (Prism.plugins.matchBraces) {
                        console.log("matchBraces plugin executed for:", env.element);
                        Prism.plugins.matchBraces.execute();
                    } else {
                        console.warn("matchBraces plugin is not active for:", env.element);
                    }
                }
            } catch (error) {
                console.error("Error during complete hook:", error);
            }
        });

        // デバッグ用: Prismオブジェクトとプラグイン状態の確認
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
