const { JSDOM } = require('jsdom')
const fs = require('fs')
const fetch = require('node-fetch')

const defaults = {
    host: 'http://jsdom.ssr',
    eventName: 'app-loaded',
    beforeEval() { },
    afterEval() { },
    meta: { 'data-render': 'ssr' }
}

/**
 * Called before the app script is evaluated
 * @async
 * @name beforeEval
 * @function
 * @param {object} dom The DOM object
*/

/**
 * Called after the app script is evaluated
 * @name afterEval
 * @function
 * @param {object} dom The DOM object
*/

/**
 * Renders an HTML page from a HTML template, an app bundle and a path
 *
 * @async
 * @param {string} template Html template (or path to a HTML template).
 * @param {string} script Bundled JS app (or path to bundled bundle JS app).
 * @param {string} url Path to render. Ie. /blog/breathing-oxygen-linked-to-staying-alive
 * @param {object=} options Options
 * @param {string=} options.host hostname to use while rendering. Defaults to http://jsdom.ssr
 * @param {string=} options.eventName event to wait for before rendering app. Defaults to 'app-loaded'
 * @param {domFn=} options.beforeEval Executed before script is evaluated.
 * @param {domFn=} options.afterEval Executed after script is evaluated.
 * @param {object=} options.meta Metadata to be applied to the HTML element. Defaults to { 'data-render': 'ssr' }
 * @returns {string}
 */
module.exports.ssr = async function ssr(template, script, url, options) {
    const start = Date.now()
    const { host, eventName, beforeEval, afterEval, meta } = { ...defaults, ...options }

    // is this the file or the path to the file?
    template = fs.existsSync(template) ? fs.readFileSync(template, 'utf8') : template
    script = fs.existsSync(script) ? fs.readFileSync(script, 'utf8') : script

    return new Promise(async (resolve, reject) => {
        try {
            const dom = await new JSDOM(template, { runScripts: "outside-only", url: host + url })
            dom.window.scrollTo = () => { }
            dom.window.requestAnimationFrame = () => { }
            dom.window.cancelAnimationFrame = () => { }
            dom.window.fetch = fetch
            dom.window.addEventListener(eventName, async () => {
                afterEval(dom)
                const html = dom.serialize()
                resolve(html)
                dom.window.close()
                console.log(`${url} - ${Date.now() - start}ms`)
            })
            await beforeEval(dom)
            if (meta) setMeta(dom, meta)
            dom.window.eval(script)
        } catch (err) { handleError(err, url) }
    })
}

function setMeta(dom, meta) {
    const metaElem = dom.window.document.createElement('meta')
    Object.entries(meta).forEach(([key, value]) => {
        metaElem.setAttribute(key, value)
    })
    dom.window.document.getElementsByTagName('head')[0].appendChild(metaElem)
}

function handleError(err, url) {
    console.log('url:', url)
    throw Error(err)
}