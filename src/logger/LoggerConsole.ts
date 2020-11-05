import { Logger, LogLevel } from "./Logger.js"

export class LoggerConsole extends Logger {

    info (...message : string[]) {
        if (this.logLevel <= LogLevel.info) console.info(...message)
    }


    debug (...message : string[]) {
        if (this.logLevel <= LogLevel.debug) console.debug(...message)
    }


    log (...message : string[]) {
        if (this.logLevel <= LogLevel.log) console.log(...message)
    }


    warn (...message : string[]) {
        if (this.logLevel <= LogLevel.warn) console.warn(...message)
    }


    error (...message : string[]) {
        if (this.logLevel <= LogLevel.error) console.error(...message)
    }
}
