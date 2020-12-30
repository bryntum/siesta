#!/usr/bin/env node

import { Launcher } from "../src/siesta/launcher/Launcher.js"

const launcher  = Launcher.new({})

launcher.start().then(exitCode => process.exit(exitCode))


// // Exit codes:
// // 0 - all tests passed
// // 1 - there were test failures
// // 2 - inactivity timeout while running the test suite
// // 3 - no supported browsers available on this machine
// // 4 - no tests to run (probably `include/filter` doesn't match any test url or `exclude` match everything)
// // 5 - can't open project page
// // 6 - wrong arguments
// // 7 - exception thrown
// // 8 - exit after printing version
// // 9 - java is not installed or not available in PATH
//
// var argv    = process.argv.slice()
// argv.shift()
// argv.shift()
//
// var binDir  = argv[ 0 ].replace(/(\/|\\)*$/, '')
//
// require(binDir + "/siesta-launcher-all.js")
//
// var launcher    = new Siesta.Launcher.WebDriverNodeJS({ args : argv })
//
// launcher.start().then(function (exitCode) {
//     launcher.exit(exitCode)
// })
