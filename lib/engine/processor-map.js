// LICENSE : MIT
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var map_like_1 = require("map-like");
/**
 * Processor Map object
 */
var PluginMap = /** @class */ (function (_super) {
    __extends(PluginMap, _super);
    function PluginMap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PluginMap.prototype.toJSON = function () {
        var object = {};
        this.forEach(function (value, key) {
            object[key] = value;
        });
        return object;
    };
    return PluginMap;
}(map_like_1.MapLike));
exports.PluginMap = PluginMap;