#!/usr/bin/env node
const ssr = require('../tossr').tossr
const process = require('process');

const script = (function () {
  const div = document.createElement('div');
  div.classList.add(window['_myclass'])
  document.body.appendChild(div);
  dispatchEvent(new CustomEvent("app-loaded"))
}).toString()


try {
  ssr(`
<html><head></head><body><canvas></canvas></body></html>`,
    `(${script})()`,
    '/', {
    beforeEval: dom => dom.window._myclass = 'passed-var'
  }).then(html => {
    const expectedOutput = '<html><head><script>window.__ssrRendered = true</script></head><body><canvas></canvas><div class="passed-var"></div></body></html>';
    if (html !== expectedOutput) {
      console.error(`output differs from expectation: \n expected:\t${expectedOutput}\n actual:\t${html} `)
      process.exit(1);
    }
    process.exit(0);
  }).catch(e => {
    console.error('ssr promise error', e);
    process.exit(1);
  })
} catch (e) {
  console.error('ssr call error', e);
  process.exit(1);
}
