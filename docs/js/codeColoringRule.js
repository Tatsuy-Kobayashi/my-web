document.addEventListener('DOMContentLoaded', function () {
    Prism.plugins.fileHighlight && Prism.plugins.fileHighlight.highlight();

    Prism.hooks.add('after-highlight', function (env) {
        if (env.element.matches('pre[data-src]')) {
            Prism.highlightElement(env.element.querySelector('code'));
        }
    });

    Prism.hooks.add('complete', function (env) {
        if (env.element.parentNode.matches('pre[data-src][data-src-status="loaded"]')) {
            Prism.plugins.matchBraces && Prism.plugins.matchBraces();
        }
    });
});
