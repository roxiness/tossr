const { JSDOM } = require('jsdom')
const { dirname, resolve } = require('path')
const { existsSync, readFileSync } = require('fs')
const fetch = require('node-fetch')
const getBundlePath = script => resolve(dirname(script), '__roxi-ssr-bundle.js')

const defaults = {
    host: 'http://jsdom.ssr',
    eventName: 'app-loaded',
    beforeEval(dom) { },
    afterEval(dom) { },
    meta: { 'data-render': 'ssr' },
    silent: false,
    inlineDynamicImports: false,
    timeout: 5000,
    dev: false
}

/**
 * Renders an HTML page from a HTML template, an app bundle and a path
 * @param {string} template Html template (or path to a HTML template).
 * @param {string} script Bundled JS app (or path to bundled bundle JS app).
 * @param {string} url Path to render. Ie. /blog/breathing-oxygen-linked-to-staying-alive
 * @param {Partial<Config>=} options Options
 * @returns {Promise<string>}
 */
module.exports.tossr = async function ssr(template, script, url, options) {
    const start = Date.now()
    const {
        host,
        eventName,
        beforeEval,
        afterEval,
        silent,
        inlineDynamicImports,
        timeout,
        dev
    } = { ...defaults, ...options }

    // is this the content of the file or the path to the file?
    template = existsSync(template) ? readFileSync(template, 'utf8') : template
    script = inlineDynamicImports ? await resolveScript(script, dev)
        : existsSync(script) ? readFileSync(script, 'utf8') : script


    return new Promise(async (resolve, reject) => {
        try {
            const dom = await new JSDOM(template, { runScripts: "outside-only", url: host + url })
            shimDom(dom)

            if (eventName) {
                const eventTimeout = setTimeout(() => {
                    if (dom.window._document) {
                        console.log(`${url} Waited for the event "${eventName}", but timed out after ${timeout} ms.`);
                        resolveHtml()
                    }
                }, timeout)
                dom.window.addEventListener(eventName, resolveHtml)
                dom.window.addEventListener(eventName, () => clearTimeout(eventTimeout))
            }
            await beforeEval(dom)
            stampWindow(dom)
            dom.window.eval(script)
            if (!eventName)
                resolveHtml()

            function resolveHtml() {
                afterEval(dom)
                const html = dom.serialize()
                resolve(html)
                dom.window.close()
                if (!silent) console.log(`${url} - ${Date.now() - start}ms ${(inlineDynamicImports && dev) ? '(rebuilt bundle)' : ''}`)
            }
        } catch (err) { handleError(err, url) }
    })
}

function handleError(err, url) {
    console.log('url:', url)
    throw Error(err)
}

async function resolveScript(script, dev) {
    const bundlePath = getBundlePath(script)

    if (!existsSync(bundlePath) || dev) {
        const { build } = require('esbuild')
        await build({ entryPoints: [script], outfile: bundlePath, bundle: true })
    }
    return readFileSync(bundlePath, 'utf-8')
}

function shimDom(dom) {
    dom.window.rendering = true;
    dom.window.alert = (_msg) => { };
    dom.window.scrollTo = () => { }
    dom.window.requestAnimationFrame = () => { }
    dom.window.cancelAnimationFrame = () => { }
    dom.window.TextEncoder = TextEncoder
    dom.window.TextDecoder = TextDecoder
    dom.window.fetch = fetch
}

function stampWindow(dom) {
    const scriptElem = dom.window.document.createElement('script')
    scriptElem.innerHTML = 'window.__ssrRendered = true'
    dom.window.__ssrRendered = true
    dom.window.document.head.appendChild(scriptElem)
}

/**
 * @typedef {object} Config
 * @prop {string} host hostname to use while rendering. Defaults to http://jsdom.ssr
 * @prop {string} eventName event to wait for before rendering app. Defaults to 'app-loaded'
 * @prop {Eval} beforeEval Executed before script is evaluated.
 * @prop {Eval} afterEval Executed after script is evaluated.
 * @prop {boolean} silent Don't print timestamps
 * @prop {boolean} inlineDynamicImports required for apps with dynamic imports
 * @prop {number} timeout required for apps with dynamic imports
 * @prop {boolean} dev disables caching of inlinedDynamicImports bundle
 */

/**
 * Called before/after the app script is evaluated
 * @callback Eval
 * @param {object} dom The DOM object
 **/