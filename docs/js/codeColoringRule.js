document.addEventListener("DOMContentLoaded", function () {
    const patterns = {
        python: [
            { type: 'keyword', regex: /\b(import|from|def|return|lambda|print|as|if|else|elif)\b/g },
            { type: 'string', regex: /(["'`].*?["'`])/g },
            { type: 'comment', regex: /(#.*?$)/gm },
            { type: 'function', regex: /\b\w+(?=\()/g }
        ],
        c: [
            { type: 'keyword', regex: /\b(int|float|double|char|return|if|else|switch|case|default|void)\b/g },
            { type: 'string', regex: /(".*?")/g },
            { type: 'comment', regex: /(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm },
            { type: 'function', regex: /\b\w+(?=\()/g }
        ],
        javascript: [
            { type: 'keyword', regex: /\b(let|const|var|function|return|if|else|for|while|import|export|class)\b/g },
            { type: 'string', regex: /(["'`].*?["'`])/g },
            { type: 'comment', regex: /(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm },
            { type: 'function', regex: /\b\w+(?=\()/g }
        ]
    };

    function applySyntaxHighlighting(codeBlock, language) {
        let html = codeBlock.innerHTML;

        console.log(`Processing code block with language: ${language}`);

        if (patterns[language]) {
            // 各パターンを順に処理
            patterns[language].forEach(({ type, regex }) => {
                html = html.replace(regex, (match) => {
                    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} matched: ${match}`);
                    return `<span class="syntax-${type}">${match}</span>`;
                });
            });
        } else {
            console.warn(`No patterns found for language: ${language}`);
        }

        // 結果を一度に代入して反映
        codeBlock.innerHTML = html;
    }

    document.querySelectorAll("code.language-python, code.language-c, code.language-javascript").forEach(block => {
        const language = block.classList.contains("language-python") ? "python" :
                         block.classList.contains("language-c") ? "c" :
                         "javascript";
        applySyntaxHighlighting(block, language);
    });
});
