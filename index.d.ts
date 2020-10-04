declare module "tossr" {
    export type Config = {
        /**
         * hostname to use while rendering. Defaults to http://jsdom.ssr
         */
        host: string;
        /**
         * event to wait for before rendering app. Defaults to 'app-loaded'
         */
        eventName: string;
        /**
         * Executed before script is evaluated.
         */
        beforeEval: Eval;
        /**
         * Executed after script is evaluated.
         */
        afterEval: Eval;
        /**
         * Don't print timestamps
         */
        silent: boolean;
        /**
         * required for apps with dynamic imports
         */
        inlineDynamicImports: boolean;
        /**
         * required for apps with dynamic imports
         */
        timeout: number;
        /**
         * disables caching of inlinedDynamicImports bundle
         */
        dev: boolean;
    };
    /**
     * Called before/after the app script is evaluated
     */
    export type Eval = (dom: object) => any;
    /**
     * Renders an HTML page from a HTML template, an app bundle and a path
     * @param {string} template Html template (or path to a HTML template).
     * @param {string} script Bundled JS app (or path to bundled bundle JS app).
     * @param {string} url Path to render. Ie. /blog/breathing-oxygen-linked-to-staying-alive
     * @param {Partial<Config>=} options Options
     * @returns {Promise<string>}
     */
    export function tossr(template: string, script: string, url: string, options?: Partial<Config> | undefined): Promise<string>;
    export function inlineScript(script: any, dev?: boolean): Promise<string>;
}
