#!/usr/bin/env node
const ssr = require('../ssr').ssr
const process = require('process');

try {
  ssr(`
<html><head></head><body><canvas></canvas></body></html>`,`

    (function() {
      const div = document.createElement('div');
      div.classList.add('loaded')
      document.body.appendChild(div); 
      dispatchEvent(new CustomEvent("app-loaded")) 
    })();
`,
    '/').then(html => {
    const expectedOutput = '<html><head><meta data-render="ssr"></head><body><canvas></canvas><div class="loaded"></div></body></html>';
    if(html !== expectedOutput) {
      console.error(`output differs from expectation: \n expected:\t${expectedOutput}\n actual:\t${html} `)
      process.exit(1);
    }
    process.exit(0);
  }).catch(e => {
    console.error('ssr promise error',e);
    process.exit(1);
  })
} catch(e) {
  console.error('ssr call error',e);
  process.exit(1);
}
