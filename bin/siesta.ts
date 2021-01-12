#!/usr/bin/env node

import { LauncherNodejs } from "../src/siesta/launcher/LauncherNodejs.js"

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled promise rejection, reason:', reason)

    process.exit(9)
})

const launcher  = LauncherNodejs.new({
    inputArguments      : process.argv.slice(2)
})

launcher.start().then(exitCode => process.exit(exitCode))
