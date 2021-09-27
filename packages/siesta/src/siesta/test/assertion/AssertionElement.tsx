import { ClassUnion, Mixin } from "typescript-mixin-class"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { isString } from "../../../util/Typeguards.js"
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
            target : ActionTarget, options : { offset : ActionTargetOffset, allowChildren : boolean }, description? : string
        )
        isElementPointReachable (
            ...args :
                | [ target : ActionTarget, description? : string ]
                | [ target : ActionTarget, options : { offset : ActionTargetOffset, allowChildren : boolean }, description? : string ]
        ) {
            const target        = args[ 0 ]
            const description   = isString(args[ 1 ]) ? args[ 1 ] : args[ 2 ]
            const options       = isString(args[ 1 ]) ? undefined : args[ 1 ]

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

            const res           = isElementPointReachable(el, options?.offset, options?.allowChildren)
            const passed        = res.reachable

            const offset        = normalizeOffset(el, options?.offset)

            this.addResult(Assertion.new({
                name        : 'isElementPointReachable',
                passed,
                description,

                annotation  : passed ? undefined : <div>
                    Element <span class="element">{ el }</span> is not reachable at offset { offset }.
                    {
                        res.elAtPoint
                            ? <div>It is covered with the <span class="element">{ res.elAtPoint }</span></div>
                            : <div>The point is outside of the visible viewport</div>
                    }
                </div>
            }))
        }


        elementIsTopElement (target : ActionTarget, allowChildren : boolean, description : string, strict : boolean) {

        }
    }
) {}
