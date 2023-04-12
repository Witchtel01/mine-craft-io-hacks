'use strict';
(function () {
    var PROBABLY_MAX_JS_LENGTH = 3786712;

    var $screen = document.getElementById("load-main-js-screen");
    var $progressBar = document.getElementById("load-main-js-progress-bar");
    var $progress = document.getElementById("load-main-js-progress");
    var $logoPathOne = document.getElementById("logo-path-one");
    var $logoPathTwo = document.getElementById("logo-path-two");
    var $logoPathThree = document.getElementById("logo-path-three");
    var $logoPathFour = document.getElementById("logo-path-four");
    var $logoPathFive = document.getElementById("logo-path-five");
    var $logoPathSix = document.getElementById("logo-path-six");

    var logoPathSixTimer;
    var mainJsScript;
    var canHideLoadMainJsScreen = false;
    var mainJsLoaded = false;
    var mainJsExecuted = false;
    var windowLoaded = false;
    var gameLoaded = false;
    var errorDiv = false;

    var req = new XMLHttpRequest();
    req.addEventListener("progress", onReqProgress, false);
    req.addEventListener("load", onReqLoad, false);
    req.addEventListener("error", onReqError, false);

    if (window.addEventListener) {
        window.addEventListener('load', onWindowLoad);
        window.addEventListener('error', onWindowError)
    } else {
        window.attachEvent('onload', onWindowLoad);
        window.attachEvent('onerror', onWindowError)
    }

    if (isDev()) {
        endLogoAnimation();
    } else {
        startLogoAnimation().then(endLogoAnimation);
    }

    document.addEventListener("DOMContentLoaded", function () {
        req.open("GET", MAIN_JS_SRC);
        req.send();
    });

    function onWindowLoad() {
        windowLoaded = true;
    }

    function onWindowError(event) {
        console.log(event);
        if (!gameLoaded) {
            displayError(event.error);
        }
    }

    function onReqProgress(event) {
        var percentComplete;
        if (event.lengthComputable) {
            percentComplete = event.loaded / event.total;
        } else {
            percentComplete = event.loaded / PROBABLY_MAX_JS_LENGTH;
        }
        if ($progress) {
            $progress.style.width = `${percentComplete * 100}%`;
        }
    }

    function onReqLoad(event) {
        if (req.status === 404) {
            throw new Error('404');
        }

        mainJsLoaded = true;
        mainJsScript = document.createElement("script");
        mainJsScript.innerHTML = event.target.responseText;

        executeMainJS();
        hideLoadMainJsScreen(0);
    }

    function onReqError(event) {
        console.log(event);
    }

    function startLogoAnimation() {
        return new Promise(resolve => {
            showLogoPath($logoPathOne, 200)
                .then(() => showLogoPath($logoPathTwo, 200))
                .then(() => showLogoPath($logoPathThree, 200))
                .then(() => showLogoPath($logoPathFour, 200))
                .then(() => showLogoPath($logoPathFive, 200))
                .then(() => showLogoPath($logoPathSix, 600))
                .then(() => {
                    setTimeout(() => {
                        logoPathSixTimer = setInterval(() => $logoPathSix.classList.toggle("down"), 500);
                    }, 100);
                    setTimeout(() => resolve(), 1000);
                });
        });
    }

    function showLogoPath($element, timeout = 200) {
        return new Promise(resolve => {
            if ($element) {
                setTimeout(() => {
                    $element.classList.add("show");
                    resolve();
                }, timeout);
            }
        });
    }

    function endLogoAnimation() {
        canHideLoadMainJsScreen = true;
        if (mainJsLoaded) {
            executeMainJS();
            hideLoadMainJsScreen(0);
        } else {
            $progressBar.classList.add("show");
        }
    }

    function executeMainJS() {
        if (!mainJsScript || mainJsExecuted) {
            return;
        }

        mainJsExecuted = true;
        document.documentElement.appendChild(mainJsScript);
        if (windowLoaded) {
            if (window.GAME && window.GAME.window && window.GAME.window.events && window.GAME.window.events.emit) {
                gameLoaded = true;
                window.GAME.window.events.emit("windowLoaded");
            }
        }
    }

    function hideLoadMainJsScreen(timeout) {
        if (timeout && !isDev()) {
            setTimeout(() => hideLoadMainJsScreenForce(), timeout);
        } else {
            hideLoadMainJsScreenForce();
        }
    }

    function hideLoadMainJsScreenForce() {
        if (logoPathSixTimer) {
            clearInterval(logoPathSixTimer);
            logoPathSixTimer = null;
        }
        if ($screen) {
            $screen.classList.add("hide");
        }
        setTimeout(() => {
            if ($screen) {
                $screen.remove();
            }
        }, 500);
    }

    function getUrlParameter(parameterName) {
        var result = null;
        var tmp = [];
        var items = location.search.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === parameterName) {
                result = decodeURIComponent(tmp[1]);
            }
        }
        return result;
    }

    function isDev() {
        return getUrlParameter('dev');
    }

    function displayError(e) {
        if (!errorDiv) {
            errorDiv = document.createElement("div");
            document.body.appendChild(errorDiv);
        }

        var title = e ? (e.message || e) : "Unexpected error";
        var stack = (e && e.stack && (typeof e.stack === 'string') ? e.stack : '').replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

        errorDiv.innerHTML = [
            '<div style="display: flex; justify-content: center; position: absolute; text-align: center; align-items: center; height: 100%; width: 100%;">',
            '<div>',
            '<h1>An error occured during loading the game :(</h1>',
            '<br>',
            '<h2>Please update your browser</h2>',
            '<br>',
            '<h3 style="color: red">' + title + '</h3>',
            '<h4 style="color: red; text-align: left;">' + stack + '</h4>',
            '</div>',
            '</div>'
        ].join('');
    }

})();
