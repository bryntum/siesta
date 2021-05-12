Getting started with Siesta in Node.js environment
================================================

Siesta is a stress-free JavaScript/TypeScript testing tool. It is ubiquitous - tests can be run in browsers, Node.js and Deno, on Linux, macOS and Windows.

In this guide, we assume a setup, pointed toward running tests in Node.js. 

Siesta supports all maintained LTS releases of Node.js.

Installation
============

```shell
npm install @bryntum/siesta --save-dev
```

Basics
======

To familiarize yourself with the basic Siesta concepts, which are common for all execution environments, please check the [[SiestaTestBasicsGuide|Siesta test basics]] guide. 


Importing API
=============

When targeting Node.js environment for running tests, import the Siesta API from the `siesta/nodejs.js` entry file.


Launching individual test
===============

Let's assume we have the following Siesta test file, called `basic_test.t.js`.

```javascript
import { it } from "siesta/nodejs.js"

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

We can launch it, as a regular Node.js script:

```shell
node tests/basic/basic_test.t.js
```

You should see something like:
![Launching test directly](media://getting_started_nodejs/getting_started_nodejs_1.jpg)


Launching several tests
===============

To launch several tests, you need to use the Siesta launcher. Siesta launcher is an executable file, called `siesta`. Usually to access it in your local package installation, you use the `npx` command, provided by the `npm` package manager: 

```shell
npx siesta --help
```

To launch several tests, pass a matching glob pattern as the 1st argument for the launcher. It can be also a directory name, in such case Siesta will pick up all `*.t.m?js` files in it. To resolve the glob pattern, Siesta uses the [glob](https://www.npmjs.com/package/glob) npm library, please refer to its documentation for details on globs resolution. 

Some examples:

Launch all tests in `tests` directory:
```shell
npx siesta tests
```

Launch all tests in `tests` directory, with custom extension:
```shell
npx siesta tests/**/*.test.js
```

Launch all tests in `tests` directory, which have characters `1` or `2` in their names:
```shell
npx siesta tests/**/*@(1|2)*.t.js
```


Debugging
=========

You can debug a Siesta test as any other regular Node.js script. For that, place the `debugger` statement somewhere in the test code and then start the test with the `--inspect-brk` option. Note, that due to [this issue](https://github.com/nodejs/node/issues/25215), starting your test with just `--inspect` may result in your breakpoint being ignored. 

Then open the console in any Chrome tab and click the "Dedicated DevTools for Node.js" icon in the bottom-left.


Further reading
===============

Configuring the test suite: [[SiestaProjectGuide|Siesta project]] guide


COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
