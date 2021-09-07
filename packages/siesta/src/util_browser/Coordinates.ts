import { ActionTargetOffset, Point } from "../siesta/simulate/Types.js"
import { Rect } from "../util/Rect.js"
import { isString } from "../util/Typeguards.js"

//---------------------------------------------------------------------------------------------------------------------
export const clientXtoPageX = (x : number, win : Window) : number => x + win.scrollX

export const clientYtoPageY = (y : number, win : Window) : number => y + win.scrollY

export const pageXtoClientX = (x : number, win : Window) : number => x - win.scrollX

export const pageYtoClientY = (y : number, win : Window) : number => y - win.scrollY


//---------------------------------------------------------------------------------------------------------------------
const evaluateOffsetExpression  = (baseValue : number, expression : string) : number => {
    const match         = /^\s*([+-]?\d+(?:\.\d+)?)\s*%\s*([+-]\s*\d+(?:\.\d+)?)?\s*$/.exec(expression)

    if (!match) throw new Error(`Invalid offset expression: ${ expression }`)

    return Number(match[ 1 ]) / 100 * baseValue + Number(match[ 2 ] || 0)
}

export const normalizeOffset = (el : Element, offset : ActionTargetOffset = [ '50%', '50%' ]) : Point => {
    const rect              = el.getBoundingClientRect()

    return [
        isString(offset[ 0 ]) ? evaluateOffsetExpression(rect.width, offset[ 0 ]) : offset[ 0 ],
        isString(offset[ 1 ]) ? evaluateOffsetExpression(rect.height, offset[ 1 ]) : offset[ 1 ]
    ]
}


//---------------------------------------------------------------------------------------------------------------------
export const isOffsetInsideElementBox = (el : Element, offset : ActionTargetOffset) : boolean => {
    const rect              = el.getBoundingClientRect()
    const [ dx, dy ]        = normalizeOffset(el, offset)

    return dx >= 0 && dx <= rect.width && dy >= 0 && dy <= rect.height
}


//---------------------------------------------------------------------------------------------------------------------
export const getBoundingPageRect = (el : Element) : Rect => {
    const doc               = el.ownerDocument
    const win               = doc.defaultView

    const rect              = el.getBoundingClientRect()

    return Rect.new({
        left        : rect.left + win.scrollX,
        top         : rect.top + win.scrollY,
        width       : rect.width,
        height      : rect.height
    })
}


//---------------------------------------------------------------------------------------------------------------------
export const getViewportPageRect = (el : Element) : Rect => {
    const doc               = el.ownerDocument
    const win               = doc.defaultView

    return Rect.new({
        left        : win.scrollX,
        top         : win.scrollY,
        width       : win.innerWidth,
        height      : win.innerHeight
    })
}

