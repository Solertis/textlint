// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var fs = require("fs");
var path = require("path");
var debug = require("debug")("textlint:cli");
var mkdirp = require("mkdirp");
var options_1 = require("./options");
var textlint_engine_1 = require("./textlint-engine");
var textfix_engine_1 = require("./textfix-engine");
var config_1 = require("./config/config");
var config_initializer_1 = require("./config/config-initializer");
var textlint_fixer_1 = require("./fixer/textlint-fixer");
var logger_1 = require("./util/logger");
/*
 cli.js is command line **interface**

 processing role is cli-engine.js.
 @see cli-engine.js
 */
/**
 * Print results of lining text.
 * @param {string} output the output text which is formatted by {@link TextLintEngine.formatResults}
 * @param {object} options cli option object {@lint ./options.js}
 * @returns {boolean} does print result success?
 */
function printResults(output, options) {
    if (!output) {
        return true;
    }
    var outputFile = options.outputFile;
    if (outputFile) {
        var filePath = path.resolve(process.cwd(), outputFile);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
            logger_1.Logger.error("Cannot write to output file path, it is a directory: %s", outputFile);
            return false;
        }
        try {
            mkdirp.sync(path.dirname(filePath));
            fs.writeFileSync(filePath, output);
        }
        catch (ex) {
            logger_1.Logger.error("There was a problem writing the output file:\n%s", ex);
            return false;
        }
    }
    else {
        logger_1.Logger.log(output);
    }
    return true;
}
/**
 * Encapsulates all CLI behavior for eslint. Makes it easier to test as well as
 * for other Node.js programs to effectively run the CLI.
 */
exports.cli = {
    /**
     * Executes the CLI based on an array of arguments that is passed in.
     * @param {string|Array|Object} args The arguments to process.
     * @param {string} [text] The text to lint (used for TTY).
     * @returns {Promise<number>} The exit code for the operation.
     */
    execute: function (args, text) {
        var currentOptions;
        try {
            currentOptions = options_1.options.parse(args);
        }
        catch (error) {
            logger_1.Logger.error(error.message);
            return Promise.resolve(1);
        }
        var files = currentOptions._;
        if (currentOptions.version) {
            // version from package.json
            logger_1.Logger.log("v" + require("../package.json").version);
        }
        else if (currentOptions.init) {
            return config_initializer_1.configInit.initializeConfig(process.cwd());
        }
        else if (currentOptions.help || (!files.length && !text)) {
            logger_1.Logger.log(options_1.options.generateHelp());
        }
        else {
            // specify file name of stdin content
            var stdinFilename = currentOptions.stdinFilename;
            debug("Running on " + (text ? "text" : "files") + ", stdin-filename: " + stdinFilename);
            return this.executeWithOptions(currentOptions, files, text, stdinFilename);
        }
        return Promise.resolve(0);
    },
    /**
     * execute with cli options
     * @param {object} cliOptions
     * @param {string[]} files files are file path list
     * @param {string} [text]
     * @param {string} [stdinFilename]
     * @returns {Promise<number>} exit status
     */
    executeWithOptions: function (cliOptions, files, text, stdinFilename) {
        var config = config_1.Config.initWithCLIOptions(cliOptions);
        var showEmptyRuleWarning = function () {
            logger_1.Logger.log("\n== Not have rules, textlint do not anything ==\n=> How to set rule?\nSee https://github.com/textlint/textlint/blob/master/docs/configuring.md\n");
        };
        if (cliOptions.fix) {
            // --fix
            // TODO: fix to type
            var fixEngine_1 = new textfix_engine_1.TextFixEngine(config);
            if (!fixEngine_1.hasRuleAtLeastOne()) {
                showEmptyRuleWarning();
                return Promise.resolve(0);
            }
            var resultsPromise_1 = text
                ? fixEngine_1.executeOnText(text, stdinFilename)
                : fixEngine_1.executeOnFiles(files);
            return resultsPromise_1.then(function (results) {
                var fixer = new textlint_fixer_1.TextLintFixer();
                var output = fixEngine_1.formatResults(results);
                printResults(output, cliOptions);
                // --dry-run
                if (cliOptions.dryRun) {
                    debug("Enable dry-run mode.");
                    return Promise.resolve(0);
                }
                // modify file and return exit status
                return fixer.write(results).then(function () {
                    return 0;
                });
            });
        }
        // lint as default
        var lintEngine = new textlint_engine_1.TextLintEngine(config);
        if (!lintEngine.hasRuleAtLeastOne()) {
            showEmptyRuleWarning();
            return Promise.resolve(0);
        }
        var resultsPromise = text ? lintEngine.executeOnText(text, stdinFilename) : lintEngine.executeOnFiles(files);
        return resultsPromise.then(function (results) {
            var output = lintEngine.formatResults(results);
            if (printResults(output, cliOptions)) {
                return lintEngine.isErrorResults(results) ? 1 : 0;
            }
            else {
                return 1;
            }
        });
    }
};