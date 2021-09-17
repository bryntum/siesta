Getting started with Siesta in browser environment
================================================

Siesta is a stress-free JavaScript/TypeScript testing tool. It is ubiquitous - tests can be run in browsers, Node.js and Deno, on Linux, macOS and Windows.

In this guide, we assume a setup, pointed toward running tests in browsers.

Siesta supports modern, ever-green browsers only - Chrome, Firefox, Safari and Chromium Edge. IE, legacy Edge and quirks mode are not supported.

Currently, targeting browser environment in Siesta is work in progress. You can run tests in browsers just fine, however Siesta does not support yet the Web-specific functionality, like simulating the user actions. We'll be adding this functionality in the future releases. 

Installation
============

Running tests in browsers is supported with the Node.js launcher only, so Siesta should be installed via `npm` package manager:

```shell
npm install @bryntum/siesta --save-dev
```

You should be able to run the Siesta launcher after installation, using the `npx` command:

```shell
npx siesta --help
```

Basics
======

To familiarize yourself with the basic Siesta concepts, which are common for all execution environments, please check the [[SiestaTestBasicsGuide|Siesta test basics]] guide. 


Additional details
==================

Siesta runs the browser tests right on the browser page. This means, your test file has full access to the page and Web API. There's no need to use the asynchronous `evaluate` command as commonly seen in tools like Playwright, Puppeteer and Selenium. 

Such architecture means that test script can create and manipulate arbitrary DOM, using the regular Web API. For example, test can render some Web component and then check that its DOM object is properly created with the `document.querySelector()` call.

However, test script will not survive the page redirect or reload. You should avoid doing that. In the future release we will allow running the script in the side iframe, which will survive the same-domain redirects of the testing page.

If you need to test the page with arbitrary redirects, then instead [[GettingStartedNodejsGuide|write your tests as Node.js scripts]] and use the "classic" Puppeteer or Playwright API to create the page instance and `evalulate` command of those libraries. In the future releases, we'll provide an unified API for both on-page and out-of-page testing scenarios.


Importing API
=============

When targeting browser environment for running tests, import the Siesta API from the `siesta/browser.js` entry file.


Support for the bare import specifiers
=================================

Siesta itself is "transpilation" process agnostic and assumes native EcmaScript setup. However, Ecma spec does not define the behavior for the "bare import specifiers", like `import { it } from "siesta/browser.js"`. The proposed solution for it, [import maps](https://github.com/WICG/import-maps) is only [partially](https://github.com/WICG/import-maps/issues/235) supported in Chrome. 

This means that the bundler-free development is still the shiny future (not so far hopefully) and in the meantime, an extra transpilation step / development web server is needed. We recommend [Vite](https://vitejs.dev/) for this purpose, as a modern and very fast alternative to Webpack.

The example we made for a test suite targeting browsers, works with Vite with zero configuration. Yes, no Vite config is needed! This is kind of impressive, comparing how much hassle it can be with configuring the other bundling tools. See the `examples/browser`.

That example is very simple, it is possible that more complex apps will require certain configuration. It should no more than specifying the test files as entry points:

```javascript
/**
 * @type { import('vite').UserConfig }
 */
const config = {
    optimizeDeps    : {
        entries     : [
            './tests/index.js',
            './tests/**/*.t.js'
        ]
    }
}

export default config
```

Once you have this config in place, you can launch the development web server with: `npx vite`

Launching individual test
=========================

Let's assume we have the following Siesta test file, called `basic_test.t.js`, which is available on the web URL as `http://localhost:3000/tests/basic_test.t.js`. We assume Vite server running. 

```javascript
import { it } from "siesta/browser.js"

it('Basic Siesta test', async t => {
    t.true(true, "That's true")

    t.true(false, "That's not true")
})


it('Deep equality should work', async t => {
    t.equal([ 1, 2, 3 ], [ 3, 2, 1 ], "Arrays are deeply equal")

    t.expect(
        { receivedKey : 'receivedValue', commonKey : 'commonValue' }
    ).toEqual(
        { expectedKey : 'expectedValue', commonKey : 'commonValue' }
    )
})
```

We can launch it, by providing its url to the launcher. The `--browser` option defines in which browser to run the test. By default, its `chrome`.

```shell
npx siesta http://localhost:3000/my_project/tests/basic_test.t.js --brower firefox
```

You should see something like:
![Launching test directly](media://getting_started_browser/getting_started_browser_1.jpg)


Launching test suite
====================

To launch the whole test suite, one need to create the [[SiestaProjectGuide|Siesta project]].

Note, that currently, browser projects do not have the access to the file system and need to list all the test files manually, using the [[Project.plan]] method. This is to support the use case, of running the project fully in the browser, without relying on any OS process, which is convenient for debugging. In the future, we plan improve this.


Debugging
=========

To debug the browser test, place a `debugger` statement in it, then launch it as an individual test, with additional option `--headless=false`: 

```shell
npx siesta http://localhost/my_project/tests/basic_test.t.js --brower firefox --headless=false
```

Launcher will start the browser with the dev tools opened. 

COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
