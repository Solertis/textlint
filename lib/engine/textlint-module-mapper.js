// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This class is a helper to create mapping of rules and rulesConfig
 * Main purpose hide the RuleSeparator "/".
 */
// The separator of `<plugin>/<rule>`
var RuleSeparator = "/";
var TextLintModuleMapper = /** @class */ (function () {
    function TextLintModuleMapper() {
    }
    /**
     * create entities from rules/rulesConfig and prefix
     * entities is a array which contain [key, value]
     * see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
     * @param {Object} pluginRules an object is like "rules" or "rulesConfig" of plugin
     * @param {string} prefixKey prefix key is plugin name or preset name
     * @returns {[string, string][]}
     */
    TextLintModuleMapper.createEntities = function (pluginRules, prefixKey) {
        var entities = [];
        Object.keys(pluginRules).forEach(function (ruleId) {
            var qualifiedRuleId = prefixKey + RuleSeparator + ruleId;
            var ruleCreator = pluginRules[ruleId];
            entities.push([qualifiedRuleId, ruleCreator]);
        });
        return entities;
    };
    /**
     * create an object from rules/rulesConfig and prefix
     * the object shape is { key: value, key2: value }
     * @param {Object} pluginRules an object is like "rules" or "rulesConfig" of plugin
     * @param {string} prefixKey prefix key is plugin name or preset name
     * @returns {Object}
     */
    TextLintModuleMapper.createMappedObject = function (pluginRules, prefixKey) {
        var mapped = {};
        Object.keys(pluginRules).forEach(function (key) {
            mapped[prefixKey + "/" + key] = pluginRules[key];
        });
        return mapped;
    };
    return TextLintModuleMapper;
}());
exports.TextLintModuleMapper = TextLintModuleMapper;