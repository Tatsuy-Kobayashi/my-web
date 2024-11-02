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
            { type: 'functionalName', regex: /(?<!\.)\b\w+(?=\()/g }
        ],
        javascript: [
            { type: 'string', regex: /(["'`].*?["'`])/g },
            { type: 'structure', regex: /\b(return|if|else|for|while|import|export|class)\b/g },
            { type: 'function', regex: /\b(let|const|var|function|in)\b/g },
            { type: 'functionalName', regex: /(?<!\.)\b\w+(?=\()/g },
            { type: 'comment', regex: /(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm }
        ]
    };

    function applySyntaxHighlighting($codeBlock, language) {
        // 1. 既存の <span> タグを一時的にプレースホルダに変換
        $codeBlock.find('span').each(function () {
            const $span = $(this);
            $span.replaceWith(`[data-placeholder="${$span.attr('class')}"]${$span.html()}[/data-placeholder]`);
        });

        // 2. プレーンテキストとしてハイライト処理を行う
        let html = $codeBlock.html();
        if (patterns[language]) {
            patterns[language].forEach(({ type, regex }) => {
                html = html.replace(regex, (match) => {
                    return `<span class="syntax-${type}">${match}</span>`;
                });
            });
        }

        // 3. 一時的に変換したプレースホルダを <span> タグに戻す
        html = html.replace(/\[data-placeholder="(.+?)"\](.+?)\[\/data-placeholder\]/g, '<span class="$1">$2</span>');

        // 4. 置換結果をコードブロックに適用
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
