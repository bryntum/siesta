import { AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class"
import { Hook } from "../../../hook/Hook.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { delay, timeout } from "../../../util/TimeHelpers.js"
import { isFunction, isNumber, isObject, isPromise, isString } from "../../../util/Typeguards.js"
import { Assertion } from "../TestResult.js"
import { AssertionAsync, WaitForOptions } from "./AssertionAsync.js"
import { GotExpectTemplate, verifyExpectedNumber } from "./AssertionCompare.js"

/**
 * The options object for the [[firesOk]] assertion
 */
export type FiresOkOptions<O> = {
    /**
     * The observable, on which to count the fired events. The exact meaning of the "observable" depends from the
     * environment, for example in browsers it is an instance of `EventTarget` interface and in Node.js - `EventEmitter` class.
     *
     * In general "observable" is whatever the [[resolveObservable]] method accepts as the 1st argument.
     */
    observable      : O,

    /**
     * An object with the events to count. The keys of the object corresponds to the event names.
     * The values - to the expected number of that event. The value can be either a number indicating the exact expected
     * events number, or a string, with the "expected number expression".
     *
     * The expression consists from the comparison operator and number:
     * ```javascript
     * '> 5'
     * '<= 1'
     * '== 3'
     * ```
     */
    events          : Record<string, string | number>,

    /**
     * The period of time during which the events are counted. It can be:
     *
     * - execution of the function (which can possibly be `async`, in this case, don't forget to `await` on the [[firesOk]] call itself)
     * - time period, in milliseconds
     * - the rest of the test (if not provided).
     */
    during?         : number | AnyFunction,

    /**
     * Description for the assertion.
     */
    description?    : string

    // internal, do not document
    assertionName?  : string
    // deprecated, do not document
    desc?           : string
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class AssertionObservable extends Mixin(
    [ AssertionAsync ],
    (base : ClassUnion<typeof AssertionAsync>) =>

    class AssertionObservable extends base {

        ObservableSourceT   : Parameters<this[ 'resolveObservable' ]>[ 0 ]
        ObservableT         : ReturnType<this[ 'resolveObservable' ]>

        // TODO this hook is defined in Test, can we do better than this?
        finishHook          : Hook<[ this ]>        = new Hook()


        addListenerToObservable (observable : this[ 'ObservableT' ], event : string, listener : AnyFunction) {
            throw new Error("Abstract method called")
        }


        removeListenerFromObservable (observable : this[ 'ObservableT' ], event : string, listener : AnyFunction) {
            throw new Error("Abstract method called")
        }


        /**
         * The assertion methods that work with observables (like [[waitForEvent]], [[firesOk]] etc) will use this method to
         * resolve the "observable source" to "observable" (also called sometimes "event emitter"). The types of those methods
         * are tied to the type of the 1st argument of this method.
         *
         * Different environments have different meaning of what exactly is an "observable", for example in browsers
         * it is probably an `Element` instance (`EventTarget` to be precise), in Node.js - "EventEmitter" instance, etc.
         *
         * @param source
         */
        resolveObservable (source : unknown) : any {
            throw new Error("Abstract method called")
        }

        /**
         * This assertion passes, if the provided `observable`, triggers the specified `event`
         * within the `timeout` and fails otherwise. The `timeout` can be specified using the `object` argument,
         * if not provided the [[TestDescriptor.waitForTimeout]] is used.
         *
         * @param observable
         * @param event
         * @param options
         */
        async waitForEvent (observable : this[ 'ObservableSourceT' ], event : string, options? : Partial<WaitForOptions<unknown>>) {
            const resolved            = this.resolveObservable(observable)

            if (!resolved) {
                this.addResult(Assertion.new({
                    name        : 'waitForEvent',
                    passed      : false,
                    description : options?.description,
                    annotation  : <div>
                        <div>Could not resolve action target `<span class="accented">{ observable }</span>` to observable</div>
                    </div>
                }))

                return
            }

            let listener : AnyFunction

            const eventFiredPromise     = new Promise<void>(resolve => {
                this.addListenerToObservable(resolved, event, listener = () => {
                    this.removeListenerFromObservable(resolved, event, listener)

                    resolve()
                })
            })

            const waitTimeout   = options?.timeout ?? this.waitForTimeout
            const timeoutError  = Symbol()

            try {
                const promise   = this.keepAlive(timeout(eventFiredPromise, waitTimeout, timeoutError))

                options?.trigger?.()

                await promise

                this.addResult(Assertion.new({
                    name        : 'waitForEvent',
                    passed      : true,
                    description : options?.description
                }))

            } catch (e) {
                this.removeListenerFromObservable(resolved, event, listener)

                if (e === timeoutError) {
                    this.addResult(Assertion.new({
                        name        : 'waitForEvent',
                        passed      : false,
                        description : options?.description,
                        annotation  : <div>
                            <div>Waited too long for event `<span class="accented">{ event }</span>` to be triggered on observable <span class="accented">{ resolved }</span></div>
                            <div>Timeout is { waitTimeout }ms</div>
                        </div>
                    }))
                } else
                    throw e
            }
        }


        /**
         * This assertion counts the number of events, triggered by the provided `observable` instance, during the
         * provided period and compares it with the expected numbers. The period is specified with the `during` option and can be:
         *
         * - execution of the provided function (which can possibly be `async`)
         * - time period, in milliseconds
         * - the rest of the test (if not provided).
         *
         * The exact notion of what the `observable` is, is defined by the [[resolveObservable]] method.
         *
         * This method has several overloads. Normally it accepts a single object with various [[FiresOkOptions|options]]:
         *
         * ```javascript
         * await t.firesOk({
         *     observable      : document.body,
         *     events          : {
         *         mousedown        : 2,
         *         mouseup          : 2,
         *         click            : '> 1',
         *         dblclick         : '== 1'
         *     },
         *     during          : async () {
         *         await t.click([ 100, 100 ])
         *     },
         *     desc            : 'Correct double click events fired'
         * })
         * ```
         * This method also can be called in 2 additional shortcuts forms:
         *
         * ```javascript
         * // shortcut form, multiple events
         * t.firesOk(observable, { event1 : 1, event2 : '>1' }, description)
         *
         * // shortcut form, single event
         * t.firesOk(observable, eventName, 1, during?, description)
         * t.firesOk(observable, eventName, '>1', during?, description)
         * ```
         */
        async firesOk (options : FiresOkOptions<this[ 'ObservableSourceT' ]>)
        async firesOk (
            observable      : this[ 'ObservableSourceT' ],
            events          : string,
            expected        : number | string,
            description?    : string
        )
        async firesOk (
            observable      : this[ 'ObservableSourceT' ],
            events          : string,
            expected        : number | string,
            during          : number | AnyFunction,
            description?    : string
        )
        async firesOk (
            observable      : this[ 'ObservableSourceT' ],
            events          : Record<string, string | number>,
            description?    : string
        )
        async firesOk (
            observable      : this[ 'ObservableSourceT' ],
            events          : Record<string, string | number>,
            during          : number | AnyFunction,
            description?    : string
        )
        async firesOk (
            ...args : [
                options         : FiresOkOptions<this[ 'ObservableSourceT' ]>
            ] | [
                observable      : this[ 'ObservableSourceT' ],
                events          : string,
                expected        : number | string,
                description?    : string
            ] | [
                observable      : this[ 'ObservableSourceT' ],
                events          : string,
                expected        : number | string,
                during          : number | AnyFunction,
                description?    : string
            ] | [
                observable      : this[ 'ObservableSourceT' ],
                events          : Record<string, string | number>,
                description?    : string
            ] | [
                observable      : this[ 'ObservableSourceT' ],
                events          : Record<string, string | number>,
                during          : number | AnyFunction,
                description?    : string
            ]
        ) {
            const sourcePoint       = this.getSourcePoint()

            let source              : this[ 'ObservableSourceT' ]
            let events              : string | Record<string, string | number>
            let expected            : string | number
            let during              : number | AnyFunction
            let description         : string

            let assertionName       = 'firesOk'

            if (args.length === 1) {
                const options       = args[ 0 ]

                if (isObject(options)) {
                    source          = options.observable
                    events          = options.events
                    during          = options.during
                    description     = options.description || options.desc
                    assertionName   = options.assertionName || 'firesOk'
                } else {
                    throw new Error("1 argument overload form for `firesOk` accept object")
                }
            } else {
                source              = args[ 0 ]
                events              = args[ 1 ]

                if (isString(args[ 1 ])) {
                    // @ts-expect-error
                    expected        = args[ 2 ]

                    if (isNumber(args[ 3 ]) || isFunction(args[ 3 ])) {
                        during          = args[ 3 ]
                        description     = args[ 4 ]
                    }
                    else {
                        description     = args[ 3 ]
                    }
                } else {
                    if (isNumber(args[ 2 ]) || isFunction(args[ 2 ])) {
                        during          = args[ 2 ]
                        // @ts-expect-error
                        description     = args[ 3 ]
                    }
                    else {
                        description     = args[ 2 ]
                    }
                }
            }

            const observable        = this.resolveObservable(source)

            if (!observable) {
                this.addResult(Assertion.new({
                    name        : assertionName,
                    passed      : false,
                    sourcePoint,
                    description,
                    annotation  : <div>Observable <span>{ source }</span> resolved to `null` or `undefined`</div>
                }))

                return
            }

            //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
            const expectedEvents    = isString(events) ? { [ events ] : expected } : events

            // start recording
            const counters          = {}
            const listeners         = {}

            Object.entries(expectedEvents).forEach(([ event, expected ]) => {
                counters[ event ]   = 0

                const listener      = listeners[ event ] = () => counters[ event ]++

                this.addListenerToObservable(observable, event, listener)
            })

            // stop recording and verify the results
            const stopRecording     = () => {
                const failedEvents : { event : string, actual : number, expected : string | number }[] = []

                Object.entries(expectedEvents).forEach(([ event, expected ]) => {
                    this.removeListenerFromObservable(observable, event, listeners[ event ])

                    const actual        = counters[ event ]

                    if (!verifyExpectedNumber(actual, expected)) failedEvents.push({ event, actual, expected })
                })

                if (failedEvents.length > 0)
                    this.addResult(Assertion.new({
                        name        : assertionName,
                        passed      : false,
                        sourcePoint,
                        description,
                        annotation  : <div>{
                            failedEvents.map(desc => GotExpectTemplate.el({
                                description         : `Observable fired wrong number of events '${ desc.event }'`,
                                gotTitle            : 'Actual',
                                got                 : desc.actual,
                                expect              : desc.expected,
                                t                   : this
                            }))
                        }</div>
                    }))
                else
                    this.addResult(Assertion.new({
                        name        : assertionName,
                        passed      : true,
                        sourcePoint,
                        description
                    }))
            }

            if (isNumber(during)) {
                await this.keepAlive(delay(during))

                stopRecording()
            }
            else if (isFunction(during)) {
                try {
                    const res       = during()

                    if (isPromise(res)) await this.keepAlive(res)
                } finally {
                    stopRecording()
                }
            } else {
                this.finishHook.once(stopRecording)
            }
        }


        /**
         * This assertion passes if the provided `observable` triggers the specified event(s) exactly `N` times during
         * the rest of the test execution.
         *
         * This method is a specialized form of the [[firesOk]] assertion.
         *
         * @param observable The observable instance, anything that [[resolveObservable]] accepts
         * @param event The name of the event(s)
         * @param expected Expected number of events
         * @param description Assertion description
         */
        willFireNTimes (observable : this[ 'ObservableSourceT'], event : string | string[], expected : string | number, description? : string) {
            this.firesOk({
                assertionName   : 'willFireNTimes',
                observable,
                events          : this.getObjectWithExpectedEvents(event, expected),
                description
            })
        }


        getObjectWithExpectedEvents (event : string | string[], expected : string | number) : Record<string, string | number> {
            return (isString(event) ? [ event ] : event).reduce((acc, event) => (acc[ event ] = expected, acc), {})
        }


        /**
         * This assertion passes if the provided `observable` does not trigger the specified event(s) during
         * the rest of the test execution.
         *
         * This method is a specialized form of the [[firesOk]] assertion.
         *
         * @param observable The observable instance, anything that [[resolveObservable]] accepts
         * @param event The name of the event(s)
         * @param description Assertion description
         */
        wontFire (observable : this[ 'ObservableSourceT' ], event : string | string[], description? : string) {
            this.firesOk({
                assertionName   : 'wontFire',
                observable      : observable,
                events          : this.getObjectWithExpectedEvents(event, 0),
                description
            })
        }

        /**
         * This assertion passes if the provided `observable` triggers the specified event(s) exactly 1 time during
         * the rest of the test execution.
         *
         * This method is a specialized form of the [[firesOk]] assertion.
         *
         * @param observable The observable instance, anything that [[resolveObservable]] accepts
         * @param event The name of the event(s)
         * @param description Assertion description
         */
        firesOnce (observable : this[ 'ObservableSourceT' ], event : string | string[], description? : string) {
            this.firesOk({
                assertionName   : 'firesOnce',
                observable      : observable,
                events          : this.getObjectWithExpectedEvents(event, 1),
                description
            })
        }

        /**
         * Alias for [[wontFire]] method
         *
         * @param observable
         * @param event
         * @param description
         */
        isntFired (observable : this[ 'ObservableSourceT' ], event : string | string[], description? : string) {
            return this.wontFire(observable, event, description)
        }

        /**
         * This assertion passes if the provided `observable` triggers the specified event(s) at least `N` times times during
         * the rest of the test execution.
         *
         * This method is a specialized form of the [[firesOk]] assertion.
         *
         * @param observable The observable instance, anything that [[resolveObservable]] accepts
         * @param event The name of the event(s)
         * @param n The minimum number of events to be fired
         * @param description Assertion description
         */
        firesAtLeastNTimes (observable : this[ 'ObservableSourceT' ], event : string | string[], n : number, description? : string) {
            this.firesOk({
                assertionName   : 'firesAtLeastNTimes',
                observable      : observable,
                events          : this.getObjectWithExpectedEvents(event, '>=' + n),
                description
            })
        }

    //     /**
    //      * This assertion will verify that the observable fires the specified event and supplies the correct parameters to the listener function.
    //      * A checker method should be supplied that verifies the arguments passed to the listener function, and then returns true or false depending on the result.
    //      * If the event was never fired, this assertion fails. If the event is fired multiple times, all events will be checked, but
    //      * only one pass/fail message will be reported.
    //      *
    //      * For example:
    //      *
    //
    // t.isFiredWithSignature(store, 'add', function (store, records, index) {
    //     return (store instanceof Ext.data.Store) && (records instanceof Array) && t.typeOf(index) == 'Number'
    // })
    //
    //      * @param {Ext.util.Observable/Siesta.Test.ActionTarget} observable Ext.util.Observable instance or target as specified by the {@link Siesta.Test.ActionTarget} rules with
    //      * the only difference that component queries will be resolved till the component level, and not the DOM element.
    //      * @param {String} event The name of event
    //      * @param {Function} checkerFn A method that should verify each argument, and return true or false depending on the result.
    //      * @param {String} [desc] The description of the assertion.
    //      */
    //     isFiredWithSignature : function(observable, event, checkerFn, description) {
    //         var eventFired;
    //         var me              = this;
    //         var sourceLine      = me.getSourceLine();
    //         var R               = Siesta.Resource('Siesta.Test.ExtJS.Observable');
    //
    //         var verifyFiredFn = function () {
    //             me.removeListenerFromObservable(observable, event, listener)
    //
    //             if (!eventFired) {
    //                 me.fail('The [' + event + "] " + R.get('isFiredWithSignatureNotFired'));
    //             }
    //         };
    //
    //         me.on('beforetestfinalizeearly', verifyFiredFn);
    //
    //         var listener = function () {
    //             var result = checkerFn.apply(me, arguments);
    //
    //             if (!eventFired && result) {
    //                 me.pass(description || R.get('observableFired') + ' ' + event + ' ' + R.get('correctSignature'), {
    //                     sourceLine  : sourceLine
    //                 });
    //             }
    //
    //             if (!result) {
    //                 me.fail(description || R.get('observableFired') + ' ' + event + ' ' + R.get('incorrectSignature'), {
    //                     sourceLine  : sourceLine
    //                 });
    //
    //                 // Don't spam the assertion grid with failure, one failure is enough
    //                 me.removeListenerFromObservable(observable, event, listener)
    //             }
    //             eventFired = true
    //         };
    //
    //         me.addListenerToObservable(observable, event, listener)
    //     }
    }
){}
