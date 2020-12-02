import { Base } from "../class/Base.js"

export enum LogLevel {
    info,
    debug,
    log,
    warn,
    error
}

export class Logger extends Base {
    logLevel        : LogLevel = LogLevel.warn


    printLn (...message : string[]) {
    }


    info (...message : string[]) {
        if (this.logLevel <= LogLevel.info) this.printLn(...message)
    }


    debug (...message : string[]) {
        if (this.logLevel <= LogLevel.debug) this.printLn(...message)
    }


    log (...message : string[]) {
        if (this.logLevel <= LogLevel.log) this.printLn(...message)
    }


    warn (...message : string[]) {
        if (this.logLevel <= LogLevel.warn) this.printLn(...message)
    }


    error (...message : string[]) {
        if (this.logLevel <= LogLevel.error) this.printLn(...message)
    }
}
