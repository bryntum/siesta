Code coverage with Siesta
==================

Code coverage provides information about what parts of your codebase are executed while running your test suite.
Such code is called "covered" with tests and can be considered "safer" in comparison to "uncovered" code.

However, the meaning of the code coverage information should not be overestimated. "Covered" code 
still can contain algorithmic bugs and errors. Also, "covered" code may not be exercised directly by the test logic, but
instead called as helper code (indirect coverage). 

The only reliable information code coverage report provides is what code is *not* covered with tests at all.

Still, even this information is valuable. Definitely, all important parts of your codebase should not contain "uncovered" code. 


Code instrumentation
--------------

In order to collect the code coverage information, the code is _instrumented_ by Siesta (transformed into different
code). Siesta uses the awesome [Istanbul](https://istanbul.js.org/) library for this purpose.

For example if a "sample_coverage.js" file contains only one assignment:

```javascript
const a = 1;
```
    
It will be instrumented to something like:

```javascript
const a = (cov_17swgm9fhy.s[0]++, 1);
```

where the `cov_17swgm9fhy.s[0]` is a special counter, created at the top of the file.

As you can see, the assignment to variable is converted to form, which increases the `cov_17swgm9fhy.s[0]` counter, when executed.
Similar counters are installed to other places in the code. Instrumentation does not change the semantic of the code.

Instrumentation involves parsing and transformations of the original sources, so, running test suite with code coverage enabled
takes longer. Siesta utilizes Istanbul's caching, to not instrument the same file more than once.


How it works
--------------

Siesta aims to provide just a thin integration level over the Istanbul facilities. This is to be able to freely upgrade Istanbul and stay up to date
with its new features and bug fixes. All command line options related to the code coverage are translated directly to [Nyc](https://github.com/istanbuljs/nyc)
(Istanbul's command line tool). Such options forms a `--nyc.*` group (see more about command line option groups in [this guide](#!/guide/siesta_launchers)).

**Important**. Option groups supports assignments using the `=` character only: 
    
    --nyc.report-dir="Awesome test suite"   # Ok
    --nyc.report-dir "Awesome test suite"   # Not recognized

For instrumentation of the browser code, Siesta implements an instrumentation proxy, which bypasses all traffic transparently, 
except the requests for JavaScript code. Such requests are determined by the MIME type - it should be one of: `text/javascript`, `application/javascript`,
`application/x-javascript`. The URL of the request is transformed to a file name, for example `http://domain.com/app/file.js?query=string` 
becomes `/http/domain.com/app/file.js`. Then the request is treated as a "virtual" file and passed to Istanbul for instrumentation. All regular
Nyc options, like `--nyc.exclude` and `--nyc.include` are applied.

One caveat for instrumentation of the browser code is that, by default, *all* JavaScript code is instrumented. This may cause
a heavy CPU load (if your project uses a lot of 3rd party libraries). In such case, it is better to explicitly specify what code
should be instrumented with `--nyc.include` option.

The proxying approach for browser code instrumentation, however, doesn't work, when testing *locally* with MS Edge or Safari, 
simply because their WebDriver implementations don't support configuring the proxy (all other WebDrivers do).
If you really need to generate the coverage report from one of those browsers (using another browser is always an option),
you can either pre-instrument the codebase (see the section below), or use cloud testing providers, like [SauceLabs](#!/guide/saucelabs_integration) 
or [BrowserStack](#!/guide/browserstack_integration). The latter will work, because traffic proxying will be managed by tunnel software.

**Important**. Currently, when collecting code coverage from the cloud testing providers, one can not use the manually launched tunnel, because it 
needs to be configured to use the instrumentation proxy. The tunnel should be established by the launcher.


Collecting code coverage 
--------------

To enable the code coverage, specify the value for the `--nyc.reporter` command line option. It will enable the 
code instrumentation and generate a report, after the test suite has completed. Recognized values are the names of the Istanbul reporter packages, 
listed [here](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib).
Most often used ones are: `html` and `text`. Note, that `text` report will just output the information to the `stdout` and not save it file.
This option can be repeated several times, resulting in several report generated. 

Here are some others, most important `--nyc.*` options. For a full list, please run `npx nyc --help` (or `node ./node_modules/.bin/nyc --help`)
in the Siesta folder. See also the [Nyc documentation](https://github.com/istanbuljs/nyc)

- `--nyc.include` - The glob pattern for files to include for instrumentation, can be repeated several times. 
Globs are resolved using [minimatch](https://www.npmjs.com/package/minimatch) package, the better documentation can be found in 
[glob](https://www.npmjs.com/package/glob) package. Note, that a glob pattern like `*.some.js` will only match the root-level `*.some.js` files,
to match such files in all directories, specify it as `**/*.some.js`. By default all files are included.

- `--nyc.exclude` - The glob pattern for files to exclude from instrumentation, can be repeated several times. Default value is: 

```
    "coverage/**", "packages/*/test/**", "test/**","test{,-*}.js",
    "**/*{.,-}test.js", "**/__tests__/**", "**/node_modules/**" 
```
Note, that specifying a value for this option will override the default, except the exclusion of `node_modules` folder. To force the inclusion
of `node_modules` folder, specify the negated exclusion pattern: `!**/node_modules/`

- `--nyc.report-dir` - Specifies the output directory for the code coverage reports, default value is `./coverage/` 

- `--nyc.extension` - Specifies the extension to handle for instrumentation, in addition to `.js`. Should include the leading dot, for example:
`--nyc.extension=.mjs --nyc.extension=.jsx`.

- `--nyc.instrument` - Whether the actual instrumentation should be performed, default value is `true`. Set this option to `false` if you
pre-instrument your source code.

- `--nyc.temp-directory` - Specifies the directory for the "raw" code coverage information collected, default value is `./.nyc-output/`. 

- `--nyc.clean` - Default value is `true`. Setting this option to `false` will prevent nyc from clearing the `--nyc.temp-directory` folder 
before running the test suite. This option can be used to combine the code coverage information from several test suite launches into a single report. 

** Important note **. On Windows, [one need to use double quotes](https://stackoverflow.com/questions/24173825/what-does-single-quote-do-in-windows-batch-files), 
when providing value for the `--nyc.include` and `--nyc.exclude` options.

For example, to collect the code coverage information from your Node.js test suite:

    > bin/nodejs --experimental-modules path/to/tests/folder --nyc.extension=mjs --nyc.include=my_tests

For example, to collect the code coverage information from the Firefox browser:

    > bin/webdriver http://url/of/siesta/project.html --nyc.include=my_tests --nyc.reporter=html --browser firefox


Workaround for testing from the "localhost" 
------------------

Since Siesta's transparent code instrumentation relies on proxy connection, when running tests from the host `localhost` you may receive
empty code coverage results (known issue with Chrome). This is because, it seems, ignoring proxy for requests to `localhost` is a hard-coded
setting in Chrome as a browser (there's an option for hosts to bypass in ChromeDriver, but setting it empty string does nothing, 
and providing it as a command line argument does not work either). 

The workaround is to use any other host name, like `local` or `lh`, which can be aliased to `127.0.0.1` in `/etc/hosts` or similar.

If running from "localhost" is a must, you can pre-instrument the source code.


Pre-instrumenting the source code
-------------------------

In some scenarios, you may need to pre-instrument the codebase, before running the test suite. This may be needed for example, if you test
a browser code, concatenated into a single bundle. For pre-instrumented codebase, disable the on-the-fly instrumentation with the 
`--nyc.instrument=false` option. 

Currently, there are 2 options for pre-instrumentation:

- Use the [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul). Please find more information in the 
[nyc documentation](https://github.com/istanbuljs/nyc)

- Use the `instrument` command of the `nyc` tool.  More information can be found by running `npx nyc instrument --help` 
(or `node node_modules/.bin/nyc instrument --help`)




COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
