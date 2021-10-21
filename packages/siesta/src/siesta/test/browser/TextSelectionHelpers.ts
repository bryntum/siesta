import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import {
    elementSupportsSelection,
    getCaretPosition,
    getSelectedText,
    moveCaretPosition,
    selectText,
    setCaretPosition
} from "../../../util_browser/TextSelection.js"
import { ActionTarget } from "../../simulate/Types.js"
import { UserAgentOnPage } from "../../simulate/UserAgent.js"
import { TestNodeResult } from "../TestResult.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TextSelectionHelpers extends Mixin(
    [ UserAgentOnPage, TestNodeResult ],
    (base : ClassUnion<typeof UserAgentOnPage, typeof TestNodeResult>) =>

    class TextSelectionHelpers extends base {

        /**
         * This helper method returns a selected text in the given `target` element
         *
         * @param target
         */
        getSelectedText (target : ActionTarget) : string {
            const el        = this.resolveActionTarget(target) as HTMLInputElement

            return getSelectedText(el)
        }


        /**
         * This helper method selects text in the given `target` element, starting from the index `start` (0-based)
         * till the index `end`
         *
         * @param target
         * @param start
         * @param end
         */
        selectText (target : ActionTarget, start? : number, end? : number) {
            const el        = this.resolveActionTarget(target) as HTMLInputElement

            return selectText(el, start, end)
        }


        /**
         * This helper method returns an index of the caret position (0-based) in the given `target` element
         *
         * @param target
         */
        getCaretPosition (target : ActionTarget) : number | null {
            const el        = this.resolveActionTarget(target) as HTMLInputElement

            return getCaretPosition(el)
        }


        /**
         * This helper method sets the index of the caret position (0-based) in the given `target` element.
         *
         * @param target
         * @param caretPos
         */
        setCaretPosition (target : ActionTarget, caretPos : number) {
            const el        = this.resolveActionTarget(target) as HTMLInputElement

            return setCaretPosition(el, caretPos)
        }


        /**
         * This helper method moves the caret position in the given `target` element by the `delta`.
         *
         * @param target
         * @param caretPos
         */
        moveCaretPosition (target : ActionTarget, delta : number) {
            const el        = this.resolveActionTarget(target) as HTMLInputElement

            return moveCaretPosition(el, delta)
        }


        elementSupportsSelection (target : ActionTarget) : boolean {
            const el        = this.resolveActionTarget(target) as HTMLInputElement

            return elementSupportsSelection(el)
        }
    }
) {}
