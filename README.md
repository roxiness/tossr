# ssr

#### Universal SSR renderer

### Install
``npm i @sveltech/ssr``

### Usage example
```javascript
const { ssr } require('@sveltech/ssr')
const fs = require('fs')

const template = fs.readFileSync('./dist/index.html')
const script = fs.readFileSync('./dist/app.js')

ssr(template, script, '/blog/ssr-is-fun')
  .then(html => console.log(html + '<!--ssr rendered-->'))
```

### Important!

The HTML is only rendered after an ``app-loaded`` event has been emitted from the app.
```javascript
dispatchEvent(new CustomEvent('app-loaded'))
```

---

For more information, refer to the API documentation.
https://github.com/sveltech/ssr/wiki/API