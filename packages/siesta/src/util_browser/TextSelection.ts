//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getSelectedText = (el : HTMLInputElement) : string => {
    if (el.selectionStart != null && el.selectionEnd != null)
        return el.value.substring(el.selectionStart, el.selectionEnd)
    else
        return ''
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const selectText = (el : HTMLInputElement, start? : number, end? : number) => {
    if (!elementSupportsSelection(el)) throw new Error("Element does not support text selection")

    const value         = el.value /*|| el.innerHTML*/

    // TODO only needed for Firefox?
    el.focus({ preventScroll : true })

    el.setSelectionRange(start === undefined ? 0 : start, end === undefined ? value.length : end)
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getCaretPosition = (el : HTMLInputElement) : number | null => {
    return el.selectionStart

    // let pos
    //
    // let win         = this.global
    // let document    = win.document
    //
    // if ('selectionStart' in el) {
    //     try {
    //         // the exception can be thrown in case of manipulating with input#type=email fields
    //         // and possibly some other input types
    //         pos     = el.selectionStart
    //     } catch (e) {
    //         pos     = null
    //     }
    // }
    // // else if (win.getSelection && this.isEditableNode(el)) {
    // //     let sel     = win.getSelection()
    // //
    // //     if (sel.rangeCount) {
    // //         let range = sel.getRangeAt(0)
    // //
    // //         if (range.commonAncestorContainer.parentNode == el) {
    // //             pos = range.endOffset
    // //         }
    // //     }
    // // }
    //
    // return pos
}



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const setCaretPosition = (el : HTMLInputElement, caretPos : number) => {
    // TODO only needed for Firefox?
    el.focus({ preventScroll : true })

    try {
        // the exception can be thrown in case of manipulating with input#type=email fields
        // and possibly some other input types
        el.setSelectionRange(caretPos, caretPos)
    } catch (e) {
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const moveCaretPosition = (el : HTMLInputElement, delta : number) => {
    let pos = Math.min(Math.max(0, getCaretPosition(el) + delta), el.value.length)

    setCaretPosition(el, pos)
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const elementSupportsSelection = (el : Element) : boolean => {
    const tagName       = el.tagName.toLowerCase()

    return tagName === 'textarea'
        || tagName === 'input' && /^text|password|tel|url|search$/i.test(el.getAttribute('type'))
}
