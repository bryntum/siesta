Getting started with Siesta in Node.js environment
================================================

Siesta is a stress-free JavaScript/TypeScript testing tool. It is ubiquitous - tests can be run in browsers, Node.js and Deno, on Linux, macOS and Windows.

In this guide, we assume a setup, pointed toward running tests in Node.js. 

For the setup, targeting browser environment, please refer to this guide <Getting started with Siesta in browser environment>.

Installation
============

```shell
npm install @bryntum/siesta --save-dev
```

Tests and assertions
====================

Siesta test is a regular JavaScript file. By convention, it has `*.t.js` extension. Let's check how it looks:

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

The test file is structured into separate sections, using the `it` call. These sections are called "sub-tests". The 2nd argument for every the `it` call is a test function (which can be `async`), and the 1st argument of that function is a [[TestNodejs]] instance, usually called `t` for brevity.

`it` sections can be nested.

Using the *assertion* methods of the test instance, one can make various statements about the code, which can be either truthy (we say *assertion pass*) or false (*assertion fail*). Assertion may have arbitrary meaning, ranging from very simple like "this variable is equal to that variable", to complex and domain specific: "this instance of `EventEmitter` will fire this event exactly N times during the following X milliseconds".

For example, the simplest Siesta assertion is [[TestNodejs.true]], which is equivalent of saying - "the value received by the `t.true()` is truthy"

Siesta also supports the so-called "BDD expectations syntax", where assertion consists from 2 chained calls. The 1st call is [[TestNodejs.expect|t.expect(receivedValue)]]` which should be provided with the actual, "received" value, and the 2nd call, chained with the 1st, is an actual assertion,
like [[Expectation.toEqual|toEqual]] in the example above. 
 
For the full list of available assertions please refer to the [[TestNodejs]] class documentation. For the full list of available expectations,
please refer to the [[Expectation]] class documentation.

Now that we have a test file, we can launch it, as a regular Node.js script:

```shell
node tests/basic/basic_test.t.js
```

You should see something like:
![Launching test directly](media://getting_started_nodejs/getting_started_nodejs_1.jpg)


Launcher
========

Being able to launch a single test file may be enough for the simplest projects. However, any non-trivial code will require more than one test file. To launch several test files, one can use the Siesta launcher.  

Siesta launcher is an executable file, called `siesta`. Usually to access it in your local package installation, you use the `npx` command: 

```shell
npx siesta
```



Takeaways
=========

* Siesta test is a regular JavaScript file, by convention with the `*.t.js` extension. 
Siesta tests are organized as tree, `it` section are "parent" nodes and assertions are leaves. 
* Assertion is an arbitrary statement about the code.
* You can launch any Siesta test file directly, as regular Node.js script.



COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
