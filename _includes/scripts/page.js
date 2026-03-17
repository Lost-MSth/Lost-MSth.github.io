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

        if (!upButton || !downButton) {
            return;
        }

        var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var threshold = 120;
        var ticking = false;

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
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            };
            useMainScroller ? pageMain.scrollTo(options) : window.scrollTo(options);
        }

        function scrollToBottom() {
            var bottom = useMainScroller ? pageMain.scrollHeight : document.documentElement.scrollHeight;
            var options = {
                top: bottom,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            };
            useMainScroller ? pageMain.scrollTo(options) : window.scrollTo(options);
        }

        upButton.addEventListener('click', scrollToTop);
        downButton.addEventListener('click', scrollToBottom);

        scrollTarget.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
        updateScrollUI();
    });
});
