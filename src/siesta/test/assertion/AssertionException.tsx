import { AnyFunction, ClassUnion, Mixin } from "../../../class/Mixin.js"
import { Serializer } from "../../../util/Serializer.js"
import { isRegExp } from "../../../util/Typeguards.js"
import { SiestaJSX } from "../../jsx/Factory.js"
import { Assertion, TestNodeResult } from "../TestResult.js"
import { GotExpectTemplate } from "./AssertionCompare.js"


//---------------------------------------------------------------------------------------------------------------------
export class AssertionException extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionException extends base {

        async throwsOk (func : AnyFunction, pattern : string | RegExp, description : string = '') {
            return this.throws(func, pattern, description)
        }

        async throws (func : AnyFunction, pattern : string | RegExp, description : string = '') {
            let thrown : boolean    = false
            let exception

            try {
                const result    = func()

                if (result instanceof Promise) await result
            } catch (e) {
                // as an edge case an `undefined` can be thrown, so need extra boolean flag
                // to check that exception has been actually thrown
                thrown      = true
                exception   = e
            }

            if (!thrown) {
                this.addResult(Assertion.new({
                    name            : 'throws',
                    passed          : false,
                    description,

                    annotation      : <div>
                        Provided function did not throw exception
                    </div>
                }))
            } else {
                const message   = String(exception?.message) ?? String(exception)

                if (isRegExp(pattern)) {
                    if (pattern.test(message))
                        this.addResult(Assertion.new({
                            name            : 'throws',
                            passed          : true,
                            description
                        }))
                    else
                        this.addResult(Assertion.new({
                            name            : 'throws',
                            passed          : false,
                            description,

                            annotation      : GotExpectTemplate.el({
                                got         : message,
                                gotTitle    : 'Got exception',
                                expect      : pattern,
                                expectTitle : 'Expect exception matching'
                            }),
                        }))
                } else {
                    if (message.indexOf(pattern) !== -1)
                        this.addResult(Assertion.new({
                            name            : 'throws',
                            passed          : true,
                            description
                        }))
                    else
                        this.addResult(Assertion.new({
                            name            : 'throws',
                            passed          : false,
                            description,

                            annotation      : GotExpectTemplate.el({
                                got         : message,
                                gotTitle    : 'Got exception',
                                expect      : pattern,
                                expectTitle : 'Expect exception containing'
                            })
                        }))
                }
            }
        }


        async livesOk (func : AnyFunction, description : string = '') {
            return this.doesNotThrow(func, description)
        }

        async doesNotThrow (func : AnyFunction, description : string = '') {
            let thrown : boolean    = false
            let exception

            try {
                const result    = func()

                if (result instanceof Promise) await result
            } catch (e) {
                // as an edge case an `undefined` can be thrown, so need extra boolean flag
                // to check that exception has been actually thrown
                thrown      = true
                exception   = e
            }

            if (thrown) {
                const message   = String(exception?.message) ?? String(exception)

                this.addResult(Assertion.new({
                    name            : 'throws',
                    passed          : false,
                    description,

                    annotation      : <div class='indented'>
                        Provided function threw an exception:
                        <p class='indented'>
                            <span class="difference_value">{Serializer.serialize(message, {maxDepth: 4, maxWide: 4})}</span>
                        </p>
                    </div>
                }))
            } else {
                this.addResult(Assertion.new({
                    name            : 'throws',
                    passed          : true,
                    description
                }))
            }
        }
    }
) {}
