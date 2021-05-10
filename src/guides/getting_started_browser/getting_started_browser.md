Getting started with Siesta in browser environment
================================================

Siesta is a stress-free JavaScript/TypeScript testing tool. It is ubiquitous - tests can be run in browsers, Node.js and Deno, on Linux, macOS and Windows.

In this guide, we assume a setup, pointed toward running tests in browsers. 

Installation
============

Running tests in browsers is supported with the Node.js launcher, so Siesta should be installed via `npm` package manager:

```shell
npm install @bryntum/siesta --save-dev
```

You should be able to run the Siesta launcher after installation using the `npx` command:

```shell
npx siesta --help
```

Basics
======

To familiarize yourself with the basic Siesta concepts, which are common for all execution environments, please check the [[SiestaTestBasicsGuide|Siesta test basics]] guide. 

Importing API
=============

When targeting Deno environment for running tests, import the Siesta API from the `siesta/browser.js` entry file.


Launching individual test
===============

Let's assume we have the following Siesta test file, called `basic_test.t.js`, which is available on the web URL as `http://localhost/my_project/tests/basic_test.t.js`

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
![Launching test directly](media://getting_started_nodejs/getting_started_browser_1.jpg)


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
