Getting started with Siesta in Deno environment
================================================

Siesta is a stress-free JavaScript/TypeScript testing tool. It is ubiquitous - tests can be run in browsers, Node.js and Deno, on Linux, macOS and Windows.

In this guide, we assume a setup, pointed toward running tests in [Deno](https://deno.land/). 

Installation
============

Note, that installer adds `--quiet` to the executable arguments. This is because the diagnostic messages breaks the dynamic output of the test reporter and there's no other way to intercept/suppress them.

```shell
deno install --name siesta --allow-read --allow-env --unstable --quiet https://deno.land/x/siesta/bin/siesta-deno.js
```

Basics
======

To familiarize yourself with the basic Siesta concepts, which are common for all execution environments, please check the [[SiestaTestBasicsGuide|Siesta test basics]] guide. 

Importing API
=============

When targeting Deno environment for running tests, import the Siesta API from the `https://deno.land/x/siesta/deno.js` entry file.


Launching individual test
===============

Let's assume we have the following Siesta test file, called `basic_test.t.js`.

```javascript
import { it } from "https://deno.land/x/siesta/deno.js"

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

We can launch it, as a regular Deno script with some additional permissions:

```shell
deno run --allow-read --allow-env tests/basic/basic_test.t.js
```

You should see something like:
![Launching test directly](media://getting_started_nodejs/getting_started_deno_1.jpg)


Launching several tests
===============

To launch several tests, you need to use the Siesta launcher, installed at the "Installation" step above:

```shell
siesta --help
```

To launch several tests, pass a matching glob pattern for them as the 1st argument for the launcher. It can be also a directory name, in such case Siesta will pick up all `*.t.m?js` files in it. To resolve the glob pattern, Siesta uses the [glob resolution](https://doc.deno.land/https/deno.land/std@0.95.0/path/glob.ts) from the Deno `std` library, please refer to its documentation for details. 

Some examples:

Launch all tests (`*.t.m?js` files) in `tests` directory:
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

You can debug a Siesta test as any other regular Deno script. For that, place the `debugger` statement somewhere in the test code and then start the test with the `--inspect-brk` option. Note, that due to [this issue](https://github.com/nodejs/node/issues/25215), starting your test with just `--inspect` may result in your breakpoint being ignored. 

Then open the console in any Chrome tab and click the "Dedicated DevTools" icon in the bottom-left.


Further reading
===============

Configuring the test suite: [[SiestaProjectGuide|Siesta project]] guide


COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
