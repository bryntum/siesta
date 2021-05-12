Getting started with Siesta in browser environment
================================================

Siesta is a stress-free JavaScript/TypeScript testing tool. It is ubiquitous - tests can be run in browsers, Node.js and Deno, on Linux, macOS and Windows.

In this guide, we assume a setup, pointed toward running tests in browsers.

Siesta supports modern, ever-green browsers only - Chrome, Firefox, Safari and Chromium Edge. IE and legacy Edge are not supported.

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

Siesta runs the browser tests right in the browser. This means, your test file is imported directly on the web page, and it has full access to the page. There's no need to use the asynchronous `evaluate` command as commonly seen in tools like Playwright, Puppeteer and Selenium. 

Such architecture means that test script can create and manipulate arbitrary DOM, using the regular Web API. For example, test can render some Web component and then check that its DOM object is properly created with the `document.querySelector()` call.

However, test script will not survive the page redirect or reload. You should avoid doing that. In the future release we will allow running the script in the side iframe, which will survive the redirects of the testing page.

If you need to test the page redirects, then instead [[GettingStartedNodejsGuide|write your tests as Node.js scripts]] and use the "classic" Puppeteer or Playwright API to create the page instance and `evalulate` command of those libraries. In the future releases, we'll provide an unified API for both on-page and out-of-page testing scenarios.


Importing API
=============

When targeting browser environment for running tests, import the Siesta API from the `siesta/browser.js` entry file.


Launching individual test
===============

Currently, Siesta does not perform any code transpilation to enable the support for the bare-word import identifiers, like: `import { it } from "siesta/browser.js"`

It is assumed, that you use the [import maps](https://github.com/WICG/import-maps).

Let's assume we have the following Siesta test file, called `basic_test.t.js`, which is available on the web URL as `http://localhost/my_project/tests/basic_test.t.js`. 

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
npx siesta http://localhost/my_project/tests/basic_test.t.js --brower firefox
```

You should see something like:
![Launching test directly](media://getting_started_browser/getting_started_browser_1.jpg)


Launching test suite
====================

To launch the whole test suite, one need to create the [[SiestaProjectGuide|Siesta project]].


Debugging
=========

To debug the browser test, launch it, with additional option `--headless=false`: 

```shell
npx siesta http://localhost/my_project/tests/basic_test.t.js --brower firefox --headless=false
```


COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
