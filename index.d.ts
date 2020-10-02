declare module "tossr" {
    export function tossr(template: string, script: string, url: string, options?: Partial<Config> | undefined): Promise<string>;
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
    };
    /**
     * Called before/after the app script is evaluated
     */
    export type Eval = (dom: object) => any;
}
