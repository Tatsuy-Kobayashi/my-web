document.addEventListener('DOMContentLoaded', function () {
    window.MathJax = {
        options: {
            renderActions: {
                findScript: [10, function (doc) {
                    for (const node of document.querySelectorAll('script[type^="math/tex"]')) {
                        const display = !!node.type.match(/; *mode=display/);
                        const math = new doc.options.MathItem(node.textContent, doc.inputJax[0], display);
                        const text = document.createTextNode('');
                        node.parentNode.replaceChild(text, node);
                        math.start = {node: text, delim: '', n: 0};
                        math.end = {node: text, delim: '', n: 0};
                        doc.math.push(math);
                    }
                    doc.findMath();
                }, ''], // 数式スクリプトを探す
                compile: [20, (doc) => {
                    if (doc.math && doc.math.length) {
                        try {
                            for(let math of doc.math){
                                math.root = MathJax.startup.input[0].compile(math.math);
                            }
                        } catch (err) {
                            console.error("MathJax Compile Error:", err);
                        }
                    }
                }],  // TeXをコンパイル
                logMath: [30, (doc, math) => {
                    if (math && math.math) {
                        console.log("MathJax rendering:", math.math); // 数式の内容をログ出力
                    } else {
                        console.warn("Math object is undefined or malformed:", math);
                    } // 数式の内容をログ出力
                }],
                accessibility: [40, (doc, math) => {
                    console.log("Enhancing accessibility for:", math.math); // アクセシビリティ対応
                    // カスタムアクセシビリティ処理をここに追加可能
                }],
                mathmlInput: [50, (doc, math) => {
                    if (math.inputJax === "mathml") {
                        console.log("Processing MathML input:", math.math);
                        // MathML用の追加処理
                    }
                }],
                debug: [60, (doc, math) => {
                    console.log("Debugging MathJax:", {
                        input: math.math,
                        compiled: math.root,
                        output: math.typesetRoot
                    });
                }],
                typeset: [110, (doc) => {
                    MathJax.startup.promise.then(() => {
                        MathJax.outputJax["chtml"].typeset(doc);
                    });
                }], // 数式を組版
                finalize: [200, (doc, math) => {
                    console.log("Finalizing output for:", math.math);
                    MathJax.startup.finalizeOutput(doc, math); // 標準の最終処理
                }],  // 最終レンダリング処理
                addMenu: [300],  // ContextMenuを追加
                customHook: [400, (doc, math) => {
                    console.log("Custom hook executed for:", math.math);
                    // 数式処理後のカスタム操作をここで記述
                }],
                handleError: [500, (doc, math) => {
                    try {
                        // 通常の処理
                    } catch (error) {
                        console.error("MathJax Error:", error, math.math);
                    }
                }]
            }
        }
    };
});
