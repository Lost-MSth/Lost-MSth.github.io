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

        function updateScrollButtons() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
            var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            var scrollHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.offsetHeight
            );

            setButtonVisible(upButton, scrollTop > threshold);
            setButtonVisible(downButton, scrollTop + viewportHeight < scrollHeight - threshold);
            ticking = false;
        }

        function requestUpdate() {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollButtons);
                ticking = true;
            }
        }

        upButton.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });

        downButton.addEventListener('click', function () {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });

        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
        updateScrollButtons();
    });
});
