import { AnyFunction, ClassUnion, Mixin } from "typescript-mixin-class"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { timeout } from "../../../util/TimeHelpers.js"
import { Assertion } from "../TestResult.js"
import { AssertionAsync, WaitForArg } from "./AssertionAsync.js"

//---------------------------------------------------------------------------------------------------------------------
export class AssertionObservable extends Mixin(
    [ AssertionAsync ],
    (base : ClassUnion<typeof AssertionAsync>) =>

    class AssertionObservable extends base {

        ObservableT         : ReturnType<this[ 'resolveObservable' ]>


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
         * This assertion passes, if the provided "observable" (see [[resolveObservable]]), triggers the specified event
         * within the timeout and fails otherwise
         *
         * @param source
         * @param event
         * @param options
         */
        async waitForEvent (source : Parameters<this[ 'resolveObservable' ]>[ 0 ], event : string, options? : WaitForArg<unknown>) {
            const observable            = this.resolveObservable(source)

            let listener : AnyFunction

            const eventFiredPromise     = new Promise<void>(resolve => {
                this.addListenerToObservable(observable, event, listener = () => {
                    this.removeListenerFromObservable(observable, event, listener)

                    resolve()
                })
            })

            const waitTimeout   = options?.timeout ?? this.waitForTimeout
            const timeoutError  = Symbol()

            try {
                const promise   = this.keepAlive(timeout(eventFiredPromise, waitTimeout, timeoutError))

                options?.trigger?.()

                await promise

                this.removeListenerFromObservable(observable, event, listener)

                this.addResult(Assertion.new({
                    name        : 'waitForEvent',
                    passed      : true,
                    description : options?.description
                }))

            } catch (e) {
                if (e === timeoutError) {
                    this.addResult(Assertion.new({
                        name        : 'waitForEvent',
                        passed      : false,
                        description : options?.description,
                        annotation  : <div>
                            <div>Waited too long for event `<span class="accented">{ event }</span>` to be triggered on observable <span class="accented">{ observable }</span></div>
                            <div>Timeout is { waitTimeout }ms</div>
                        </div>
                    }))
                } else
                    throw e
            }
        }


        /**
         * This assertion verifies the number of events, triggered by the provided observable instance during provided
         * function (which can possibly `async`), time period or during the rest of the test.
         *
         * For example:
         *

    t.firesOk({
        observable      : store,
        events          : {
            update      : 1,
            add         : 2,
            datachanged : '> 1'
        },
        during          : function () {
            store.getAt(0).set('Foo', 'Bar');

            store.add({ FooBar : 'BazQuix' })
            store.add({ Foo : 'Baz' })
        },
        desc            : 'Correct events fired'
    })

    // or async

    await t.firesOk({
        observable      : someObservable,
        events          : {
            datachanged : '> 1'
        },
        during          : async () => {
            await someObservable.loadData()
        },
        desc            : 'Correct events fired'
    })

    // or

    t.firesOk({
        observable      : store,
        events          : {
            update      : 1,
            add         : 2,
            datachanged : '>= 1'
        },
        during          : 1
    })

    store.getAt(0).set('Foo', 'Bar');

    store.add({ FooBar : 'BazQuix' })
    store.add({ Foo : 'Baz' })

         *
         * Normally this method accepts a single object with various options (as shown above), but also can be called in 2 additional shortcuts forms:
         *

    // 1st form for multiple events
    t.firesOk(observable, { event1 : 1, event2 : '>1' }, description)

    // 2nd form for single event
    t.firesOk(observable, eventName, 1, description)
    t.firesOk(observable, eventName, '>1', description)

         *
         * In both forms, `during` is assumed to be undefined and `description` is optional.
         *
         * @param {Object} options An obect with the following properties:
         * @param {Ext.util.Observable/Ext.Element/HTMLElement} options.observable Any browser observable, window object, element instances, CSS selector.
         * @param {Object} options.events The object, properties of which corresponds to event names and values - to expected
         * number of this event triggering. If value of some property is a number then exact that number of events is expected. If value
         * of some property is a string starting with one of the comparison operators like "\<", "\<=", "==" etc and followed by the number
         * then Siesta will perform that comparison with the number of actualy fired events.
         * @param {Number/Function} [options.during] If provided as a number denotes the number of milliseconds during which
         * this assertion will "record" the events from observable, if provided as regular function - then this assertion will "record"
         * only events fired during execution of this function (`async` functions are supported, in this case, don't forget to `await`
         * on the assertion call itself). If not provided at all - assertions are recorded until the end of
         * current test (or sub-test)
         * @param {Function} [options.callback] A callback to call after this assertion has been checked. Only used if `during` value is provided.
         * @param {String} [options.desc] A description for this assertion
         */
        firesOk (options, events, n, timeOut, func, desc, callback) {
            //                    |        backward compat arguments        |
            let me              = this
            let sourceLine      = me.getSourceLine()
            let R               = Siesta.Resource('Siesta.Test.Browser')
            let nbrArgs         = arguments.length
            let observable, during

            if (nbrArgs == 1) {
                observable      = options.observable
                events          = options.events
                during          = options.during
                desc            = options.desc || options.description
                callback        = options.callback

                timeOut         = this.typeOf(during) == 'Number' ? during : null
                func            = /Function/.test(this.typeOf(during)) ? during : null

            } else if (nbrArgs >= 5) {
                // old signature, backward compat
                observable      = options

                if (this.typeOf(events) == 'String') {
                    let obj         = {}
                    obj[ events ]   = n

                    events          = obj
                }
            } else if (nbrArgs <= 3 && this.typeOf(events) == 'Object') {
                // shortcut form 1
                observable      = options
                desc            = n
            } else if (nbrArgs <= 4 && this.typeOf(events) == 'String') {
                // shortcut form 2
                observable      = options

                let obj         = {}
                obj[ events ]   = n
                events          = obj

                desc            = timeOut
                timeOut         = null
            } else
                throw new Error(R.get('unrecognizedSignature'))

            // start recording
            let counters    = {}
            let countFuncs  = {}

            Joose.O.each(events, function (expected, eventName) {
                counters[ eventName ]   = 0

                let countFunc   = countFuncs[ eventName ] = function () {
                    counters[ eventName ]++
                }

                me.addListenerToObservable(observable, eventName, countFunc)
            })


            // stop recording and verify the results
            let stopRecording   = function () {
                Joose.O.each(events, function (expected, eventName) {
                    me.removeListenerFromObservable(observable, eventName, countFuncs[ eventName ])

                    let actualNumber    = counters[ eventName ]

                    if (me.verifyExpectedNumber(actualNumber, expected))
                        me.pass(desc, {
                            descTpl         : R.get('observableFired') + ' ' + actualNumber + ' `' + eventName + '` ' + R.get('events')
                        })
                    else
                        me.fail(desc, {
                            assertionName   : 'firesOk',
                            sourceLine      : sourceLine,
                            descTpl         : R.get('observableFiredOk') + ' `' + eventName + '` ' + R.get('events'),
                            got             : actualNumber,
                            gotDesc         : R.get('actualNbrEvents'),
                            need            : expected,
                            needDesc        : R.get('expectedNbrEvents')
                        })
                })
            }

            if (timeOut) {
                let async               = this.beginAsync(timeOut + 100)

                let originalSetTimeout  = this.originalSetTimeout

                originalSetTimeout(function () {
                    me.endAsync(async)

                    stopRecording()

                    me.processCallbackFromTest(callback)
                }, timeOut)
            } else if (func) {
                let typeOf  = this.typeOf(func)

                let cont = function () {
                    stopRecording()

                    me.processCallbackFromTest(callback)
                }

                if (typeOf === 'Function') {
                    let res = func()

                    if (me.typeOf(res) === 'Promise' || me.global.Promise && (res instanceof me.global.Promise)) {
                        return res.then(cont, cont)
                    } else
                        cont()
                }
                else if (typeOf === 'AsyncFunction') {
                    return func().then(cont, cont)
                }

            } else {
                this.on('beforetestfinalizeearly', stopRecording)
            }
        }


    //     /**
    //      * This assertion passes if the observable fires the specified event exactly (n) times during the test execution.
    //      *
    //      * @param {Ext.util.Observable/Ext.Element/HTMLElement} observable The observable instance
    //      * @param {String} event The name of event
    //      * @param {Number} n The expected number of events to be fired
    //      * @param {String} [desc] The description of the assertion.
    //      */
    //     willFireNTimes: function (observable, event, n, desc, isGreaterEqual) {
    //         this.firesOk(observable, event, isGreaterEqual ? '>=' + n : n, desc)
    //     },
    //
    //
    //     getObjectWithExpectedEvents : function (event, expected) {
    //         var events      = {}
    //
    //         if (this.typeOf(event) == 'Array')
    //             Joose.A.each(event, function (eventName) {
    //                 events[ eventName ] = expected
    //             })
    //         else
    //             events[ event ]         = expected
    //
    //         return events
    //     },
    //
    //
    //     /**
    //      * This assertion passes if the observable does not fire the specified event(s) after calling this method.
    //      *
    //      * @param {Mixed} observable Any browser observable, window object, element instances, CSS selector.
    //      * @param {String/Array[String]} event The name of event or array of such
    //      * @param {String} [desc] The description of the assertion.
    //      */
    //     wontFire : function(observable, event, desc) {
    //         this.firesOk({
    //             observable      : observable,
    //             events          : this.getObjectWithExpectedEvents(event, 0),
    //             desc            : desc
    //         });
    //     },
    //
    //     /**
    //      * This assertion passes if the observable fires the specified event exactly once after calling this method.
    //      *
    //      * @param {Mixed} observable Any browser observable, window object, element instances, CSS selector.
    //      * @param {String/Array[String]} event The name of event or array of such
    //      * @param {String} [desc] The description of the assertion.
    //      */
    //     firesOnce : function(observable, event, desc) {
    //         this.firesOk({
    //             observable      : observable,
    //             events          : this.getObjectWithExpectedEvents(event, 1),
    //             desc            : desc
    //         });
    //     },
    //
    //     /**
    //      * Alias for {@link #wontFire} method
    //      *
    //      * @param {Mixed} observable Any browser observable, window object, element instances, CSS selector.
    //      * @param {String/Array[String]} event The name of event or array of such
    //      * @param {String} [desc] The description of the assertion.
    //      */
    //     isntFired : function() {
    //         this.wontFire.apply(this, arguments);
    //     },
    //
    //     /**
    //      * This assertion passes if the observable fires the specified event at least `n` times after calling this method.
    //      *
    //      * @param {Mixed} observable Any browser observable, window object, element instances, CSS selector.
    //      * @param {String} event The name of event
    //      * @param {Number} n The minimum number of events to be fired
    //      * @param {String} [desc] The description of the assertion.
    //      */
    //     firesAtLeastNTimes : function(observable, event, n, desc) {
    //         this.firesOk(observable, event, '>=' + n, desc);
    //     },
    //
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
