document.addEventListener('DOMContentLoaded', function () {
    try {
        // File Highlightプラグインの実行
        if (Prism.plugins.fileHighlight) {
            console.log("File Highlight plugin initialized.");
            Prism.plugins.fileHighlight.highlight();
        } else {
            console.warn("File Highlight plugin is not loaded.");
        }

        // after-highlightフックに追加: ファイルハイライト後にコードを再ハイライト
        Prism.hooks.add('after-highlight', function (env) {
            try {
                if (env.element.matches('pre[data-src]')) {
                    console.log("Re-highlighting for File Highlight:", env.element);
                    const codeElement = env.element.querySelector('code');
                    if (codeElement) {
                        Prism.highlightElement(codeElement);
                    } else {
                        console.warn("No <code> element found inside:", env.element);
                    }
                }
            } catch (error) {
                console.error("Error during after-highlight hook:", error);
            }
        });

        // completeフックに追加: match bracesの処理を再実行
        Prism.hooks.add('complete', function (env) {
            try {
                if (env.element.parentNode.matches('pre[data-src][data-src-status="loaded"]')) {
                    console.log("Executing matchBraces for loaded data-src:", env.element);
                    if (Prism.plugins.matchBraces) {
                        Prism.plugins.matchBraces();
                    } else {
                        console.warn("matchBraces plugin is not loaded.");
                    }
                }
            } catch (error) {
                console.error("Error during complete hook:", error);
            }
        });

    } catch (error) {
        console.error("Error during Prism.js initialization:", error);
    }
});
