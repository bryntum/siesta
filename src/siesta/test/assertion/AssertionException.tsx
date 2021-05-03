import { AnyFunction, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { isRegExp } from "../../../util/Typeguards.js"
import { Assertion, SourcePoint, TestNodeResult } from "../TestResult.js"
import { GotExpectTemplate } from "./AssertionCompare.js"


//---------------------------------------------------------------------------------------------------------------------
export class AssertionException extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionException extends base {

        async checkForExceptionAsync (promise : Promise<any>) : Promise<{ thrown : boolean, exception : any }> {
            let thrown : boolean    = false
            let exception

            try {
                await promise
            } catch (e) {
                // as an edge case an `undefined` can be thrown, so need extra boolean flag
                // to check that exception has been actually thrown
                thrown              = true
                exception           = e
            }

            return { thrown, exception }
        }


        checkForException (func : AnyFunction) : { thrown : boolean, exception : any } | Promise<{ thrown : boolean, exception : any }> {
            let thrown : boolean    = false
            let exception

            try {
                const res = func()

                if (res instanceof Promise) return this.checkForExceptionAsync(res)
            } catch (e) {
                // as an edge case an `undefined` can be thrown, so need extra boolean flag
                // to check that exception has been actually thrown
                thrown              = true
                exception           = e
            }

            return { thrown, exception }
        }


        async assertThrowInternal (
            assertionName   : string,
            negated         : boolean,
            func            : AnyFunction,
            sourcePoint     : SourcePoint,
            pattern         : string | RegExp,
            description     : string = ''
        ) {
            let res                     = this.checkForException(func)

            // only introduce asynchronicity if needed, so that for synchronous functions, the assertion
            // is created synchronously too
            if (res instanceof Promise) res = await res

            const { thrown, exception } = res

            if (!thrown) {
                if (negated)
                    this.addResult(Assertion.new({
                        sourcePoint,
                        name            : this.negateExpectationName(assertionName),
                        passed          : true,
                        description
                    }))
                else
                    this.addResult(Assertion.new({
                        sourcePoint,
                        name            : assertionName,
                        passed          : false,
                        description,

                        annotation      : pattern !== undefined ? GotExpectTemplate.el({
                            description : 'Provided function did not throw exception',
                            gotTitle    : `Expect exception with message ${ isRegExp(pattern) ? 'matching' : 'containing' }`,
                            got         : pattern,
                            t           : this
                        }) : GotExpectTemplate.el({
                            description : 'Provided function did not throw exception',
                            t           : this
                        })
                    }))
            } else {
                const message   = exception?.message ?? exception

                if (negated)
                    this.addResult(Assertion.new({
                        sourcePoint,
                        name            : this.negateExpectationName(assertionName),
                        passed          : false,
                        description,

                        annotation      : GotExpectTemplate.el({
                            gotTitle    : 'Provided function threw an exception',
                            got         : message,
                            t           : this
                        }),
                    }))
                else {
                    if (isRegExp(pattern)) {
                        if (pattern.test(message))
                            this.addResult(Assertion.new({
                                sourcePoint,
                                name            : assertionName,
                                passed          : true,
                                description
                            }))
                        else
                            this.addResult(Assertion.new({
                                sourcePoint,
                                name            : assertionName,
                                passed          : false,
                                description,

                                annotation      : GotExpectTemplate.el({
                                    gotTitle    : 'Got exception',
                                    got         : message,
                                    expectTitle : 'Expect exception matching',
                                    expect      : pattern,
                                    t           : this
                                }),
                            }))
                    } else {
                        if (pattern === undefined || message.indexOf(pattern) !== -1)
                            this.addResult(Assertion.new({
                                sourcePoint,
                                name            : assertionName,
                                passed          : true,
                                description
                            }))
                        else
                            this.addResult(Assertion.new({
                                sourcePoint,
                                name            : assertionName,
                                passed          : false,
                                description,

                                annotation      : GotExpectTemplate.el({
                                    gotTitle    : 'Got exception',
                                    got         : message,
                                    expectTitle : 'Expect exception containing',
                                    expect      : pattern,
                                    t           : this
                                })
                            }))
                    }
                }
            }
        }

        /**
         * This assertion passes, if the provided function `func` throws an exception, which
         * stringifies to the `pattern`.
         *
         * The provided function can be asynchronous
         *
         * @param func
         * @param pattern
         * @param description
         */
        async throws (func : AnyFunction, pattern : string | RegExp = '', description : string = '') {
            return this.assertThrowInternal('throws(func, pattern)', false, func, this.getSourcePoint(), pattern, description)
        }

        /**
         *
         * @param func
         * @param description
         */
        async doesNotThrow (func : AnyFunction, description : string = '') {
            return this.assertThrowInternal('doesNotThrow(func)', true, func, this.getSourcePoint(), '', description)
        }

        /**
         * Backward compatible alias for [[throws]]
         *
         * @param func
         * @param pattern
         * @param description
         */
        async throwsOk (func : AnyFunction, pattern : string | RegExp, description : string = '') {
            return this.assertThrowInternal('throwsOk(func, pattern)', false, func, this.getSourcePoint(), pattern, description)
        }

        /**
         * Backward compatible alias for [[livesOk]]
         *
         * @param func
         * @param description
         */
        async livesOk (func : AnyFunction, description : string = '') {
            return this.assertThrowInternal('livesOk(func)', true, func, this.getSourcePoint(), '', description)
        }

        async lives_ok (func : AnyFunction, description : string = '') {
            return this.assertThrowInternal('lives_ok(func)', true, func, this.getSourcePoint(), '', description)
        }

        async lives (func : AnyFunction, description : string = '') {
            return this.assertThrowInternal('lives(func)', true, func, this.getSourcePoint(), '', description)
        }
        // eof backward compat
    }
) {}
