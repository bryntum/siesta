Code coverage with Siesta
==================

Code coverage report provides information about which parts of your codebase are actually executed while running your test suite.
It is said, that such code is "covered with tests". Code, that has not been executed while running the test suite, is called 
"uncovered". Basically, there are no tests for uncovered code.

The meaning of the code coverage information should not be overestimated. "Covered" code 
still can contain algorithmic bugs and errors. "Covered" code may not be exercised directly by the test logic, but
instead called as helper code (indirect coverage). 

So you can't say for sure, that "covered" code is 100% reliable and bugs free.

The only reliable information code coverage report provides is what code is *not* covered with tests at all.
Still, even this information is valuable. Definitely, all important parts of your codebase should not contain "uncovered" code. 


How it works
--------------

Siesta is using native `v8` code coverage information, which is very fast. This, however, means, that when running tests in browsers, 
code coverage will only work in Chrome. 

Siesta aims to provide just a thin integration level over the current state-of-art code coverage libraries (currently, 
these are [Istanbul/Nyc](https://github.com/istanbuljs/nyc) and [c8](https://github.com/bcoe/c8)). 
This is to be able to freely upgrade those libraries and stay up to date with their new features and bug fixes.

The code coverage reports are generated directly by the Istanbul library.


Collecting code coverage 
--------------

To enable the code coverage, specify the value for the `--coverage-reporter` command line option. It will enable the 
code coverage collection and generate a report, after the test suite has completed. Recognized values are the names of the Istanbul reporter packages, 
listed [here](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib).
Most often used ones are: `html`, `html-spa` and `text`. Note, that `text` report will just output the information to the `stdout` and not save it file.
This option can be repeated several times, resulting in several report generated. 

Other options for code coverage are:

- `--coverage-include` - The glob pattern for files to include for instrumentation, can be repeated several times. 
Globs are resolved using [minimatch](https://www.npmjs.com/package/minimatch) package, the better documentation can be found in 
[glob](https://www.npmjs.com/package/glob) package. Note, that a glob pattern like `*.some.js` will only match the root-level `*.some.js` files,
to match such files in all directories, specify it as `**/*.some.js`. By default, all files are included.

- `--coverage-exclude` - The glob pattern for files to exclude from instrumentation, can be repeated several times. Default value is: 
```
"coverage/**", "packages/*/test{,s}/**", "**/*.d.ts", "test{,s}/**", 
"test{,-*}.{js,cjs,mjs,ts,tsx,jsx}", 
"**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}", "**/__tests__/**", 
"**/{ava,babel,nyc}.config.{js,cjs,mjs}", "**/jest.config.{js,cjs,mjs,ts}",
"**/{karma,rollup,webpack}.config.js", "**/.{eslint,mocha}rc.{js,cjs}"]]
```
Note, that specifying a value for this option will override the default, except the exclusion of `node_modules` folder. To force the inclusion
of `node_modules` folder, specify the negated exclusion pattern: `!**/node_modules/`

- `--coverage-report-dir` - Specifies the output directory for the code coverage reports, default value is `./coverage/` 
  
- `--coverage-clean` - Default value is `true`. Setting this option to `false` will prevent nyc from clearing the `--coverage-temp-directory` folder 
before running the test suite. This option can be used to combine the code coverage information from several test suite launches into a single report. 

** Important note **. On Windows, [one need to use double quotes](https://stackoverflow.com/questions/24173825/what-does-single-quote-do-in-windows-batch-files), 
when providing value for the `--coverage-include` and `--coverage-exclude` options.


Code coverage in browser 
--------------

None of the current code coverage tools support code coverage for browsers. Because of that, Siesta performs some workarounds.

Notably, the protocol of all source file urls is changed from `http/https` to `file`. Port, if it presents in the url
is turned into a path segment, so `http://localhost:8000/src/file.js` becomes `file://localhost/8000/src/file.js`.

Please take this into account, when examining code coverage reports.


Code coverage in Deno 
--------------

Currently, code coverage in Deno, does not work, because of [this issue](https://github.com/denoland/deno/issues/13206).
We'll be implementing it as soon as the issue is resolved. 


Examples
--------

For example, to collect the code coverage information from your Node.js test suite:

```shell
> npx siesta path/to/siesta/project.js --coverage-reporter html --coverage-include '**/src/**/*.js'
```
    
For example, to collect the code coverage information from the browser:

```shell
> npx siesta http://path/to/siesta/project.js --coverage-reporter html --coverage-include '**/src/**/*.js'
```


COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
