document.addEventListener("DOMContentLoaded", function () {
    // 各言語の正規表現パターン
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

        if (patterns[language]) {
            const { keyword, string, comment, function: func } = patterns[language];

            html = html.replace(keyword, '<span class="syntax-keyword">$&</span>');
            html = html.replace(string, '<span class="syntax-string">$&</span>');
            html = html.replace(comment, '<span class="syntax-comment">$&</span>');
            html = html.replace(func, '<span class="syntax-function">$&</span>');
        }

        codeBlock.innerHTML = html;
    }

    // 適用するコードブロックを指定
    document.querySelectorAll("code.language-python, code.language-c, code.language-javascript").forEach(block => {
        const language = block.classList.contains("language-python") ? "python" :
                         block.classList.contains("language-c") ? "c" :
                         "javascript";
        applySyntaxHighlighting(block, language);
    });
});
