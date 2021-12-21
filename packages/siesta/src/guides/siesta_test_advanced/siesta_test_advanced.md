Siesta common concepts
======================

This guide contains the more advanced concepts about Siesta tests. It does not target any specific execution environment, like browser or Node.js, instead it assumes plain EcmaScript setup.

For introductory information, please refer to the [[SiestaTestBasicsGuide|Siesta test basics]] guide.

Testing asynchronous code
===================

In the simplest form, when testing the asynchronous code, you can just make your test function `async` and use `await` where needed:

```javascript
import { it } from "@bryntum/siesta/index.js"
import { MyClass } from "my-lib"

it('Testing promise-based asynchronous code', async t => {
    const myClass       = new MyClass()
    
    await myClass.asyncMethod('do something')
})
```

Sometimes, for example if code is using callbacks, you might not have the `Promise` instance to `await` for. In such case, use a pair of
[[Test.beginAsync|beginAsync]]/[[Test.endAsync|endAsync]] calls to indicate the beginning/ending of the asynchronous "gap" in the code flow.
Siesta will await for all [[Test.beginAsync|beginAsync]] calls to complete with the corresponding [[Test.endAsync|endAsync]] call, before finalizing the test. If the asynchronous gap does not end within [[TestDescriptor.defaultTimeout]] time, it is finalized forcefully and failed assertion added to the test.

For example:
```javascript
import { it } from "@bryntum/siesta/index.js"
import { MyClass } from "my-lib"

it('Testing callbacks-based asynchronous code', t => {
    const myClass        = new MyClass()

    // indicate async gap starts, test will remain active till
    // `endAsync()` call (but no longer than defatul timeout)
    const gap           = t.beginAsync()

    myClass.asyncMethodWithCallback(() => {
        // indicate async gap completes
        t.endAsync(gap)
    })
})
```


Tests configuration
===================

The configuration object of the nested test section "extends" the configuration object of the parent section. 

For example if parent section sets the [[TestDescriptor.defaultTimeout|defaultTimeout]] to a certain value, the nested section 
will use that value too.

```javascript
import { it } from "@bryntum/siesta/index.js"

it({ title : 'Test section', defaultTimeout : 1000 }, async t => {
    t.it('Nested test section', async t => {
        // will fail within 1s
        await t.waitFor(() => false)
    })
})
```

Exceptions
==========

If you need to verify that some function throws the exception, use the [[Test.throws|throws]] assertion.
In the similar way, to verify that function does not throw exception, there's [[Test.doesNotThrow|doesNotThrow]]. 

Also, the test code may throw some unexpected exception. If it is thrown from the test function, it is caught 
and reported in the test results log. This is also true for the promise rejections in the `async` test function 
code flow. These are "normal" exceptions, since they can be caught with the `try/catch` block on the test function.

For example:
```javascript
import { it } from "@bryntum/siesta/index.js"

it('Test section', async t => {
    // "normal" exception
    throw new Error("I'm exceptional")
})
```

However, test code may throw exception in the way, that it can not be caught using `try/catch` on the test function.
This is the case for example, if exception is thrown in `setTimeout` handler, or if the new `Promise` instance,
not included in the test function code flow, is rejected.

For example:
```javascript
import { it } from "@bryntum/siesta/index.js"

it('Test section 1', async t => {
    setTimeout(() => {
        // exception is thrown after 3s, 
        // there might be some other test running by that time
        throw new Error('Oh, no')
    }, 3000)
})

it('Test section 1', async t => {
    // promise outside of the test function code flow
    new Promise((resolve, reject) => {
        setTimeout(reject, 3000)
    })
})
```

These are so called "unhandled" exceptions/rejections. If environment supports that (browsers and Node.js do, Deno doesn't), 
Siesta tracks such "unhandled" exceptions and report them *in the results log of the currently running test*. 
That might not be a test that was the cause of the exception! Unfortunately there's no easy way to determine
the test that caused the "unhandled" exception. We might revisit this topic in the following releases.


Logging
=======

The [[Test]] class implements several logging methods:
- [[Test.error]]
- [[Test.warn]]
- [[Test.log]]
- [[Test.debug]]
- [[Test.info]]

One can use them to report some useful information from test.

Note, that only the log messages which are at the current log level (or higher) are reported. The current log level is determined with the
`--log-level` command line option. By default its `warn`


Console and stdout/stderr output
================================

If test performs calls to console, like `console.log()` or writes to `stdout/stderr`, Siesta intercepts such calls/writes
and routes them into the test log. 


Project
========

If you want to provide configuration for the whole test suite, you need to create a [[SiestaProjectGuide|Siesta project]].


Reports
=======

You might want to receive the results of the test suite execution in some structured format for your own processing.
Siesta can generate reports in JSON, JUnit and HTML formats.

See the [[ReportsGuide|Reports guide]].



COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
