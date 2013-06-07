/// <reference path="../libs/DefinitelyTyped/history/history.d.ts" />

module retuor {

    "use strict";

    var _basePath: string = '/',
        _routes: { [route: string]: Function; } = {},
        _window,
        _history: Historyjs,
        _running: boolean;

    /**
     * Sets the base path.
     */
    export function setBasePath(basePath: string): void {
        basePath = trimSlashes(basePath);
        if (basePath.length > 0) {
            _basePath = '/' + trimSlashes(basePath) + '/';
        }
    }

    export function run(): void;
    export function run(localWindow): void;
    
    /**
     * Starts route matching, executing any matched route's callback. 
     * Should be called after route registrations.
     */
    export function run(localWindow?: any): void {
        
        if (_running) {
            throw "Already running. run() must only be called once.";
        }
        _running = true;
        _window = localWindow || window;
        _history = <Historyjs>_window.History || null;
        

        if (_history != null && _history.enabled) {
            _history.Adapter.bind(_window, 'statechange', onStateChange);
        }

        matchRoute(getPath());
    }

    /**
     * Replaces the current state by trying to match a route, but without 
     * changing the url.
     */
    export function forward(path: string): void {
        if (_history == null || !_history.enabled) {
            throw "HistoryJS must be enabled to use this function.";
        }
        _history.replaceState(null, "", null);
        
        matchRoute(path);
    }

    /**
     * Replaces the current state by trying to match a route. The current 
     * url will be replaced.
     */
    export function redirect(path: string): void {
        if (_history == null || !_history.enabled) {
            throw "HistoryJS must be enabled to use this function.";
        }
        var targetUrl = normalizePath(path);
        _history.replaceState(null, "", targetUrl);
    }

    /**
     * Will push a new state and try to match a route. If not History.js 
     * is enabled, window.location.href will be set.
     */
    export function navigate(path: string): void {

        var targetUrl = normalizePath(path);

        if (_history == null || !_history.enabled) {
            _window.location.href = targetUrl;
        }
        else {
            if (_history.getState().url != targetUrl) {
                _history.pushState(null, "", targetUrl);
            }
            else {
                _history.Adapter.trigger(_window, 'statechange');
            }
        }
    }

    export function route(callback: Function): void;
    export function route(path: string, callback: Function): void;
    export function route(paths: string[], callback: Function): void;
    
    /**
     * Adds a callback function for one or more route paths. If the path 
     * argument is omitted, the supplied callback function will be added 
     * to the "base path".
     */
    export function route(pathsOrCallback: any, callback?: Function): void {

        if (typeof pathsOrCallback === 'undefined' || pathsOrCallback === null) {
            throw 'A callback is required.';
        }

        if (toType(pathsOrCallback) === 'function') {
            normalizeAndAddRoute('', pathsOrCallback);
        }
        else if (callback) {
            if (toType(pathsOrCallback) === 'Array') {
                var i;
                for (i in pathsOrCallback) {
                    normalizeAndAddRoute(pathsOrCallback[i], callback);
                }
            }
            else {
                normalizeAndAddRoute(pathsOrCallback, callback);
            }
        }
        else {
            throw 'Missing callback function.';
        }
    }

    /**
     *
     */
    function normalizeAndAddRoute(route: string, callback: Function): void {
        var normalizedRoute = '^' + route.replace(/{\*.+}/i, "(.+)") // {*path}
            .replace(/{[^\/]+}/ig, '([^/]+)') // {parameter}
            .replace(/\*/g, '[^/]+') // *
            .replace(/\//g, '\\/') // replace / with \/
            + '$';
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
    function normalizePath(path: string): string {
        if (path.match(/^(https?|ftp|file):\/\//)) {
            return path;
        }
        return _window.location.protocol + '//' + _window.location.host + _basePath + trimSlashes(path);
    }

    /**
     * Trims slashes and returns the trimmed string.
     */
    function trimSlashes(str: string): string {
        if (!str) {
            return "";
        }
        return str.replace(/^\/+|\/+$/g, "");
    }

    /**
     * 
     */
    function toType(obj: any): string {
        return ({}).toString.call(obj).slice(8, -1).toLowerCase();
    }

    /**
     * Tries to match a route for the given path.
     */
    function matchRoute(path: string): void {
        var route: string,
            result: RegExpExecArray;
        for (route in _routes) {

            result = new RegExp(route, 'i').exec(path);
            if (result) {
                // If the callback returns true, continue trying to match a route.
                if (!_routes[route].apply(this, result.slice(1))) {
                    break;
                }
            }
        }
    }

    /**
     * Returns the current path (without the base path and/or query string).
     */
    function getPath(): string {
        return _window.location.pathname.substring(_basePath.length);
    }
}