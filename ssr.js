const { JSDOM } = require('jsdom')

module.exports.ssr = async function ssr(template, script, url, eventName = 'app-loaded') {
    url = url.replace(/^\/\.netlify\/functions\/get-html/, '')

    return new Promise(async (resolve, reject) => {
        try {
            const dom = await new JSDOM(template, { runScripts: "outside-only", url: 'http://jsdom.ssr' + url })
            dom.window.eval(script)
            dom.window.addEventListener(eventName, () => {
                const html = dom.serialize()
                dom.window.close()
                resolve(html)
            })
        } catch (err) {
            throw Error(err)
        }
    })
}