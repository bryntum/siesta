#!/usr/bin/env node

import { ExitCodes, LauncherError } from "../src/siesta/launcher/Launcher.js"
import { LauncherNodejs } from "../src/siesta/launcher/LauncherNodejs.js"

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled promise rejection, reason:', reason)

    process.exit(ExitCodes.UNHANLED_EXCEPTION)
})

const launcher  = LauncherNodejs.new({
    inputArguments      : process.argv.slice(2)
})

try {
    // we just set the `exitCode` property and not call `process.exit()` directly,
    // because some output might not be processed yet
    const launch        = await launcher.start()

    process.exitCode    = launch.getExitCode()
} catch (e) {
    if (e instanceof LauncherError) {
        e.annotation && launcher.write(e.annotation)

        process.exitCode = e.exitCode

        // process._getActiveHandles();
        // process._getActiveRequests()

    } else {
        console.log('Unhandled exception:', e)

        process.exit(ExitCodes.UNHANLED_EXCEPTION)
    }
}
