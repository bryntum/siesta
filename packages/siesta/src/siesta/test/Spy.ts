import { Base } from "../../class/Base.js"
import { ArbitraryObjectKey } from "../../util/Helpers.js"
import { isFunction } from "../../util/Typeguards.js"
import { Test } from "./Test.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * Type for the individual call information.
 */
export type CallInfo = {
    /**
     * The scope of the call.
     */
    object : unknown,

    /**
     * The arguments of the call.
     */
    args : unknown[],

    /**
     * The value, returned by the call.
     */
    returnValue : unknown
}

/**
 * Class that holds the log information about call history for the particular spy.
 */
export class CallsLog extends Base {
    spy         : Spy           = undefined

    /**
     * Returns `true` if spy was called at least once, `false` otherwise
     */
    any () : boolean {
        return this.spy.callsLog.length > 0
    }

    /**
     * Returns the number of times this spy was called
     */
    count () : number {
        return this.spy.callsLog.length
    }

    /**
     * Accepts an index of the call (0-based) and return an array of arguments for that call.
     * @param i
     */
    argsFor (i : number) : unknown[] {
        return this.spy.callsLog[ i ].args
    }

    /**
     * Returns an array, every element of which is in turn an array arguments, for every tracked spy call.
     */
    allArgs () : unknown[][] {
        return this.spy.callsLog.map(call => call.args)
    }

    /**
     * Returns an array with [[CallInfo]] elements for every tracked spy call.
     */
    all () : CallInfo[] {
        return this.spy.callsLog
    }

    /**
     * Returns the [[CallInfo]] structure for the most recent spy call.
     */
    mostRecent () : CallInfo {
        return this.spy.callsLog[ this.spy.callsLog.length - 1 ]
    }

    /**
     * Returns the [[CallInfo]] structure for the first spy call.
     */
    first () : CallInfo {
        return this.spy.callsLog[ 0 ]
    }

    /**
     * Clears all tracking information.
     */
    reset () {
        this.spy.reset()
    }
}


//---------------------------------------------------------------------------------------------------------------------
export type SpyFunction     = Function & { spy : Spy }

export type SpyStrategy     = 'callThrough' | 'callFake' | 'stub' | 'returnValue' | 'throwError'

/**
This class implements a "spy" - function wrapper which tracks its calls. Spy can be installed
instead of a method in some object or can be used standalone.

Usually you don't use this class directly, but instead via the test helper methods: [[Test.spyOn|spyOn]],
[[Test.createSpy|createSpy]], [[Test.createSpyObj|createSpyObj]].

Spy can "operate" in several modes, called "strategies". See [[callThrough]], [[callFake]], [[stub]], [[returnValue]], [[throwError]] below.
Default one is [[callThrough]].

Note, that spies "belongs" to a test and once the test is completed all, spies that were installed during its execution
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
     * This property contains [[CallsLog]] instance, with several helper methods, related to the calls
     * tracking information. It is available as the property of the spy object and also assigned to the spies wrapper function.
     *
     * Example:
     * ```ts
     * const spy = t.spyOn(obj, 'someMethod').callThrough()
     *
     * obj.someMethod(0, 1)
     * obj.someMethod(1, 2)
     *
     * // available both on spy and wrapper
     * t.expect(spy.calls.any()).toBe(true)
     * t.expect(obj.someMethod.calls.count()).toBe(2)
     *
     * t.expect(spy.calls.first()).toEqual({ object : obj, args : [ 0, 1 ], returnValue : undefined })
     * ```
     */
    calls                   : CallsLog          = CallsLog.new({ spy : this })

    t                       : Test              = undefined

    /**
     * This is just a reference to itself, to add some syntax sugar.
     *
     * This property is also assigned to the wrapper function of spy.
     *
     * ```ts
     * t.spyOn(obj, 'someMethod').callThrough()
     *
     * // same thing as above
     * t.spyOn(obj, 'someMethod').and.callThrough()
     *
     * // returns spy instance
     * obj.someMethod.and
     * ```
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
     * @param value The value that will be returned from the spy.
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
    callFake (func : Function) : this {
        this.strategy   = 'callFake'

        this.fakeFunc   = func

        return this
    }


    /**
     * This method makes the spy to throw the specified `error` value (instead of calling the original function).
     *
     * @param error The error value to throw. If it is not an `Error` instance, it will be passed to `Error` constructor first.
     *
     * @return This spy instance
     */
    throwError (error : unknown) : this {
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
