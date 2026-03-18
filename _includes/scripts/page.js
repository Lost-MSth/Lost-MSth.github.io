/*(function () {
})();*/

function getTheme() {
    var theme = "light"; // default to light

    // local storage is used to override OS theme settings
    if (localStorage.getItem("theme")) {
        if (localStorage.getItem("theme") === "dark") {
            theme = "dark";
        }
    } else if (!window.matchMedia) {
        // matchMedia method not supported
        return false;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        // OS theme setting detected as dark
        theme = "dark";
    }
    return theme;
}

function setThemeToggleState(isDark) {
    var iconClass = isDark ? "fas fa-sun" : "fas fa-moon";
    var actionLabel = isDark ? "Switch to light theme" : "Switch to dark theme";
    var icon1 = document.getElementById("themeSwitch1");
    var icon2 = document.getElementById("themeSwitch2");

    if (icon1) {
        icon1.className = iconClass;
    }
    if (icon2) {
        icon2.className = iconClass;
    }

    var toggles = document.querySelectorAll('.js-theme-toggle');
    for (var i = 0; i < toggles.length; i++) {
        toggles[i].setAttribute('aria-label', actionLabel);
        toggles[i].setAttribute('aria-pressed', isDark ? 'true' : 'false');
    }
}

function initTheme() {
    // dark theme preferred, set document with a `data-theme` attribute
    var isDark = getTheme() === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
}
initTheme();

function initThemeSwitch() {
    setThemeToggleState(getTheme() === "dark");
}

function toggleTheme() {
    var isDark = localStorage.getItem("theme") === "dark";
    if (isDark) {
        localStorage.setItem("theme", "light");
        document.documentElement.setAttribute("data-theme", "light");
        setThemeToggleState(false);
    } else {
        localStorage.setItem("theme", "dark");
        document.documentElement.setAttribute("data-theme", "dark");
        setThemeToggleState(true);
    }
}

var SOURCES = window.TEXT_VARIABLES.sources;
window.Lazyload.js(SOURCES.jquery, function () {
    $(function () {
        var upButton = document.getElementById('scroll_up_button');
        var downButton = document.getElementById('scroll_down_button');
        var progressWrap = document.querySelector('.js-reading-progress-wrap');
        var progressBar = document.querySelector('.js-reading-progress');

        var pageRoot = document.querySelector('.js-page-root');
        var pageMain = document.querySelector('.js-page-main');
        var useMainScroller = !!(pageRoot && pageMain && pageRoot.classList.contains('layout--page--sidebar'));
        var scrollTarget = useMainScroller ? pageMain : window;

        var supportsSmoothScroll = 'scrollBehavior' in document.documentElement.style;
        var threshold = 120;
        var ticking = false;

        function initFootnoteUX() {
            var articleContent = document.querySelector('.article__content');
            if (!articleContent || !pageMain) {
                return;
            }

            var hasFootnotes = articleContent.querySelector('a.footnote[href^="#fn:"]')
                && articleContent.querySelector('.footnotes');
            if (!hasFootnotes) {
                return;
            }

            var highlightTimer = 0;

            function flashTarget(target) {
                if (!target) {
                    return;
                }
                target.classList.add('is-footnote-target');
                window.clearTimeout(highlightTimer);
                highlightTimer = window.setTimeout(function () {
                    target.classList.remove('is-footnote-target');
                }, 1200);
            }

            function getTargetScrollTop(target) {
                var rect = target.getBoundingClientRect();
                var offset = useMainScroller ? 16 : 76;
                if (useMainScroller) {
                    var mainRect = pageMain.getBoundingClientRect();
                    return Math.max(0, pageMain.scrollTop + rect.top - mainRect.top - offset);
                }
                var currentTop = window.pageYOffset || document.documentElement.scrollTop || 0;
                return Math.max(0, currentTop + rect.top - offset);
            }

            function focusHash(hash) {
                if (!hash || hash.charAt(0) !== '#') {
                    return false;
                }
                var targetId = decodeURIComponent(hash.slice(1));
                var target = document.getElementById(targetId);
                if (!target) {
                    return false;
                }

                var top = getTargetScrollTop(target);
                var options = {
                    top: top,
                    behavior: supportsSmoothScroll ? 'smooth' : 'auto'
                };
                useMainScroller ? pageMain.scrollTo(options) : window.scrollTo(options);
                flashTarget(target);
                return true;
            }

            articleContent.addEventListener('click', function (e) {
                var link = e.target && e.target.closest
                    ? e.target.closest('a.footnote[href^="#fn:"], .footnotes a.reversefootnote[href^="#fnref:"]')
                    : null;
                if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                    return;
                }

                var hash = link.getAttribute('href');
                if (focusHash(hash)) {
                    e.preventDefault();
                    history.replaceState(null, '', hash);
                    link.blur();
                }
            });

            if (window.location.hash) {
                focusHash(window.location.hash);
            }
        }

        function initScrollReveal() {
            var revealSelector = [
                '.layout--articles .item',
                '.layout--articles .cell',
                '.pagination',
                '.article__header',
                '.article__info',
                '.page__comments',
                '.article__content > h2',
                '.article__content > h3',
                '.article__content > h4',
                '.article__content > p',
                '.article__content > pre',
                '.article__content > figure',
                '.article__content > blockquote',
                '.article__content > table',
                '.article__content > ul',
                '.article__content > ol',
                '.article__content > details'
            ].join(',');

            var nodes = document.querySelectorAll(revealSelector);
            if (!nodes || !nodes.length) {
                return;
            }

            var targets = [];
            var maxTargets = 180;
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (!node || node.classList.contains('reveal-ready') || node.classList.contains('is-revealed')) {
                    continue;
                }
                if (node.closest('.modal') || node.closest('.d-print-none')) {
                    continue;
                }
                node.classList.add('reveal-ready');
                node.style.setProperty('--reveal-delay', ((targets.length % 6) * 32) + 'ms');
                targets.push(node);
                if (targets.length >= maxTargets) {
                    break;
                }
            }

            if (!targets.length) {
                return;
            }

            function revealAll() {
                for (var x = 0; x < targets.length; x++) {
                    targets[x].classList.add('is-revealed');
                }
            }

            if (!('IntersectionObserver' in window)) {
                revealAll();
                return;
            }

            var observer;
            try {
                observer = new IntersectionObserver(function (entries) {
                    for (var k = 0; k < entries.length; k++) {
                        if (entries[k].isIntersecting) {
                            var el = entries[k].target;
                            el.classList.add('is-revealed');
                            observer.unobserve(el);
                        }
                    }
                }, {
                    root: useMainScroller ? pageMain : null,
                    rootMargin: '0px 0px -64px 0px',
                    threshold: 0.08
                });
            } catch (err) {
                revealAll();
                return;
            }

            for (var n = 0; n < targets.length; n++) {
                observer.observe(targets[n]);
            }

            // Fallback for older Chromium builds that intermittently miss IO callbacks
            window.setTimeout(function () {
                for (var m = 0; m < targets.length; m++) {
                    if (!targets[m].classList.contains('is-revealed')) {
                        targets[m].classList.add('is-revealed');
                        observer.unobserve(targets[m]);
                    }
                }
            }, 1500);

            window.addEventListener('pagehide', function () {
                observer.disconnect();
            }, { once: true });
        }

        function setButtonVisible(button, visible) {
            button.classList.toggle('is-hidden', !visible);
            button.setAttribute('aria-hidden', visible ? 'false' : 'true');
        }

        function getScrollMetrics() {
            if (useMainScroller) {
                return {
                    scrollTop: pageMain.scrollTop || 0,
                    viewportHeight: pageMain.clientHeight || 0,
                    scrollHeight: pageMain.scrollHeight || 0
                };
            }

            return {
                scrollTop: window.pageYOffset || document.documentElement.scrollTop || 0,
                viewportHeight: window.innerHeight || document.documentElement.clientHeight || 0,
                scrollHeight: Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.offsetHeight
                )
            };
        }

        function updateReadingProgress(scrollTop, viewportHeight, scrollHeight) {
            if (!progressBar || !progressWrap) {
                return;
            }
            var scrollable = Math.max(0, scrollHeight - viewportHeight);
            if (scrollable <= 80) {
                progressWrap.classList.add('is-idle');
                progressBar.style.transform = 'scaleX(0)';
                return;
            }
            progressWrap.classList.remove('is-idle');
            var progress = Math.min(1, Math.max(0, scrollTop / scrollable));
            progressBar.style.transform = 'scaleX(' + progress + ')';
        }

        function updateScrollUI() {
            var metrics = getScrollMetrics();
            var scrollTop = metrics.scrollTop;
            var viewportHeight = metrics.viewportHeight;
            var scrollHeight = metrics.scrollHeight;

            setButtonVisible(upButton, scrollTop > threshold);
            setButtonVisible(downButton, scrollTop + viewportHeight < scrollHeight - threshold);
            updateReadingProgress(scrollTop, viewportHeight, scrollHeight);
            ticking = false;
        }

        function requestUpdate() {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollUI);
                ticking = true;
            }
        }

        function scrollToTop() {
            var options = {
                top: 0,
                behavior: supportsSmoothScroll ? 'smooth' : 'auto'
            };
            useMainScroller ? pageMain.scrollTo(options) : window.scrollTo(options);
        }

        function scrollToBottom() {
            var bottom = useMainScroller ? pageMain.scrollHeight : document.documentElement.scrollHeight;
            var options = {
                top: bottom,
                behavior: supportsSmoothScroll ? 'smooth' : 'auto'
            };
            useMainScroller ? pageMain.scrollTo(options) : window.scrollTo(options);
        }

        initFootnoteUX();
        initScrollReveal();

        if (!upButton || !downButton) {
            return;
        }

        upButton.addEventListener('click', scrollToTop);
        downButton.addEventListener('click', scrollToBottom);

        scrollTarget.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
        updateScrollUI();
    });
});
