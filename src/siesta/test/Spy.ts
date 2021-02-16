import { Base } from "../../class/Base.js"
import { ArbitraryObjectKey } from "../../util/Helpers.js"
import { isFunction } from "../../util/Typeguards.js"
import { Test } from "./Test.js"


//---------------------------------------------------------------------------------------------------------------------
export type CallInfo = { object : unknown, args : unknown[], returnValue : unknown }


export class CallsLog extends Base {
    spy         : Spy           = undefined

    any () : boolean {
        return this.spy.callsLog.length > 0
    }

    count () : number {
        return this.spy.callsLog.length
    }

    argsFor (i) : unknown[] {
        return this.spy.callsLog[ i ].args
    }

    allArgs () : unknown[][] {
        return this.spy.callsLog.map(call => call.args)
    }

    all () : CallInfo[] {
        return this.spy.callsLog
    }

    mostRecent () : CallInfo {
        return this.spy.callsLog[ this.spy.callsLog.length - 1 ]
    }

    first () : CallInfo {
        return this.spy.callsLog[ 0 ]
    }

    reset () {
        this.spy.reset()
    }
}


//---------------------------------------------------------------------------------------------------------------------
export type SpyFunction     = Function & { spy : Spy }

export type SpyStrategy     = 'callThrough' | 'callFake' | 'returnValue' | 'throwError'

/**
This class implements a "spy" - function wrapper which tracks the calls to itself. Spy can be installed
instead of a method in some object or can be used standalone.

Note, that spies "belongs" to a test spec and once the spec is completed all spies that were installed during its execution
will be removed.
*/
export class Spy extends Base {
    name                    : string                = ''

    hostObject              : unknown               = undefined
    propertyName            : ArbitraryObjectKey    = undefined

    hasOwnOriginalValue     : boolean               = false
    originalValue           : any                   = undefined

    strategy                : SpyStrategy           = 'callThrough'

    returnValueObj          : unknown               = undefined
    fakeFunc                : Function              = undefined
    throwErrorObj           : unknown               = undefined

    callsLog                : CallInfo[]            = []

    /**
     * @property {Object} calls This is an object property with several helper methods, related to the calls
     * tracking information. It is assigned to the wrapper function of spy.
     *
     * @property {Function} calls.any Returns `true` if spy was called at least once, `false` otherwise
     * @property {Function} calls.count Returns the number of times this spy was called
     * @property {Function} calls.argsFor Accepts an number of the call (0-based) and return an array of arguments
     * for that call.
     * @property {Function} calls.allArgs Returns an array with the arguments for every tracked function call.
     * Every element of the array is, in turn, an array of arguments.
     * @property {Function} calls.all Returns an array with the context for every tracked function call.
     * Every element of the array is an object of the following structure:

{ object : this, args : [ 0, 1, 2 ], returnValue : undefined }

     * @property {Function} calls.mostRecent Returns a context object of the most-recent tracked function call.
     * @property {Function} calls.first Returns a context object of the first tracked function call.
     * @property {Function} calls.reset Reset all tracking data.
     *
     *
     * Example:

t.spyOn(obj, 'someMethod').callThrough()

obj.someMethod(0, 1)
obj.someMethod(1, 2)

t.expect(obj.someMethod.calls.any()).toBe(true)
t.expect(obj.someMethod.calls.count()).toBe(2)
t.expect(obj.someMethod.calls.first()).toEqual({ object : obj, args : [ 0, 1 ], returnValue : undefined })

     */
    calls                   : CallsLog          = CallsLog.new({ spy : this })

    t                       : Test              = undefined

    /**
     * This is just a reference to itself, to add some syntax sugar.
     *
     * This property is also assigned to the wrapper function of spy.
     *

t.spyOn(obj, 'someMethod').callThrough()

// same thing as above
t.spyOn(obj, 'someMethod').and.callThrough()

// returns spy instance
obj.someMethod.and

     */
    get and () : this {
        return this
    }


    initialize (props? : Partial<Spy>) {
        super.initialize(props)

        const hostObject        = this.hostObject
        const propertyName      = this.propertyName

        if (hostObject) {
            const originalValue         = hostObject[ propertyName ]

            if (!isFunction(originalValue)) throw new Error("Spy can be installed only over a function property")

            // @ts-ignore
            if (originalValue.__SIESTA_SPY__) originalValue.__SIESTA_SPY__.remove()

            this.originalValue          = hostObject[ propertyName ]
            this.hasOwnOriginalValue    = hostObject.hasOwnProperty(propertyName)

            hostObject[ propertyName ]  = this.processor
        }

        if (this.t) this.t.spies.push(this)
    }


    $processor                  : SpyFunction      = undefined

    get processor () : SpyFunction {
        if (this.$processor !== undefined) return this.$processor

        const me          = this

        const processor   = function (this : unknown) {
            const args              = Array.from(arguments)

            const log : CallInfo    = { object : this, args, returnValue : undefined }

            me.callsLog.push(log)

            return log.returnValue  = me[ me.strategy + 'Strategy' ](this, args)
        }

        processor.__SIESTA_SPY__    = processor.and = processor.spy = me
        processor.calls             = me.calls

        return this.$processor = processor
    }


    returnValueStrategy (obj : unknown, args : unknown[]) : unknown {
        return this.returnValueObj
    }


    callThroughStrategy (obj : unknown, args : unknown[]) : unknown {
        return this.originalValue.apply(obj, args)
    }


    callFakeStrategy (obj : unknown, args : unknown[]) : unknown {
        return this.fakeFunc.apply(obj, args)
    }


    throwErrorStrategy (obj : unknown, args : unknown[]) : unknown {
        throw this.throwErrorObj
    }


    /**
     * This method makes the spy to also execute the original function it has been installed over. The
     * value returned from original function is returned from the spy.
     */
    callThrough () : this {
        if (!this.hostObject) throw new Error("Need the host object to call through to original method")

        this.strategy       = 'callThrough'

        return this
    }


    /**
     * This method makes the spy to just return `undefined` and not execute the original function.
     */
    stub () : this {
        this.returnValue(undefined)

        return this
    }


    /**
     * This method makes the spy to return the value provided and not execute the original function.
     *
     * @param {Object} value The value that will be returned from the spy.
     */
    returnValue (value : unknown) : this {
        this.strategy       = 'returnValue'

        this.returnValueObj = value

        return this
    }


    /**
     * This method makes the spy to call the provided function and return the value from it, instead of the original function.
     *
     * @param func The function to call instead of the original function
     */
    callFake (func : Function) {
        this.strategy   = 'callFake'

        this.fakeFunc   = func

        return this
    }


    /**
     * This method makes the spy to throw the specified `error` value (instead of calling the original function).
     *
     * @param {Object} error The error value to throw. If it is not an `Error` instance, it will be passed to `Error` constructor first.
     *
     * @return {Siesta.Test.BDD.Spy} This spy instance
     */
    throwError (error : unknown) {
        this.strategy       = 'throwError'

        this.throwErrorObj  = (error instanceof Error) ? error : new Error(error as any)

        return this
    }


    remove () {
        const hostObject      = this.hostObject

        if (hostObject) {
            if (this.hasOwnOriginalValue)
                hostObject[ this.propertyName ] = this.originalValue
            else
                delete hostObject[ this.propertyName ]
        }

        // cleanup paranoia
        this.originalValue  = this.hostObject = null
        this.callsLog       = []

        this.returnValueObj = this.fakeFunc = this.throwErrorObj = null

        const processor     = this.$processor

        if (processor)
            // @ts-ignore
            processor.and   = processor.calls   = processor.__SIESTA_SPY__ = processor.spy = null

        this.$processor     = null
    }


    /**
     * This method resets all calls tracking data. Spy will report as it has never been called yet.
     */
    reset () {
        this.callsLog      = []
    }
}
