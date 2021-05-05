// @ts-ignore
import { decode } from "https://deno.land/std@0.83.0/encoding/utf8.ts"
import { AnyFunction } from "../class/Mixin.js"
import { ExecutionContext } from "./ExecutionContext.js"

//---------------------------------------------------------------------------------------------------------------------
declare const Deno

//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextDeno extends ExecutionContext {

    overrideConsole     : boolean       = true
    // overrideException   : boolean       = false
    overrideOutput      : boolean       = true

    // uncaughtExceptionListener   : AnyFunction       = undefined
    // uncaughtRejectionListener   : AnyFunction       = undefined

    consoleOriginals        : {
        error   : AnyFunction,
        warn    : AnyFunction,
        log     : AnyFunction,
        debug   : AnyFunction,
        info    : AnyFunction,
    } = undefined


    setup () {
        // if (this.overrideException) {
        //     this.uncaughtExceptionListener  = (err : unknown, origin : 'uncaughtException' | 'uncaughtRejection') => {
        //         this.onException(err, origin === 'uncaughtException' ? 'exception' : 'rejection')
        //     }
        //     this.uncaughtRejectionListener  = (err) => {
        //         this.onException(err, 'rejection')
        //     }
        //
        //     process.on('unhandledRejection', this.uncaughtRejectionListener)
        //     process.on('uncaughtException', this.uncaughtExceptionListener)
        // }

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

        const me        = this

        if (this.overrideOutput) {
            Deno.stdout.write = function (buffer : Uint8Array) {
                me.onOutput('stdout', decode(buffer), Deno.stdout.constructor.prototype.write, Deno.stdout)

                return Deno.stdout.constructor.prototype.write.apply(this, arguments)
            }
            Deno.stderr.write = function (buffer : Uint8Array) {
                me.onOutput('stderr', decode(buffer), Deno.stderr.constructor.prototype.write, Deno.stderr)

                return Deno.stderr.constructor.prototype.write.apply(this, arguments)
            }
            Deno.stdout.writeSync = function (buffer : Uint8Array) {
                me.onOutput('stdout', decode(buffer), Deno.stdout.constructor.prototype.writeSync, Deno.stdout)

                return Deno.stdout.constructor.prototype.writeSync.apply(this, arguments)
            }
            Deno.stderr.writeSync = function (buffer : Uint8Array) {
                me.onOutput('stderr', decode(buffer), Deno.stderr.constructor.prototype.writeSync, Deno.stderr)

                return Deno.stderr.constructor.prototype.writeSync.apply(this, arguments)
            }
        }
    }


    destroy () {
        // if (this.overrideException) {
        //     process.off('unhandledRejection', this.uncaughtRejectionListener)
        //     process.off('uncaughtException', this.uncaughtExceptionListener)
        //
        //     this.uncaughtRejectionListener  = this.uncaughtExceptionListener = undefined
        // }

        if (this.overrideConsole) {
            Object.assign(console, this.consoleOriginals)
        }

        if (this.overrideOutput) {
            delete Deno.stdout.write
            delete Deno.stdout.writeSync
            delete Deno.stderr.write
            delete Deno.stderr.writeSync
        }
    }
}
