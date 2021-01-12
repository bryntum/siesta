#!/usr/bin/env node

import { LauncherNodejs } from "../src/siesta/launcher/LauncherNodejs.js"

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled promise rejection, reason:', reason)

    process.exit(9)
})

const launcher  = LauncherNodejs.new({
    inputArguments      : process.argv.slice(2)
})

// we just set the `exitCode` property and not call `process.exit()` directly,
// because some output might not be processed yet
launcher.start().then(exitCode => process.exitCode = exitCode)
