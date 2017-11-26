export interface ConfigStatics {
    CONFIG_PACKAGE_PREFIX: string;
    FILTER_RULE_NAME_PREFIX: string;
    RULE_NAME_PREFIX: string;
    RULE_PRESET_NAME_PREFIX: string;
    PLUGIN_NAME_PREFIX: string;
}
export declare class Config {
    rules: any;
    rulesBaseDirectory: string | undefined;
    configFile: string | undefined;
    disabledRules: string[];
    filterRules: string[];
    disabledFilterRules: string[];
    presets: string[];
    plugins: string[];
    pluginsConfig: {
        [index: string]: any;
    };
    rulesConfig: {
        [index: string]: any;
    };
    filterRulesConfig: {
        [index: string]: any;
    };
    extensions: string[];
    rulePaths: string[];
    formatterName: string | undefined;
    quiet: boolean;
    color: boolean;
    cache: boolean;
    cacheLocation: string;
    /**
     * @return {string} rc config filename
     * it's name use as `.<name>rc`
     */
    static readonly CONFIG_FILE_NAME: string;
    /**
     * @return {string} config package prefix
     */
    static readonly CONFIG_PACKAGE_PREFIX: string;
    /**
     * @return {string} rule package's name prefix
     */
    static readonly RULE_NAME_PREFIX: string;
    /**
     * @return {string} filter rule package's name prefix
     */
    static readonly FILTER_RULE_NAME_PREFIX: string;
    /**
     * @return {string} rule preset package's name prefix
     */
    static readonly RULE_PRESET_NAME_PREFIX: string;
    /**
     * @return {string} plugins package's name prefix
     */
    static readonly PLUGIN_NAME_PREFIX: string;
    /**
     * Create config object form command line options
     * See options.js
     * @param {object} cliOptions the options is command line option object. @see options.js
     * @returns {Config}
     */
    static initWithCLIOptions(cliOptions: any): Config;
    static initWithAutoLoading(options?: any): Config;
    /**
     * Return hash string of the config and textlint version
     * @returns {string}
     */
    readonly hash: any;
    /**
     * initialize with options.
     * @param {TextlintConfig} options the option object is defined as TextlintConfig.
     * @returns {Config}
     * @constructor
     */
    constructor(options?: Partial<Config>);
    _assertCacheLocation(locationPath: string): void;
    toJSON(): any;
}