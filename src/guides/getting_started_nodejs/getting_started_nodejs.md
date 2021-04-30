Getting started with Siesta in Node.js environment
================================================

Siesta is a stress-free JavaScript/TypeScript testing tool. It is ubiquitous - tests can be run in browsers, Node.js and Deno,
on Linux, MacOS and Windows.

In this guide, we assume a setup, pointed toward running tests in Node.js. 

For the setup, targeting browser environment, please refer to this guide <Getting started with Siesta in browser environment>.

Installation
============

For Node.js:
```shell
npm install @bryntum/siesta --save-dev
```

Tests and assertions
====================

Siesta test is a regular JavaScript file. By convention, it has `*.t.js` extension. Let's check how it looks:

```javascript
import { it } from "nodejs.js"

it('Basic Siesta Node.js test', async t => {
    t.true(true, "That's true")

    t.true(false, "That's not true")
})


it('Deep equality should work', async t => {
    t.equal([1, 2, 3], [3, 2, 1], "Arrays are deeply equal")

    t.expect(
        {receivedKey : 'receivedValue', commonKey : 'commonValue'}
    ).toEqual(
        {expectedKey : 'expectedValue', commonKey : 'commonValue'}
    )
})
```

The test file is structured using the `it` sections, which are called sub-tests. 
The 2nd argument for every the `it` call is a test function (which can be `async`), and the 1st argument
of that function is a [test](LINK TO TEST CLASS) instance, usually called `t` for brevity.

`it` sections can be nested.

Using the *assertion* methods of the test instance, one can make various statements about the code, 
which can be either truthy (we say *assertion pass*) or false (*assertion fail*). 
Assertion may have arbitrary meaning, ranging from very simple like "this variable is equal to that variable", 
to complex and domain specific: "this instance of `EventEmitter` will fire this event exactly N times during the following X milliseconds".

Siesta also supports the so-called "expectations syntax", where assertion consists from 2 chained calls. 
The 1st call is `t.expect(receivedValue)` which should be provided with the actual, "received" value,
and the 2nd call, chained with the 1st, is some specific assertion. 
 
Now that we have a test file, we can launch it, as a regular Node.js script:

```shell
node tests/basic/basic_test.t.js
```

You should see something like:
![Launching test directly](getting_started_nodejs_1.jpg)


COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
