document.addEventListener('DOMContentLoaded', function () {
    try {
        // File Highlight プラグインの初期化
        if (Prism.plugins.fileHighlight) {
            console.log("File Highlight plugin initialized.");
            Prism.plugins.fileHighlight.highlight();
        } else {
            console.warn("File Highlight plugin is not loaded.");
        }

        // after-highlight フック: 動的に読み込まれるコードへの対応
        Prism.hooks.add('after-highlight', function (env) {
            if (env.element.matches('pre[data-src]')) {
                console.log("Processing dynamically loaded code for match-braces.");
                const codeElement = env.element.querySelector('code');
                if (codeElement) {
                    Prism.highlightElement(codeElement);
                    Prism.hooks.run('complete', { element: codeElement });
                } else {
                    console.warn("No <code> element found for match-braces processing.");
                }
            }
        });

        // complete フック: match-braces 処理
        Prism.hooks.add('complete', function (env) {
            console.log("complete hook triggered for:", env.element);
            if (Prism.util.isActive(env.element, "match-braces", true)) {
                console.log("'match-braces' is active for:", env.element);
            } else {
                console.warn("'match-braces' is not active for:", env.element);
            }

            // デバッグ: ブラケットペアリングの状態を確認
            const braces = env.element.querySelectorAll('.brace-open, .brace-close');
            if (braces.length > 0) {
                console.log("Found brace elements:", braces);
            } else {
                console.warn("No brace elements were found. Ensure syntax and classes are correct.");
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
