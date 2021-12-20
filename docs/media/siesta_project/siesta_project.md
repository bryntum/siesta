Siesta project
==============

As you might already know from the other guides, individual Siesta test files can be launched directly as JavaScript executable files, and Siesta can launch a group of tests, matching a glob, or directory of tests. This might be enough for simple projects. For more complex projects one may need to fine-tune the configuration options for the whole test suite, or may be for the group of test in it. This of course can always be done inside the individual test files, however repeating the same code is tiresome and violates the DRY principle. That is why, for such configuration needs, one can create Siesta project.

Siesta project is a regular JavaScript file. It does not have any convention for its name or extension. It is usually placed in the root of the `tests` directory. At Bryntum, we often call the project file `index.js`

Essentially, project file is simply a configuration file for the test suite. Having it in the form of JavaScript, instead of JSON, has an advantage, that one can perform the configuration *dynamically*, using all expression power of the language. For example, project can perform some feature testing and based on its results, decide to skip certain group of tests, or tweak the configuration.

What makes it possible, is that project file is always executed in the same environment as the test suite itself. For example, your test suite is targeting a browser environment. If you launch the project file from the command line, it will still be executed in the chosen browser, and the dynamic configuration will happen in the same environment. 

Project file should perform 3 main actions:
1. Create and configure the instance of the [[Project]] class and the global [[Project.testDescriptor|testDescriptor]]
2. Create the project execution *plan*
3. Start the project

A simple project file for Node.js test suite may look like this:

```javascript
import { Project } from "@bryntum/siesta/nodejs.js"

// STEP 1
const project = Project.new({
    // config option of the project instance
    title                   : 'Awesome Node.js project test suite',
    
    // global "test descriptor", all other tests in the suite "inherit" from it
    testDescriptor          : {
        defaultTimeout          : 30000
    }
})

// STEP 2 - default behaviour
project.planDir('.')

// STEP 3
project.start()
```

More about every step below.

1. Creating and configuring the project instance
-------------------------

```javascript
import { Project } from "@bryntum/siesta/nodejs.js"

// STEP 1
const project = Project.new({
    // config option of the project instance
    title                   : 'Awesome Node.js project test suite',
    
    // global "test descriptor", all other tests in the suite "extends" it
    testDescriptor          : {
        defaultTimeout          : 30000
    }
})
```

In this step, we create an instance of the [[ProjectNodejs]] class, which is exported as `Project` from the `@bryntum/siesta/nodejs.js`. We do that using the static constructor method [[ProjectNodejs.new]], which accepts a single configuration object, with properties, corresponding to the class attributes.

For browsers, we should import from the `@bryntum/siesta/browser.js` entry file.
For Deno, we should import from the `https://cdn.jsdelivr.net/npm/@bryntum/siesta@latest/deno.js` entry file.

There are few configuration options for the project itself, like [[ProjectNodejs.title|title]] and a [[ProjectNodejs.testDescriptor|testDescriptor]] config, which contains the configuration object for the top-level [[TestDescriptor]] instance. All other tests in the test suite will "extend" this descriptor ("inherit" from it). For example, if the top-level descriptor contains certain value for the [[TestDescriptor.defaultTimeout|defaultTimeout]] config, then all tests will use that value, unless they explicitly override it.

The project instance should be created synchronously in the top-level scope of the module.

Creating the project execution plan, Node.js/Deno environment
-------------------------

Project plan is a collection of tests to be run. It is structured as a tree, usually reflecting the file system. The "parent" nodes in this tree corresponds to directories and "leaf" nodes - to test files.

Test files can be included into the plan with the following project methods: [[ProjectNodejs.planFile|planFile]], [[ProjectNodejs.planDir|planDir]], [[ProjectNodejs.planGlob|planGlob]]. **All paths, passed to those methods are resolved relative to the project file**.

Test files can be excluded from the plan with the following project methods: [[ProjectNodejs.excludeFile|excludeFile]], [[ProjectNodejs.excludeDir|excludeDir]], [[ProjectNodejs.excludeGlob|excludeGlob]]. 

Note, that the abovementioned methods works as "imperative instruction" instead of as "declaration rules". This is the most flexible approach, but it may produce unexpected results if you will think of these methods as "declaration rules". For example if you added a directory into the plan, excluded some file from it and then added a glob-matching group of tests, which includes that file - that file will be included again, despite the `excludeFile` call. The solution in this case is simply to run the [[ProjectNodejs.excludeFile|excludeFile]] method last, after adding everything.

```javascript
// include the directory
project.planDir('tests/featureX')
// exclude some file from it
project.excludeFile('tests/featureX/testY.t.js')
// include all tests matching glob - this will include the `tests/featureX/testY.t.js` file again,
// despite the `excludeFile` call above
project.planGlob('tests/feature*/**/*.t.js')
```

If none of the planning methods have been called, Siesta will include all tests files in the project file directory, which is equivalent of:

```javascript
project.planDir('.')
```

The project planning step may happen asynchronously, ie you can call some asynchronous methods to decide what to include and with which configuration.

Creating the project execution plan, browser environment
-------------------------

Currently, Siesta projects, targeting browser environment, don't have access to file system and thus, need to list all the test files manually, using the [[Project.plan]] method. This is because Siesta supports running the browser suite entirely in browser, w/o involving any OS process. We plan to remove this limitation in one of the future releases, by introducing special kind of browser projects, that can be launched via launcher only. 

Starting the project
------------

As simple as:

```javascript
project.start()
```

Launching the project
=====================

To launch the project, targeting Node.js and Deno environments, one can directly launch the project file itself, as regular JavaScript executable:

For Node.js:
```shell
node tests/index.js
```

For Deno (note the `--allow-read --allow-env --allow-net --unstable` flags are required for permissions/WebWorker feature and `--quiet` is needed because the `check file://` diagnostic messages [breaks the dynamic output formatting](https://github.com/denoland/deno/issues/10558)), we also recommend to use `--no-check` for speed:
```shell
deno run --allow-read --allow-env --allow-net --unstable --quiet --no-check tests/index.js
```

One can also use the Siesta launcher executable and pass the path/URL to the project file to it. This method works for all target environments:

Node.js, targeting Node.js:
```shell
npx siesta tests/index.js
```

Deno, targeting Deno (assuming using the installed executable):
```shell
siesta tests/index.js
```

Targeting browsers is supported only for the Node.js launcher. The url of the project should start with `http:/https:` - this is what triggers execution in browser.

Node.js, targeting browser:
```shell
npx siesta http://localhost/my_project/tests/index.js 
```

By default, tests are launched in Chrome. The `--browser` config specifies the browser to use, supported values are: `chrome`, `firefox`, `edge` (currently equals to `chrome`) and `safari` (uses webkit target of Playwright).

```shell
npx siesta http://localhost/my_project/tests/index.js --browser firefox 
```


COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
