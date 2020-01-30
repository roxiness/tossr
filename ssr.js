const { JSDOM } = require('jsdom')
const fs = require('fs')

const defaults = {
    host: 'http://jsdom.ssr',
    eventName: 'app-loaded',
    beforeEval() { },
    afterEval() { },
    meta: { 'data-render': 'ssr' }
}

module.exports.ssr = async function ssr(template, script, url, options) {
    const { host, eventName, beforeEval, afterEval, meta } = { ...defaults, ...options }

    // is this the file or the path to the file?
    template = fs.existsSync(template) ? fs.readFileSync(template, 'utf8') : template
    script = fs.existsSync(script) ? fs.readFileSync(script, 'utf8') : script

    return new Promise(async (resolve, reject) => {
        try {
            const dom = await new JSDOM(template, { runScripts: "outside-only", url: host + url })
            dom.window.requestAnimationFrame = () => { }
            dom.window.addEventListener(eventName, async () => {
                afterEval(dom)
                const html = dom.serialize()
                dom.window.close()
                resolve(html)
            })
            await beforeEval(dom)
            if (meta) setMeta(dom, meta)
            dom.window.eval(script)
        } catch (err) {
            throw Error(err)
        }
    })
}

function setMeta(dom, meta) {
    const metaElem = dom.window.document.createElement('meta')
    Object.entries(meta).forEach(([key, value]) => {
        metaElem.setAttribute(key, value)
    })
    dom.window.document.getElementsByTagName('head')[0].appendChild(metaElem)
}