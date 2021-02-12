import { AnyFunction, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { SiestaJSX } from "../../../jsx/Factory.js"
import { SerializerXml } from "../../../serializer/SerializerXml.js"
import { isRegExp } from "../../../util/Typeguards.js"
import { Assertion, TestNodeResult } from "../TestResult.js"
import { GotExpectTemplate } from "./AssertionCompare.js"


//---------------------------------------------------------------------------------------------------------------------
export class AssertionException extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionException extends base {

        async checkForException (func : AnyFunction) : Promise<{ thrown : boolean, exception : any }> {
            let thrown : boolean    = false
            let exception

            try {
                await func()
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
            sourceLine      : number,
            pattern         : string | RegExp = '',
            description     : string = ''
        ) {
            const { thrown, exception } = await this.checkForException(func)

            if (!thrown) {
                if (negated)
                    this.addResult(Assertion.new({
                        sourceLine,
                        name            : this.negateExpectationName(assertionName),
                        passed          : true,
                        description
                    }))
                else
                    this.addResult(Assertion.new({
                        sourceLine,
                        name            : assertionName,
                        passed          : false,
                        description,

                        annotation      : GotExpectTemplate.el({
                            description : 'Provided function did not throw exception',
                            gotTitle    : `Expect exception with message ${ isRegExp(pattern) ? 'matching' : 'containing' }`,
                            got         : pattern,
                            t           : this
                        })
                    }))
            } else {
                const message   = String(exception?.message ?? exception)

                if (negated)
                    this.addResult(Assertion.new({
                        sourceLine,
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
                                sourceLine,
                                name            : assertionName,
                                passed          : true,
                                description
                            }))
                        else
                            this.addResult(Assertion.new({
                                sourceLine,
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
                        if (message.indexOf(pattern) !== -1)
                            this.addResult(Assertion.new({
                                sourceLine,
                                name            : assertionName,
                                passed          : true,
                                description
                            }))
                        else
                            this.addResult(Assertion.new({
                                sourceLine,
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


        async throws (func : AnyFunction, pattern : string | RegExp = '', description : string = '') {
            return this.assertThrowInternal('throws(func, pattern)', false, func, this.getSourceLine(), pattern, description)
        }

        async doesNotThrow (func : AnyFunction, description : string = '') {
            return this.assertThrowInternal('doesNotThrow(func)', true, func, this.getSourceLine(), '', description)
        }


        // backward compat
        async throwsOk (func : AnyFunction, pattern : string | RegExp, description : string = '') {
            return this.assertThrowInternal('throwsOk(func, pattern)', false, func, this.getSourceLine(), pattern, description)
        }

        async livesOk (func : AnyFunction, description : string = '') {
            return this.assertThrowInternal('livesOk(func)', true, func, this.getSourceLine(), '', description)
        }

        async lives_ok (func : AnyFunction, description : string = '') {
            return this.assertThrowInternal('livesOk(func)', true, func, this.getSourceLine(), '', description)
        }

        async lives (func : AnyFunction, description : string = '') {
            return this.assertThrowInternal('livesOk(func)', true, func, this.getSourceLine(), '', description)
        }
        // eof backward compat
    }
) {}
