/// <reference path="../libs/DefinitelyTyped/history/history.d.ts" />
var retuor;
(function (retuor) {
    "use strict";

    var _basePath = '/', _routes = {}, _window, _history, _running;

    /**
    * Sets the base path.
    */
    function setBasePath(basePath) {
        basePath = trimSlashes(basePath);
        if (basePath.length > 0) {
            _basePath = '/' + trimSlashes(basePath) + '/';
        }
    }
    retuor.setBasePath = setBasePath;

    /**
    * Starts route matching, executing any matched route's callback.
    * Should be called after route registrations.
    */
    function run(localWindow) {
        if (_running) {
            throw "Already running. run() must only be called once.";
        }
        _running = true;
        _window = localWindow || window;
        _history = _window.History || null;

        if (_history != null && _history.enabled) {
            _history.Adapter.bind(_window, 'statechange', onStateChange);
        }

        matchRoute(getPath());
    }
    retuor.run = run;

    /**
    * Replaces the current state by trying to match a route, but without
    * changing the url.
    */
    function forward(path) {
        if (_history == null || !_history.enabled) {
            throw "HistoryJS must be enabled to use this function.";
        }
        _history.replaceState(null, "", null);

        matchRoute(path);
    }
    retuor.forward = forward;

    /**
    * Replaces the current state by trying to match a route. The current
    * url will be replaced.
    */
    function redirect(path) {
        if (_history == null || !_history.enabled) {
            throw "HistoryJS must be enabled to use this function.";
        }
        var targetUrl = normalizePath(path);
        _history.replaceState(null, "", targetUrl);
    }
    retuor.redirect = redirect;

    /**
    * Will push a new state and try to match a route. If not History.js
    * is enabled, window.location.href will be set.
    */
    function navigate(path) {
        var targetUrl = normalizePath(path);

        if (_history == null || !_history.enabled) {
            _window.location.href = targetUrl;
        } else {
            if (_history.getState().url != targetUrl) {
                _history.pushState(null, "", targetUrl);
            } else {
                _history.Adapter.trigger(_window, 'statechange');
            }
        }
    }
    retuor.navigate = navigate;

    /**
    * Adds a callback function for one or more route paths. If the path
    * argument is omitted, the supplied callback function will be added
    * to the "base path".
    */
    function route(pathsOrCallback, callback) {
        if (typeof pathsOrCallback === 'undefined' || pathsOrCallback === null) {
            throw 'A callback is required.';
        }

        if (toType(pathsOrCallback) === 'function') {
            normalizeAndAddRoute('', pathsOrCallback);
        } else if (callback) {
            if (toType(pathsOrCallback) === 'Array') {
                var i;
                for (i in pathsOrCallback) {
                    normalizeAndAddRoute(pathsOrCallback[i], callback);
                }
            } else {
                normalizeAndAddRoute(pathsOrCallback, callback);
            }
        } else {
            throw 'Missing callback function.';
        }
    }
    retuor.route = route;

    /**
    *
    */
    function normalizeAndAddRoute(route, callback) {
        var normalizedRoute = '^' + route.replace(/{\*.+}/i, "(.+)").replace(/{[^\/]+}/ig, '([^/]+)').replace(/\*/g, '[^/]+').replace(/\//g, '\\/') + '$';
        _routes[normalizedRoute] = callback;
    }

    /**
    * Callback function for the "statechange" event.
    */
    function onStateChange() {
        matchRoute(getPath());
    }

    /**
    *
    */
    function normalizePath(path) {
        if (path.match(/^(https?|ftp|file):\/\//)) {
            return path;
        }
        return _window.location.protocol + '//' + _window.location.host + _basePath + trimSlashes(path);
    }

    /**
    * Trims slashes and returns the trimmed string.
    */
    function trimSlashes(str) {
        if (!str) {
            return "";
        }
        return str.replace(/^\/+|\/+$/g, "");
    }

    /**
    *
    */
    function toType(obj) {
        return ({}).toString.call(obj).slice(8, -1).toLowerCase();
    }

    /**
    * Tries to match a route for the given path.
    */
    function matchRoute(path) {
        var route, result;
        for (route in _routes) {
            result = new RegExp(route, 'i').exec(path);
            if (result) {
                if (!_routes[route].apply(this, result.slice(1))) {
                    break;
                }
            }
        }
    }

    /**
    * Returns the current path (without the base path and/or query string).
    */
    function getPath() {
        return _window.location.pathname.substring(_basePath.length);
    }
})(retuor || (retuor = {}));
//@ sourceMappingURL=retuor.js.map
