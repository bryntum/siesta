import { PointerMovePrecision } from "../siesta/simulate/SimulatorMouse.js"
import { ActionTargetOffset, Point, sumPoints, sumPoints3 } from "../siesta/simulate/Types.js"
import { lastElement } from "../util/Helpers.js"
import { Rect } from "../util/Rect.js"
import { isNumber, isString } from "../util/Typeguards.js"
import { elementFromPoint, getBoundingClientRect, parentWindows } from "./Dom.js"
import { getOffsetsMap } from "./Scroll.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const clientXtoPageX = (x : number, win : Window) : number => x + win.scrollX

export const clientYtoPageY = (y : number, win : Window) : number => y + win.scrollY

export const pageXtoClientX = (x : number, win : Window) : number => x - win.scrollX

export const pageYtoClientY = (y : number, win : Window) : number => y - win.scrollY

export const pagePointToClientPoint = (point : Point, win : Window) : Point => [ point[ 0 ] - win.scrollX, point[ 1 ] - win.scrollY ]

export const clientPointToPagePoint = (point : Point, win : Window) : Point => [ point[ 0 ] + win.scrollX, point[ 1 ] + win.scrollY ]


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const evaluateOffsetExpression  = (baseValue : number, expression : string) : number => {
    const match         = /^\s*([+-]?\d+(?:\.\d+)?)\s*%\s*(?:([+-])\s*(\d+(?:\.\d+)?))?\s*$/.exec(expression)

    if (!match) throw new Error(`Invalid offset expression: ${ expression }`)

    return Number(match[ 1 ]) / 100 * baseValue + Number((match[ 2 ] ?? '') + (match[ 3 ] ?? 0))
}

export const normalizeOffset = (el : Element, offset : ActionTargetOffset = [ '50%', '50%' ]) : Point => {
    const rect              = getBoundingClientRect(el)

    return [
        isString(offset[ 0 ]) ? evaluateOffsetExpression(rect.width, offset[ 0 ]) : offset[ 0 ],
        isString(offset[ 1 ]) ? evaluateOffsetExpression(rect.height, offset[ 1 ]) : offset[ 1 ]
    ]
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getViewportActionPoint = (el : Element, offset? : ActionTargetOffset) : Point | undefined => {
    const rect                  = Rect.fromElement(el)
    const visibleViewportRect   = getViewportRect(el.ownerDocument.defaultView)

    if (offset) {
        const point             = sumPoints(rect.leftTop, normalizeOffset(el, offset))

        return visibleViewportRect.containsPoint(point) ? point : undefined
    } else {

        const intersection      = visibleViewportRect.intersect(rect)

        return intersection.isEmpty() ? undefined : intersection.center
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type ActionPointData = {
    topElementData  : { el : Element, localXY : Point }
    globalXY        : Point
}

export const getActionPointData = (el : Element, offset? : ActionTargetOffset) : ActionPointData => {
    const win           = el.ownerDocument.defaultView
    const topWin        = lastElement(Array.from(parentWindows(win, true)))
    const offsets       = getOffsetsMap(win)

    const globalXY      = sumPoints3(offsets.get(win), Rect.fromElement(el).leftTop, normalizeOffset(el, offset))

    return { topElementData : elementFromPoint(topWin.document, ...globalXY, true), globalXY }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isOffsetInsideElementBox = (el : Element, offset : ActionTargetOffset) : boolean => {
    const rect              = getBoundingClientRect(el)
    const [ dx, dy ]        = normalizeOffset(el, offset)

    return dx >= 0 && dx < rect.width && dy >= 0 && dy < rect.height
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getBoundingPageRect = (el : Element) : Rect => {
    const doc               = el.ownerDocument
    const win               = doc.defaultView

    const rect              = getBoundingClientRect(el)

    return Rect.new({
        left        : rect.left + win.scrollX,
        top         : rect.top + win.scrollY,
        width       : rect.width,
        height      : rect.height
    })
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// export const getViewportPageRect = (win : Window) : Rect => Rect.new({
//     left        : win.scrollX,
//     top         : win.scrollY,
//     width       : win.innerWidth,
//     height      : win.innerHeight
// })


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getViewportRect = (win : Window) : Rect => Rect.new({
    left        : 0,
    top         : 0,
    // TODO should in theory subtract the scrollbar's width/height
    // however, the `getScrollbarWidth` method does not work correctly
    // with <html> element, it returns 0 in the best case, or negative
    // value if the height is > 100%
    width       : win.innerWidth,
    height      : win.innerHeight
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const translatePointToParentViewport = (point : Point, win : Window) : Point => {
    const frame     = win.frameElement

    if (!frame) throw new Error('Window is already top')

    const frameRect = frame.getBoundingClientRect()

    return [ frameRect.left + point[ 0 ], frameRect.top + point[ 1 ] ]
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getPathBetweenPoints = function (from : Point, to : Point) : Point[] {
    if (
        typeof from[ 0 ] !== 'number' || typeof from[ 1 ] !== 'number'
        || typeof to[ 0 ] !== 'number' || typeof to[ 1 ] !== 'number'
        || isNaN(from[ 0 ]) || isNaN(from[ 1 ])
        || isNaN(to[ 0 ]) || isNaN(to[ 1 ])
    ) {
        throw new Error('Incorrect arguments passed to getPathBetweenPoints: ' + from + ', ' + to)
    }

    const stops : Point[] = []

    let x0      = Math.floor(from[ 0 ])
    let y0      = Math.floor(from[ 1 ])

    const x1    = Math.floor(to[ 0 ])
    const y1    = Math.floor(to[ 1 ])

    const dx    = Math.abs(x1 - x0)
    const dy    = Math.abs(y1 - y0)

    const sx    = x0 < x1 ? 1 : -1
    const sy    = y0 < y1 ? 1 : -1

    let err     = dx - dy

    let e2 : number

    while (x0 !== x1 || y0 !== y1) {
        e2      = 2 * err

        if (e2 > -dy) {
            err     = err - dy
            x0      = x0 + sx
        }

        if (e2 < dx) {
            err     = err + dx
            y0      = y0 + sy
        }

        stops.push([ x0, y0 ])
    }

    const last      = stops[ stops.length - 1 ]

    if (stops.length > 0 && (last[ 0 ] !== to[ 0 ] || last[ 1 ] !== to[ 1 ])) {
        stops.push(to.slice() as Point)
    }

    return stops
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const filterPathAccordingToPrecision = (path : Point[], movePrecision : PointerMovePrecision) : Point[] => {
    const pathLength    = path.length

    const kind          = isNumber(movePrecision) ? 'every_nth' : movePrecision.kind
    const precision     = isNumber(movePrecision) ? movePrecision : movePrecision.precision

    if (kind === 'fixed') {
        if (precision === 1) return path.slice(-1)

        if (precision === 2) {
            return pathLength < 2 ? path.slice(-1) : [ path[ 0 ], lastElement(path) ]
        }

        // we always want to simulate the event for the last point
        const filtered      = [ path[ pathLength - 1 ] ]

        const delta         = pathLength / (precision - 1)

        for (let i = pathLength - delta; i >= 0; i -= delta) filtered.push(path[ Math.round(i) ])

        return filtered.reverse()
    }
    else if (kind === 'every_nth') {
        // we always want to simulate the events for 2 initial and 2 final points of the path
        if (pathLength <= 4) return path.slice()

        const filtered      = [ path[ 0 ], path[ 1 ] ]

        for (let i = 1 + precision; i < pathLength - 2; i += precision) filtered.push(path[ i ])

        filtered.push(path[ pathLength - 2 ], path[ pathLength - 1])

        return filtered
    }
    else if (kind === 'last_only') {
        return path.slice(-precision)
    }
    else if (kind === 'first_and_last') {
        if (precision * 2 < pathLength)
            return [ ...path.slice(0, precision), ...path.slice(-precision) ]
        else
            return path.slice()
    }
}
