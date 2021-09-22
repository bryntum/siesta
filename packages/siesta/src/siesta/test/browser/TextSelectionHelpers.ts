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

        getSelectedText (target : ActionTarget) : string {
            const el        = this.resolveActionTarget(target) as HTMLInputElement

            return getSelectedText(el)
        }


        selectText (target : ActionTarget, start? : number, end? : number) {
            const el        = this.resolveActionTarget(target) as HTMLInputElement

            return selectText(el)
        }


        getCaretPosition (target : ActionTarget) : number | null {
            const el        = this.resolveActionTarget(target) as HTMLInputElement

            return getCaretPosition(el)
        }


        setCaretPosition (target : ActionTarget, caretPos : number) {
            const el        = this.resolveActionTarget(target) as HTMLInputElement

            return setCaretPosition(el, caretPos)
        }


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
