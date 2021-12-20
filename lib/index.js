import { readFileSync } from "fs";
import { dirname } from "path";
import { resolve } from "path";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

/** @type {AllOptions} */
const defaults = {
  url: null,
  host: "http://localhost",
  htmlFile: null,
  html: null,
  rootDir: null,
  eventName: null,
  localScriptPatterns: [/^\//],
  ignoreAsyncComplete: null,
  timeout: 5000,
  executeMode: "native",
  eval: async () => {
    // const scriptElem = document.createElement("script");
    // scriptElem.innerHTML = "window.__ssrRendered = true";
    // document.head.appendChild(scriptElem);
    // global.window["__ssrRendered"] = true;
    await new Promise((res) => setTimeout(res, 200));
  },
  evalFile: null,
};

/** @typedef {Partial<AllOptions>} Options */

/**
 * @typedef {object} AllOptions
 * @prop {string} htmlFile path to index.html
 * @prop {string} html index.html
 * @prop {string} url url to render HTML for
 * @prop {string} host http://localhost
 * @prop {string} rootDir parent dir of index.html
 * @prop {(string|RegExp)[]} localScriptPatterns scripts that should be resolved from rootDir
 * @prop {string} eventName event to wait for before returning HTML
 * @prop {boolean} ignoreAsyncComplete
 * @prop {'sideload'|'native'|'none'} executeMode
 * @prop {function} eval
 * @prop {string} evalFile
 * @prop {number} timeout
 * @prop {function(Document):any} eval
 */

/**
 * @param {Options} options
 * @returns {AllOptions}
 */
const normalizeOptions = (options) => {
  const _options = { ...defaults, ...options };
  return {
    ..._options,
    rootDir: _options.rootDir || (_options.htmlFile && dirname(_options.htmlFile)),
    html: _options.html || readFileSync(_options.htmlFile, "utf-8"),
  };
};

export const sideloadScripts = (rootDir) => {
  if (!rootDir) throw new Error("cannot evaluate scripts without rootDir");
  const scripts = document.getElementsByTagName("script");
  const promises = [...scripts].map((script) =>
    script.src ? import(`file://${resolve(rootDir)}/${script.src}`) : eval(script.innerHTML)
  );
  return Promise.all(promises);
};

/**
 * @param {AllOptions} options
 */
const isReady = async (options) => {
  const { eventName, ignoreAsyncComplete } = options;
  let timeout;
  const promises = [
    new Promise((res) => window.addEventListener(eventName, res)),
    new Promise((res) => (timeout = setTimeout(res, options.timeout))),
    !ignoreAsyncComplete && window.happyDOM.whenAsyncComplete(),
  ];

  await Promise.any(promises);
  await new Promise(res => setTimeout(res, 500))
  clearTimeout(timeout);
};

/**
 * @param {Options} input
 */
export const render = async (input) => {
  const options = normalizeOptions(input);
  const { url, rootDir, executeMode, evalFile, eval: _eval, localScriptPatterns, html } = options;

  GlobalRegistrator.register();
  // GlobalRegistrator.unregister();

  patchFetch()
  // if (localScriptPatterns.length) patchFetch(options.rootDir, localScriptPatterns);

  window.location.href = options.host + url;
  console.log("foo0", executeMode);
  if (executeMode === "native") document.write(html);
  else document.body.parentElement.innerHTML = html;
  console.log("foo1");
  if (executeMode === "sideload") await sideloadScripts(rootDir);
  console.log("foo2");
  if (evalFile) import(evalFile);
  console.log("foo3");
  if (_eval) await _eval(document);
  console.log("foo4");
  await isReady(options);
  return document.body.parentElement.innerHTML;
};

export const patchFetch = (rootDir, localScriptPatterns) => {
  console.log("patchFetch");
  const originalFetch = global.fetch;

  /** @type {import('node-fetch')['default']} */
  global.fetch = async (request, options) => {
    console.log('fetching', localScriptPatterns)
    const url = request.toString();
    const matchesPattern = localScriptPatterns.some((pattern) => url.match(pattern));
    if (matchesPattern) {
      return {
        json: async () => readFileSync(rootDir + "/" + url),
        text: async () => readFileSync(rootDir + "/" + url),
      };
    } else return originalFetch(request, options);
  };
};
