#!/usr/bin/env node

import { LauncherNodejs } from "../src/siesta/launcher/LauncherNodejs.js"

const launcher  = LauncherNodejs.new({
    inputArguments      : process.argv.slice(2)
})

launcher.start().then(exitCode => process.exit(exitCode))
