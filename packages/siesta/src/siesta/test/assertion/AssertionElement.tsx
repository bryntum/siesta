import { ClassUnion, Mixin } from "typescript-mixin-class"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { isArray, isString } from "../../../util/Typeguards.js"
import { normalizeOffset } from "../../../util_browser/Coordinates.js"
import { isElementPointReachable } from "../../../util_browser/Dom.js"
import { ActionTarget, ActionTargetOffset } from "../../simulate/Types.js"
import { UserAgentOnPage } from "../../simulate/UserAgent.js"
import { Assertion } from "../TestResult.js"
import { AssertionAsync } from "./AssertionAsync.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class AssertionElement extends Mixin(
    [ AssertionAsync, UserAgentOnPage ],
    (base : ClassUnion<typeof AssertionAsync, typeof UserAgentOnPage>) =>

    class AssertionElement extends base {

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
            const target        = args[ 0 ]
            const description   = isString(args[ 1 ]) ? args[ 1 ] : args[ 2 ]
            const options       = isString(args[ 1 ]) ? undefined : args[ 1 ]

            const offset        = isArray(options) ? options : options?.offset
            const allowChildren = isArray(options) ? false : options?.allowChildren

            const el            = this.resolveActionTarget(target)

            if (!el) {
                this.addResult(Assertion.new({
                    name        : 'isElementPointReachable',
                    passed      : false,
                    description,

                    annotation  : <div>
                        Action target <span>{ target }</span> did not resolve to DOM element
                    </div>
                }))
            }

            const res           = isElementPointReachable(el, offset, allowChildren)
            const passed        = res.reachable

            const offsetValue   = normalizeOffset(el, offset)

            this.addResult(Assertion.new({
                name        : 'isElementPointReachable',
                passed,
                description,

                annotation  : passed ? undefined : <div>
                    Element <span class="element">{ el }</span> is not reachable at offset { offsetValue }.
                    {
                        res.elAtPoint
                            ? <div>It is covered with the <span class="element">{ res.elAtPoint }</span></div>
                            : <div>The point is outside of the visible viewport</div>
                    }
                </div>
            }))
        }


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
    }
) {}
