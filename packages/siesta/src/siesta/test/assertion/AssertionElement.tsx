import { ClassUnion, Mixin } from "typescript-mixin-class"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { WaitForResult } from "../../../util/TimeHelpers.js"
import { isArray, isString } from "../../../util/Typeguards.js"
import { normalizeOffset } from "../../../util_browser/Coordinates.js"
import { isElementPointReachable } from "../../../util_browser/Dom.js"
import { ActionTarget, ActionTargetOffset } from "../../simulate/Types.js"
import { UserAgentOnPage } from "../../simulate/UserAgent.js"
import { Assertion } from "../TestResult.js"
import { AssertionAsync, WaitForOptions } from "./AssertionAsync.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class AssertionElement extends Mixin(
    [ AssertionAsync, UserAgentOnPage ],
    (base : ClassUnion<typeof AssertionAsync, typeof UserAgentOnPage>) =>

    class AssertionElement extends base {

        addMissingTargetFailedAssertion (target : ActionTarget, name, description) {
            this.addResult(Assertion.new({
                name,
                description,
                passed      : false,

                annotation  : <div>
                    Action target <span>{ target }</span> did not resolve to DOM element
                </div>
            }))
        }

        /**
         * This assertion passes if the given `offset` point of the `target` element is directly reachable by the user, i.e.
         * it is not covered with some other element. If the `offset` is not provided, the center of the element is tested.
         * The test is performed using the [document.getElementFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint) method.
         *
         * Usually it is fine if the element is covered with one of its children - it is still considered reachable.
         * This behaviour is controlled with the `allowChildren` option, by default it is set to `true`.
         *
         * This method has 2 overloads, one simplified and one with options.
         *
         * @category Dom assertions
         *
         * @param target
         * @param description
         */
        elementPointIsReachable (
            target : ActionTarget, description? : string
        )
        elementPointIsReachable (
            target : ActionTarget, options : {
                /** include */
                offset? : ActionTargetOffset,
                /** include */
                allowChildren? : boolean
            } | ActionTargetOffset, description? : string
        )
        elementPointIsReachable (
            ...args :
                | [ target : ActionTarget, description? : string ]
                | [ target : ActionTarget, options : { offset? : ActionTargetOffset, allowChildren? : boolean } | ActionTargetOffset, description? : string ]
        ) {
            const negated       = this.isAssertionNegated
            const target        = args[ 0 ]
            const description   = isString(args[ 1 ]) ? args[ 1 ] : args[ 2 ]
            const options       = isString(args[ 1 ]) ? undefined : args[ 1 ]

            const offset        = isArray(options) ? options : options?.offset
            const allowChildren = isArray(options) ? true : (options?.allowChildren ?? true)

            const el            = this.resolveActionTarget(target)

            if (!el) {
                this.addMissingTargetFailedAssertion('elementPointIsReachable', target, description)
                return
            }

            const res           = isElementPointReachable(el, offset, allowChildren)
            const passed        = negated ? !res.reachable : res.reachable

            const offsetValue   = normalizeOffset(el, offset)

            this.addResult(Assertion.new({
                name        : 'elementPointIsReachable',
                passed,
                negated,
                description,

                annotation  : passed
                    ? undefined
                    : negated
                        ? <div>
                            Element <span class="element">{ el }</span> is reachable at offset { offsetValue }.
                        </div>
                        : <div>
                            Element <span class="element">{ el }</span> is not reachable at offset { offsetValue }.
                            {
                                res.elAtPoint
                                    ? <div>It is covered with the <span class="element">{ res.elAtPoint }</span></div>
                                    : <div>The point is outside of the visible viewport</div>
                            }
                        </div>
            }))
        }


        /**
         * This assertion passes, if the `value` property of the `target` element is strictly equal to the given `value`
         * argument. No assumption is made about what is the target element, but usually it should be `<input>` or
         * `<textarea>`.
         *
         * For example:
         *
         * ```javascript
         * t.elementValuesIs('#input1', 'Need this text', 'Correct text in the input field')
         * ```
         *
         * @category Dom assertions
         *
         * @param target
         * @param value
         * @param description
         */
        elementValueIs (target : ActionTarget, value : string, description? : string) {
            const el            = this.resolveActionTarget(target) as HTMLInputElement

            if (!el) {
                this.addMissingTargetFailedAssertion('elementValueIs', target, description)
                return
            }

            const foundValue    = el.value

            this.assertEqualityInternal(
                'elementValueIs',
                this.comparePrimitivesIs(foundValue, value),
                this.isAssertionNegated,
                foundValue,
                value,
                description
            )
        }


        /**
         * This assertion passes if the given CSS / ActionTarget selector is found in the DOM.
         *
         * @category Dom assertions
         *
         * @param selector A CSS or ActionTarget selector
         * @param description The description for the assertion
         */
        selectorExists (selector : string, description? : string) {
            if (!selector) throw new Error("No selector provided for `selectorExists`")

            if (this.query(selector).length === 0) {
                this.addResult(Assertion.new({
                    name            : 'selectorExists',
                    sourcePoint     : this.getSourcePoint(),
                    passed          : false,
                    description,
                    annotation      : <div>
                        The query for selector `{ selector }` does not match any elements.
                    </div>
                }))
            } else {
                this.addResult(Assertion.new({
                    name            : 'selectorExists',
                    sourcePoint     : this.getSourcePoint(),
                    passed          : true,
                    description
                }))
            }
        }


        /**
         * This assertions passes if waiting for the given `selector` completes within `timeout`.
         * If no `timeout` is given [[TestDescriptor.defaultTimeout]] is used. One can also specify
         * a `root` element, from which the query will be starting.
         *
         * This method has 2 overloads
         *
         * For example:
         *
         * ```javascript
         * await t.waitForSelector('.css-class', { root : '.root', timeout : 5000 })
         * ```
         *
         * @category Dom assertions
         *
         * @param selector
         * @param root
         */
        async waitForSelector (selector : string, root : ActionTarget)
        async waitForSelector (selector : string, options? : {
            /** include */
            root? : ActionTarget,
            /** include */
            timeout? : number
        })
        async waitForSelector (
            ...args :
                | [ selector : string, root : ActionTarget ]
                | [ selector : string, options? : { root? : ActionTarget, timeout? : number } ]
        )
            : Promise<Element[] | undefined>
        {
            const selector  = args[ 0 ]
            const options   = this.isActionTarget(args[ 1 ]) ? undefined : args[ 1 ]
            const root      = this.isActionTarget(args[ 1 ]) ? args[ 1 ] : options?.root
            const timeout   = options?.timeout ?? this.waitForTimeout

            if (!selector) throw new Error("Need `selector` argument for the `waitForSelector` assertion")

            return this.waitFor<Element[]>({
                condition : () => {
                    const resolvedRoot  = root ? this.resolveActionTarget(root, 'throw') : undefined
                    const res           = this.query(selector, resolvedRoot)

                    return res.length > 0 ? res : undefined
                },
                timeout,

                reporting   : {
                    assertionName   : 'waitForSelector',
                    onConditionMet          : (waitRes : WaitForResult<unknown>, waitOptions : WaitForOptions<unknown>) =>
                        <div>
                            Waited { waitRes.elapsedTime }ms for matching elements to appear in DOM
                        </div>,
                    onTimeout               : (waitRes : WaitForResult<unknown>, waitOptions : WaitForOptions<unknown>) =>
                        <div>Waiting for selector aborted by timeout ({ waitOptions.timeout }ms)</div>
                }
            })
        }


        //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // methods below this line are deprecated, backward compat only


        elementIsTopElement (target : ActionTarget, allowChildren : boolean = false, description? : string, strict : boolean = false) {
            const el    = this.resolveActionTarget(target)

            if (strict) {
                this.elementPointIsReachable(el, { offset : [ 1, 1 ], allowChildren }, `Top/left corner: ${ description }`)
                this.elementPointIsReachable(el, { offset : [ 1, '100% - 1' ], allowChildren }, `Bottom/left corner: ${ description }`)
                this.elementPointIsReachable(el, { offset : [ '100% - 1', '100% - 1' ], allowChildren }, `Bottom/right corner: ${ description }`)
                this.elementPointIsReachable(el, { offset : [ '100% - 1', 1 ], allowChildren }, `top/right corner: ${ description }`)
            } else {
                this.elementPointIsReachable(el, { offset : [ '50%', '50%' ], allowChildren }, `${ description }`)
            }
        }


        hasValue (target : ActionTarget, value : string, description? : string) {
            return this.elementValueIs(target, value, description)
        }
    }
) {}
