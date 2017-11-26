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
var TraverseController = require("txt-ast-traverse").Controller;
var traverseController = new TraverseController();
var debug = require("debug")("textlint:core-task");
var promise_event_emitter_1 = require("./promise-event-emitter");
var Bluebird = require("bluebird");
var rule_error_1 = require("../core/rule-error");
var source_location_1 = require("../core/source-location");
var timing_1 = require("../util/timing");
var MessageType_1 = require("../shared/type/MessageType");
var events_1 = require("events");
var assert = require("assert");
var RuleTypeEmitter = /** @class */ (function (_super) {
    __extends(RuleTypeEmitter, _super);
    function RuleTypeEmitter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RuleTypeEmitter;
}(promise_event_emitter_1.PromiseEventEmitter));
/**
 * CoreTask receive AST and prepare, traverse AST, emit nodeType event!
 * You can observe task and receive "message" event that is TextLintMessage.
 */
var TextLintCoreTask = /** @class */ (function (_super) {
    __extends(TextLintCoreTask, _super);
    function TextLintCoreTask() {
        var _this = _super.call(this) || this;
        _this.ruleTypeEmitter = new RuleTypeEmitter();
        return _this;
    }
    Object.defineProperty(TextLintCoreTask, "events", {
        get: function () {
            return {
                // receive start event
                start: "start",
                // receive message from each rules
                message: "message",
                // receive complete event
                complete: "complete",
                // receive error event
                error: "error"
            };
        },
        enumerable: true,
        configurable: true
    });
    TextLintCoreTask.prototype.createShouldIgnore = function () {
        var _this = this;
        var shouldIgnore = function (args) {
            var ruleId = args.ruleId, range = args.range, optional = args.optional;
            assert(typeof range[0] !== "undefined" && typeof range[1] !== "undefined" && range[0] >= 0 && range[1] >= 0, "ignoreRange should have actual range: " + range);
            // FIXME: should have index, loc
            // should be compatible with LintReportedMessage?
            var message = {
                type: MessageType_1.default.ignore,
                ruleId: ruleId,
                range: range,
                // ignoring target ruleId - default: filter all messages
                ignoringRuleId: optional.ruleId || "*"
            };
            _this.emit(TextLintCoreTask.events.message, message);
        };
        return shouldIgnore;
    };
    TextLintCoreTask.prototype.createReporter = function (sourceCode) {
        var _this = this;
        var sourceLocation = new source_location_1.default(sourceCode);
        /**
         * push new RuleError to results
         * @param {ReportMessage} reportedMessage
         */
        var reportFunction = function (reportedMessage) {
            var ruleId = reportedMessage.ruleId, severity = reportedMessage.severity, ruleError = reportedMessage.ruleError;
            debug("%s pushReport %s", ruleId, ruleError);
            var _a = sourceLocation.adjust(reportedMessage), line = _a.line, column = _a.column, fix = _a.fix;
            var index = sourceCode.positionToIndex({ line: line, column: column });
            // add TextLintMessage
            var message = {
                type: MessageType_1.default.lint,
                ruleId: ruleId,
                message: ruleError.message,
                index: index,
                // See https://github.com/textlint/textlint/blob/master/typing/textlint.d.ts
                line: line,
                column: column + 1,
                severity: severity,
                fix: fix !== undefined ? fix : undefined
            };
            if (!(ruleError instanceof rule_error_1.default)) {
                // FIXME: RuleReportedObject should be removed
                // `error` is a any data.
                var data = ruleError;
                message.data = data;
            }
            _this.emit(TextLintCoreTask.events.message, message);
        };
        return reportFunction;
    };
    /**
     * start process and emitting events.
     * You can listen message by `task.on("message", message => {})`
     * @param {SourceCode} sourceCode
     */
    TextLintCoreTask.prototype.startTraverser = function (sourceCode) {
        var _this = this;
        this.emit(TextLintCoreTask.events.start);
        var promiseQueue = [];
        var ruleTypeEmitter = this.ruleTypeEmitter;
        traverseController.traverse(sourceCode.ast, {
            enter: function (node, parent) {
                var type = node.type;
                Object.defineProperty(node, "parent", { value: parent });
                if (ruleTypeEmitter.listenerCount(type) > 0) {
                    var promise = ruleTypeEmitter.emit(type, node);
                    promiseQueue.push(promise);
                }
            },
            leave: function (node) {
                var type = node.type + ":exit";
                if (ruleTypeEmitter.listenerCount(type) > 0) {
                    var promise = ruleTypeEmitter.emit(type, node);
                    promiseQueue.push(promise);
                }
            }
        });
        Bluebird.all(promiseQueue)
            .then(function () {
            _this.emit(TextLintCoreTask.events.complete);
        })
            .catch(function (error) {
            _this.emit(TextLintCoreTask.events.error, error);
        });
    };
    /**
     * try to get rule object
     * @param {Function} ruleCreator
     * @param {RuleContext|FilterRuleContext} ruleContext
     * @param {Object|boolean|undefined} ruleOptions
     * @returns {Object}
     * @throws
     */
    TextLintCoreTask.prototype.tryToGetRuleObject = function (ruleCreator, ruleContext, ruleOptions) {
        try {
            return ruleCreator(ruleContext, ruleOptions);
        }
        catch (error) {
            error.message = "Error while loading rule '" + ruleContext.id + "': " + error.message;
            throw error;
        }
    };
    /**
     * add all the node types as listeners of the rule
     * @param {Function} ruleCreator
     * @param {RuleContext|FilterRuleContext} ruleContext
     * @param {Object|boolean|undefined} ruleOptions
     * @returns {Object}
     */
    TextLintCoreTask.prototype.tryToAddListenRule = function (ruleCreator, ruleContext, ruleOptions) {
        var _this = this;
        var ruleObject = this.tryToGetRuleObject(ruleCreator, ruleContext, ruleOptions);
        var types = Object.keys(ruleObject);
        types.forEach(function (nodeType) {
            _this.ruleTypeEmitter.on(nodeType, timing_1.default.enabled ? timing_1.default.time(ruleContext.id, ruleObject[nodeType]) : ruleObject[nodeType]);
        });
    };
    return TextLintCoreTask;
}(events_1.EventEmitter));
exports.default = TextLintCoreTask;