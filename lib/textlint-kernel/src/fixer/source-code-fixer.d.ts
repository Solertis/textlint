import { TextLintFixCommand, TextlintMessage } from "../textlint-kernel-interface";
import SourceCode from "../core/source-code";
export interface TextLintMessageFixable extends TextlintMessage {
    fix: TextLintFixCommand;
}
/**
 * Utility for apply fixes to source code.
 * @constructor
 */
export default class SourceCodeFixer {
    /**
     * Applies the fixes specified by the messages to the given text. Tries to be
     * smart about the fixes and won't apply fixes over the same area in the text.
     * @param {SourceCode} sourceCode The source code to apply the changes to.
     * @param {TextlintMessage[]} messages The array of messages reported by ESLint.
     * @returns {Object} An object containing the fixed text and any unfixed messages.
     */
    static applyFixes(sourceCode: SourceCode, messages: TextlintMessage[]): {
        fixed: boolean;
        messages: TextlintMessage[];
        applyingMessages: TextlintMessage[];
        remainingMessages: TextlintMessage[];
        output: string;
    };
    /**
     * Sequentially Applies the fixes specified by the messages to the given text.
     * @param {SourceCode} sourceCode The source code to apply the changes to.
     * @param {TextlintMessage[]} applyingMessages The array of TextLintMessage reported by SourceCodeFixer#applyFixes
     * @returns {string} An object containing the fixed text and any unfixed messages.
     */
    static sequentiallyApplyFixes(sourceCode: SourceCode, applyingMessages: TextlintMessage[]): string;
}