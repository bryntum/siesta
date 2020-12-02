import { Base } from "../class/Base.js"

export enum LogLevel {
    info,
    debug,
    log,
    warn,
    error
}

export type LogMethod = 'info' | 'debug' | 'log' | 'warn' | 'error'

export class Logger extends Base {
    logLevel        : LogLevel = LogLevel.warn


    printLn (method : LogMethod, ...message : string[]) {
    }


    info (...message : string[]) {
        if (this.logLevel <= LogLevel.info) this.printLn('info', ...message)
    }


    debug (...message : string[]) {
        if (this.logLevel <= LogLevel.debug) this.printLn('debug', ...message)
    }


    log (...message : string[]) {
        if (this.logLevel <= LogLevel.log) this.printLn('log', ...message)
    }


    warn (...message : string[]) {
        if (this.logLevel <= LogLevel.warn) this.printLn('warn', ...message)
    }


    error (...message : string[]) {
        if (this.logLevel <= LogLevel.error) this.printLn('error', ...message)
    }
}
