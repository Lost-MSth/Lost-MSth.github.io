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
