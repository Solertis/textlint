// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
/**
 * Logger Utils class
 * Use this instead of `console.log`
 * Main purpose for helping linting.
 */
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.log = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        console.log.apply(console, message);
    };
    Logger.warn = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        console.warn.apply(console, message);
    };
    Logger.error = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        console.error.apply(console, message);
    };
    return Logger;
}());
exports.default = Logger;