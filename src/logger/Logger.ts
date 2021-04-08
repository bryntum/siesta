import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"

export enum LogLevel {
    info    = 'info',
    debug   = 'debug',
    log     = 'log',
    warn    = 'warn',
    error   = 'error'
}

export type LogMethod = 'info' | 'debug' | 'log' | 'warn' | 'error'


export class Logger extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Logger extends base {
        logLevel        : LogLevel = LogLevel.log


        printLogMessage (method : LogMethod, ...message : string[]) {
            // abstract logger is silent
        }


        info (...message : string[]) {
            if (this.logLevel <= LogLevel.info) this.printLogMessage('info', ...message)
        }


        debug (...message : string[]) {
            if (this.logLevel <= LogLevel.debug) this.printLogMessage('debug', ...message)
        }


        log (...message : string[]) {
            if (this.logLevel <= LogLevel.log) this.printLogMessage('log', ...message)
        }


        warn (...message : string[]) {
            if (this.logLevel <= LogLevel.warn) this.printLogMessage('warn', ...message)
        }


        error (...message : string[]) {
            if (this.logLevel <= LogLevel.error) this.printLogMessage('error', ...message)
        }
    }
){}
