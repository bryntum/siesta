Siesta common concepts
======================

This guide contains the common basic concepts about Siesta tests. It does not target any specific execution environment, like browser or Node.js, instead it assumes plain EcmaScript setup.

For additional, more advanced information, please refer to the [[SiestaTestAdvancedGuide|Siesta test advanced]] guide


Tests and assertions
====================

Siesta test is a regular JavaScript file. By convention, it should have `*.t.js` extension. This is in order to be able to distinguish the test files from other JavaScript source files.

All test files of a certain project are called "test suite". Test suite is usually placed in the `tests` directory of your project, however this is not enforced and up to the user. Some users prefer to place the test files near the corresponding source files. Choose what is most appropriate for your needs.

Test file is structured as a tree. The "parent" nodes of the tree are called "test sections" or "sub-tests". They are created using the [["src/siesta/test/Test".it|it]] call. 

The 1st argument of the `it` call is a configuration object for test [[TestDescriptor|descriptor]]. In the simplest form it's a string, containing the title of the test. It can also be an object with various configuration options to customize the test behavior. The 2nd argument of the `it` call is a test function, it can be `async` if needed. The 1st argument, passed to every test function, is a [[Test]] instance, usually called `t` for brevity. 

The "leaf" nodes of the test file tree are called "assertions". "Assertion" is an arbitrary statement about the code or data being tested. It can be either true - *assertion pass*, or false - *assertion fail*. Assertion may have arbitrary meaning, ranging from very simple like "this variable is equal to that variable", to complex and domain specific: "this instance of `EventEmitter` will fire this event exactly N times during the following X milliseconds".

To create an assertion, one should call an assertion method of the [[Test]] instance. Every assertion method accepts an optional `description` argument, which will be used in the output log.

For example, the simplest Siesta assertion is [[Test.true|true]], which is equivalent of saying - "the value received by the `t.true()` is truthy". 

Let's check out what it all looks like:
```javascript
import { it } from "siesta/index.js"

it('Test section', async t => {
    t.it('Nested test section', async t => {
        t.true(true, "That's true")
    })
})
```

For the full list of available assertions please refer to the [[Test]] class documentation. Note, that [[Test]] is a class for isomorphic, cross-platform code, there are also test classes for specific environment, like [[TestBrowser]], [[TestNodejs]], [[TestDeno]]. These specific test classes may add additional assertions.

Siesta also supports the so-called "BDD expectations syntax", for creating assertions. In this syntax, assertion consists from the 2 chained calls. The 1st call is [[Test.expect|t.expect(receivedValue)]]` which should be provided with the "received" value. This call returns an instance of [[Expectation]]. The 2nd call, chained with the 1st, is called on that instance, and it creates an actual assertion in the test.

For example:
```javascript
import { it } from "siesta/index.js"

it('Creating assertions using BDD expectations syntax', async t => {
    t.expect([ 1, 2, 3 ]).toEqual([ 3, 2, 1 ])
    
    t.expect(() => {}).not.toThrow()
})
```

For the full list of available expectations, please refer to the [[Expectation]] class documentation.

COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
