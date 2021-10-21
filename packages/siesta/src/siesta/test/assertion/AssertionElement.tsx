import { ClassUnion, Mixin } from "typescript-mixin-class"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { WaitForResult } from "../../../util/TimeHelpers.js"
import { isArray, isString } from "../../../util/Typeguards.js"
import { normalizeOffset } from "../../../util_browser/Coordinates.js"
import { isElementPointReachable } from "../../../util_browser/Dom.js"
import { ActionTarget, ActionTargetOffset, isActionTarget } from "../../simulate/Types.js"
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
         * This assertion passes if the given offset point of the `target` element is directly reachable by the user, i.e.
         * it is not covered with some other element. If the offset is not provided, the center of the element is tested.
         * The test is performed using the [document.getElementFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint) method.
         *
         * Usually it is fine
         *
         * @param target
         * @param description
         */
        isElementPointReachable (
            target : ActionTarget, description? : string
        )
        isElementPointReachable (
            target : ActionTarget, options : { offset : ActionTargetOffset, allowChildren : boolean } | ActionTargetOffset, description? : string
        )
        isElementPointReachable (
            ...args :
                | [ target : ActionTarget, description? : string ]
                | [ target : ActionTarget, options : { offset : ActionTargetOffset, allowChildren : boolean } | ActionTargetOffset, description? : string ]
        ) {
            const negated       = this.isAssertionNegated
            const target        = args[ 0 ]
            const description   = isString(args[ 1 ]) ? args[ 1 ] : args[ 2 ]
            const options       = isString(args[ 1 ]) ? undefined : args[ 1 ]

            const offset        = isArray(options) ? options : options?.offset
            const allowChildren = isArray(options) ? false : options?.allowChildren

            const el            = this.resolveActionTarget(target)

            if (!el) {
                this.addMissingTargetFailedAssertion('isElementPointReachable', target, description)
                return
            }

            const res           = isElementPointReachable(el, offset, allowChildren)
            const passed        = negated ? !res.reachable : res.reachable

            const offsetValue   = normalizeOffset(el, offset)

            this.addResult(Assertion.new({
                name        : 'isElementPointReachable',
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


        async waitForSelector (selector : string, root : ActionTarget)
        async waitForSelector (selector : string, options? : { root? : ActionTarget, timeout? : number })
        async waitForSelector (
            ...args :
                | [ selector : string, root : ActionTarget ]
                | [ selector : string, options? : { root? : ActionTarget, timeout? : number } ]
        )
            : Promise<Element[] | undefined>
        {
            const selector  = args[ 0 ]
            const options   = isActionTarget(args[ 1 ]) ? undefined : args[ 1 ]
            const root      = isActionTarget(args[ 1 ]) ? args[ 1 ] : options?.root
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
        // deprecated, backward compat only
        elementIsTopElement (target : ActionTarget, allowChildren : boolean = false, description? : string, strict : boolean = false) {
            const el    = this.resolveActionTarget(target)

            if (strict) {
                this.isElementPointReachable(el, { offset : [ 1, 1 ], allowChildren }, `Top/left corner: ${ description }`)
                this.isElementPointReachable(el, { offset : [ 1, '100% - 1' ], allowChildren }, `Bottom/left corner: ${ description }`)
                this.isElementPointReachable(el, { offset : [ '100% - 1', '100% - 1' ], allowChildren }, `Bottom/right corner: ${ description }`)
                this.isElementPointReachable(el, { offset : [ '100% - 1', 1 ], allowChildren }, `top/right corner: ${ description }`)
            } else {
                this.isElementPointReachable(el, { offset : [ '50%', '50%' ], allowChildren }, `${ description }`)
            }
        }


        hasValue (target : ActionTarget, value : string, description? : string) {
            return this.elementValueIs(target, value, description)
        }
    }
) {}
