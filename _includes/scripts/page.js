/*(function () {
})();*/

function getTheme() {
    var theme = "light";    //default to light

    //local storage is used to override OS theme settings
    if (localStorage.getItem("theme")) {
        if (localStorage.getItem("theme") == "dark") {
            var theme = "dark";
        }
    } else if (!window.matchMedia) {
        //matchMedia method not supported
        return false;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        //OS theme setting detected as dark
        var theme = "dark";
    }
    return theme;
}

function initTheme() {
    //dark theme preferred, set document with a `data-theme` attribute
    if (getTheme() == "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    }
}
initTheme();

function initThemeSwitch() {
    if (getTheme() == "dark") {
        document.getElementById("themeSwitch1").className = "fas fa-sun";
        document.getElementById("themeSwitch2").className = "fas fa-sun";
    }
}

function toggleTheme() {
    if (localStorage.getItem("theme") == "dark") {
        localStorage.setItem("theme", "light");
        document.documentElement.setAttribute("data-theme", "light");
        document.getElementById("themeSwitch1").className = "fas fa-moon";
        document.getElementById("themeSwitch2").className = "fas fa-moon";
    } else {
        localStorage.setItem("theme", "dark");
        document.documentElement.setAttribute("data-theme", "dark");
        document.getElementById("themeSwitch1").className = "fas fa-sun";
        document.getElementById("themeSwitch2").className = "fas fa-sun";
    }
}



var SOURCES = window.TEXT_VARIABLES.sources;
window.Lazyload.js(SOURCES.jquery, function () {
    const check_if_in_view = function () {
        var scrollTop = $(this).scrollTop();
        var scrollHeight = $(document).height();
        var windowHeight = $(this).height();
        scrollTop < 100
            ? $('#scroll_up_button').hide('fast')
            : $('#scroll_up_button').show('fast')
        if (Math.abs(Math.round(scrollTop + windowHeight) - scrollHeight) < 100) {// 滚动到底部
            $('#scroll_down_button').hide('fast')
        } else {
            $('#scroll_down_button').show('fast')
        }
    }
    check_if_in_view();
    $('#scroll_up_button').click(function () {
        $('html, body').animate({ scrollTop: '0px' }, 600)
    })

    $('#scroll_down_button').click(function () {
        $('html, body').animate({ scrollTop: $(document).height() }, 600)
    })

    $(window).bind('scroll', check_if_in_view)
});

