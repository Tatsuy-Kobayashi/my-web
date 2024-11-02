$(document).ready(function () {
    const patterns = {
        python: [
            { type: 'string', regex: /(["'`].*?["'`])/g },
            { type: 'structure', regex: /\b(import|from|return|for|as|if|else|elif|match|continue|while)\b/g },
            { type: 'function', regex: /\b(def|lambda|in)\b/g },
            { type: 'comment', regex: /(#.*?$)/gm },
            { type: 'functionalName', regex: /(?<!\.)\b\w+(?=\()/g }
        ],
        c: [
            { type: 'string', regex: /(".*?")/g },
            { type: 'structure', regex: /\b(return|if|else|while|switch|case|default)\b/g },
            { type: 'keyword', regex: /\b(int|float|double|char|void)\b/g },
            { type: 'comment', regex: /(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm },
            { type: 'function', regex: /\b\w+(?=\()/g }
        ],
        javascript: [
            { type: 'string', regex: /(["'`].*?["'`])/g },
            { type: 'structure', regex: /\b(return|if|else|for|while|import|export|class)\b/g },
            { type: 'function', regex: /\b(let|const|var|function|in)\b/g },
            { type: 'comment', regex: /(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm },
            { type: 'functionName', regex: /\b\w+(?=\()/g }
        ]
    };

    function applySyntaxHighlighting($codeBlock, language) {
        let html = $codeBlock.html();
        console.log(`Processing code block with language: ${language}`);

        if (patterns[language]) {
            // 各パターンを順に処理し、置換を一度に適用
            patterns[language].forEach(({ type, regex }) => {
                html = html.replace(regex, (match) => {
                    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} matched: ${match}`);
                    console.log(`<span class="syntax-${type}">${match}</span>`);
                    return `<span class="syntax-${type}">${match}</span>`;
                });
            });
        } else {
            console.warn(`No patterns found for language: ${language}`);
        }

        // 置換結果をコードブロックに適用
        $codeBlock.html(html);
    }

    // 各コードブロックに対してハイライト処理を適用
    $("code.language-python, code.language-c, code.language-javascript").each(function () {
        const $block = $(this);
        const language = $block.hasClass("language-python") ? "python" :
                         $block.hasClass("language-c") ? "c" :
                         "javascript";
        applySyntaxHighlighting($block, language);
    });
});
