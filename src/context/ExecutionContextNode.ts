import { AnyFunction } from "../class/Mixin.js"
import { ExecutionContext } from "./ExecutionContext.js"


//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextNode extends ExecutionContext {

    overrideConsole     : boolean       = true
    overrideException   : boolean       = true
    overrideOutput      : boolean       = true

    uncaughtExceptionListener   : AnyFunction       = undefined
    uncaughtRejectionListener   : AnyFunction       = undefined

    consoleOriginals        : {
        error   : AnyFunction,
        warn    : AnyFunction,
        log     : AnyFunction,
        debug   : AnyFunction,
        info    : AnyFunction,
    } = undefined

    stdOutWriteOriginal         : AnyFunction           = undefined
    stdErrWriteOriginal         : AnyFunction           = undefined


    setup () {
        if (this.overrideException) {
            this.uncaughtExceptionListener  = (err : unknown, origin : 'uncaughtException' | 'uncaughtRejection') => {
                this.onException(err, origin === 'uncaughtException' ? 'exception' : 'rejection')
            }
            this.uncaughtRejectionListener  = (err) => {
                this.onException(err, 'rejection')
            }

            process.on('unhandledRejection', this.uncaughtRejectionListener)
            process.on('uncaughtException', this.uncaughtExceptionListener)
        }

        if (this.overrideConsole) {
            this.consoleOriginals   = {
                error   : console.error,
                warn    : console.warn,
                log     : console.log,
                debug   : console.debug,
                info    : console.info,
            }

            Object.assign(console, {
                error   : (...message) => this.onConsole('error', ...message),
                warn    : (...message) => this.onConsole('warn', ...message),
                log     : (...message) => this.onConsole('log', ...message),
                debug   : (...message) => this.onConsole('debug', ...message),
                info    : (...message) => this.onConsole('info', ...message),
            })
        }

        if (this.overrideOutput) {
            this.stdOutWriteOriginal = process.stdout.write
            this.stdErrWriteOriginal = process.stderr.write

            process.stdout.write = (buffer) => {
                this.onOutput('stdout', buffer)

                return true
            }
            process.stderr.write = (buffer) => {
                this.onOutput('stderr', buffer)

                return true
            }
        }
    }


    destroy () {
        if (this.overrideException) {
            process.off('unhandledRejection', this.uncaughtRejectionListener)
            process.off('uncaughtException', this.uncaughtExceptionListener)

            this.uncaughtRejectionListener  = this.uncaughtExceptionListener = undefined
        }

        if (this.overrideConsole) {
            Object.assign(console, this.consoleOriginals)
        }

        if (this.overrideOutput) {
            process.stdout.write = this.stdOutWriteOriginal
            process.stderr.write = this.stdErrWriteOriginal
        }
    }
}
