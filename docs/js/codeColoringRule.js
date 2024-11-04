$(document).ready(function () {
    const patterns = {
        python: [
            { type: 'number', regex: /(?<=\s|[(),+\-*/])(\d+(\.\d+)?|\.\d+)(?=\s|[<(),+\-*/])/g },
            { type: 'string', regex: /(["'`].*?["'`])/g },
            { type: 'structure', regex: /\b(import|from|return|for|as|if|else|elif|match|continue|while)\b/g },
            /* キャスト特化 */
            { type: 'type', regex: /\b(int|float|complex|bool|str|NoneType|list|tuple|set|dict|sympify|mpf)\(/g },
            { type: 'function', regex: /\b(def|lambda|in)\b/g },
            { type: 'comment', regex: /(#.*?$)/gm },
            { type: 'functionalName', regex: /(?<!\.)\b\w+(?=\()/g }
        ],
        c: [
            { type: 'number', regex: /(?<=\s|[(),+\-*/])(\d+(\.\d+)?|\.\d+)(?=\s|[<(),+\-*/])/g },
            { type: 'string', regex: /(".*?")/g },
            { type: 'structure', regex: /\b(return|if|else|while|switch|case|default)\b/g },
            { type: 'type', regex: /\b(int|float|double|char|void)\b/g },
            { type: 'comment', regex: /(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm },
            { type: 'functionalName', regex: /(?<!\.)\b\w+(?=\()/g }
        ],
        javascript: [
            { type: 'number', regex: /(?<=\s|[(),+\-*/])(\d+(\.\d+)?|\.\d+)(?=\s|[<(),+\-*/])/g },
            { type: 'string', regex: /(["'`].*?["'`])/g },
            { type: 'structure', regex: /\b(return|if|else|for|while|import|export|class)\b/g },
            { type: 'type', regex: /\b(let|const|var)\b/g },
            { type: 'function', regex: /\b(function|in)\b/g },
            { type: 'functionalName', regex: /(?<!\.)\b\w+(?=\()/g },
            { type: 'comment', regex: /(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm }
        ]
    };

    function applySyntaxHighlighting($codeBlock, language) {
        console.log("=== Starting syntax highlighting ===");

        // Step 1: すべての text-field- プレフィックスを持つ <span> タグをプレースホルダに変換
        const placeholders = {};
        let placeholderIndex = 0;

        $codeBlock.find('span').each(function () {
            const $span = $(this);
            const className = $span.attr('class');

            // "text-field-" で始まるクラスを持つタグをプレースホルダに
            if (className && className.startsWith('text-field-')) {
                const content = $span.html();
                const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
                placeholders[placeholder] = `<span class="${className}">${content}</span>`;
                $span.replaceWith(placeholder);
                console.log(`Replaced content of <span class="${className}"> with placeholder: ${placeholder}`);
            }
        });

        // Step 2: プレーンテキストとしてハイライト処理を行う
        let html = $codeBlock.html();
        console.log("Step 2: Applying patterns to plain text");
        console.log("Initial HTML (after removing <span> tags):", html);

        if (patterns[language]) {
            patterns[language].forEach(({ type, regex }) => {
                html = html.replace(regex, (match) => {
                    console.log(`Matched ${type}: <span class="syntax-${type}">${match}</span>`);
                    return `<span class="syntax-${type}">${match}</span>`;
                });
            });
        }

        // Step 3: プレースホルダを元の <span> タグに戻す
        console.log("Step 3: Reverting placeholders back to original <span> tags");
        Object.keys(placeholders).forEach((placeholder) => {
            html = html.replace(new RegExp(placeholder, 'g'), placeholders[placeholder]);
        });

        console.log("Final HTML after highlighting:", html);

        // 4. 置換結果をコードブロックに適用
        $codeBlock.html(html);
        console.log("=== Syntax highlighting complete ===");
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
