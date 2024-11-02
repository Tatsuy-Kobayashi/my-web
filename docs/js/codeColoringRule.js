document.addEventListener("DOMContentLoaded", function () {
    const patterns = {
        python: {
            keyword: /\b(import|from|def|return|lambda|print|as|if|else|elif)\b/g,
            string: /(["'`].*?["'`])/g,
            comment: /(#.*?$)/gm,
            function: /\b\w+(?=\()/g
        },
        c: {
            keyword: /\b(int|float|double|char|return|if|else|switch|case|default|void)\b/g,
            string: /(".*?")/g,
            comment: /(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm,
            function: /\b\w+(?=\()/g
        },
        javascript: {
            keyword: /\b(let|const|var|function|return|if|else|for|while|import|export|class)\b/g,
            string: /(["'`].*?["'`])/g,
            comment: /(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm,
            function: /\b\w+(?=\()/g
        }
    };

    function applySyntaxHighlighting(codeBlock, language) {
        let html = codeBlock.innerHTML;

        console.log(`Processing code block with language: ${language}`);

        if (patterns[language]) {
            const { keyword, string, comment, function: func } = patterns[language];

            // キーワードの置換（他のパターンより先に適用）
            html = html.replace(keyword, (match) => {
                console.log(`Keyword matched: ${match}`);
                return `<span class="syntax-keyword">${match}</span>`;
            });

            // 文字列の置換
            html = html.replace(string, (match) => {
                console.log(`String matched: ${match}`);
                return `<span class="syntax-string">${match}</span>`;
            });

            // コメントの置換
            html = html.replace(comment, (match) => {
                console.log(`Comment matched: ${match}`);
                return `<span class="syntax-comment">${match}</span>`;
            });

            // 関数名の置換
            html = html.replace(func, (match) => {
                console.log(`Function matched: ${match}`);
                return `<span class="syntax-function">${match}</span>`;
            });
        } else {
            console.warn(`No patterns found for language: ${language}`);
        }

        // エスケープ解除の必要がないためそのまま適用
        codeBlock.innerHTML = html;
    }

    document.querySelectorAll("code.language-python, code.language-c, code.language-javascript").forEach(block => {
        const language = block.classList.contains("language-python") ? "python" :
                         block.classList.contains("language-c") ? "c" :
                         "javascript";
        applySyntaxHighlighting(block, language);
    });
});
