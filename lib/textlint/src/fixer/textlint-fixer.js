"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var fs = require("fs");
function overWriteResult(result) {
    return new Promise(function (resolve, reject) {
        var targetFilePath = result.filePath;
        var output = result.output;
        fs.writeFile(targetFilePath, output, function (error, result) {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
}
var TextLintFixer = /** @class */ (function () {
    function TextLintFixer() {
    }
    /**
     * write output to each files and return promise
     * @param textFixMessages
     * @returns {Promise}
     */
    TextLintFixer.prototype.write = function (textFixMessages) {
        var promises = textFixMessages.map(overWriteResult);
        return Promise.all(promises);
    };
    return TextLintFixer;
}());
exports.TextLintFixer = TextLintFixer;