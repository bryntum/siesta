import { ActionTargetOffset, Point, sumPoints } from "../siesta/simulate/Types.js"
import { Rect } from "../util/Rect.js"
import { isOffsetInsideElementBox, normalizeOffset, translatePointToParentViewport } from "./Coordinates.js"
import { isElementAccessible, isTopWindow } from "./Dom.js"


//---------------------------------------------------------------------------------------------------------------------
// A quite rough scroll-into-view functionality, does not take into account many things
// ideally, should go from bottom to top, scrolling the elements so that the target point becomes visible
// key consideration is that scrollable parent, by definition, can display any point of its (supposedly un-scrollable) children
// based on that, first need to scroll the target point into view of the scrollable parent
// then, treat that point as the point of that parent itself, and recursively continue to the top
// just porting from version 5 for now
export const scrollElementPointIntoView = (
    el : Element, offset : ActionTargetOffset = undefined, globally : boolean = false
)
    : boolean =>
{
    if (!isOffsetInsideElementBox(el, offset)) throw new Error("For `isElementPointVisible` offset should be inside the element's box")

    if (!isElementAccessible(el)) return false

    let currentWin : Window     = el.ownerDocument.defaultView
    let currentEl : Element     = el
    let currentRect : Rect      = Rect.fromElement(el)
    let currentPoint : Point    = sumPoints(currentRect.leftTop, normalizeOffset(el, offset))

    while (true) {
        const parentEl          = currentEl.parentElement
        const parentRect        = Rect.fromElementContent(parentEl)

        const parentStyle       = currentWin.getComputedStyle(parentEl)
        const overflowX         = parentStyle[ 'overflow-x' ]
        const overflowY         = parentStyle[ 'overflow-y' ]
        const scrollableX       = overflowX === 'scroll' || overflowX === 'auto'
        const scrollableY       = overflowY === 'scroll' || overflowY === 'auto'

        if (overflowX !== 'visible') {
            const currentX      = currentPoint[ 0 ]

            if (parentRect.left <= currentX && currentX <= parentRect.right) {
                // point is within parent area already, do nothing
                // TODO should check the "reachable" parent area, since not whole
                // area of the parent might be visible
            } else {
                if (scrollableX) {
                    if (parentRect.right < currentPoint[ 0 ]) {
                        const dx        = currentPoint[ 0 ] - parentRect.right

                        parentEl.scrollLeft += dx
                        currentPoint[ 0 ]   -= dx
                    }
                    else if (parentRect.left > currentPoint[ 0 ]) {
                        const dx        = parentRect.left - currentPoint[ 0 ]

                        parentEl.scrollLeft -= dx
                        currentPoint[ 0 ]   += dx
                    }
                }
                else {
                    return false
                }
            }
        }

        if (overflowY !== 'visible') {
            const currentY      = currentPoint[ 1 ]

            if (parentRect.top <= currentY && currentY <= parentRect.bottom) {
                // point is within parent area already, do nothing
                // TODO should check the "reachable" parent area, since not whole
                // area of the parent might be visible
            } else {
                if (scrollableY) {
                    if (parentRect.bottom < currentPoint[ 1 ]) {
                        const dy        = currentPoint[ 1 ] - parentRect.bottom

                        parentEl.scrollTop  += dy
                        currentPoint[ 1 ]   -= dy
                    }
                    else if (parentRect.top > currentPoint[ 1 ]) {
                        const dy        = parentRect.top - currentPoint[ 1 ]

                        parentEl.scrollTop  -= dy
                        currentPoint[ 1 ]   += dy
                    }
                }
                else {
                    return false
                }
            }
        }

        if (parentEl.parentElement) {
            currentEl           = parentEl
        } else {
            if (!globally || isTopWindow(currentWin)) return true

            currentEl           = currentWin.frameElement
            currentPoint        = translatePointToParentViewport(currentPoint, currentWin)
            // currentRect         = currentRect.translateToParentViewport(currentWin)
            currentWin          = currentWin.parent
        }
    }
}



//---------------------------------------------------------------------------------------------------------------------
// export const scrollPagePointIntoView = (point : Point, win : Window) : boolean => {
//     const doc           = win.document
//
//     const visiblePageRect = getViewportPageRect(win)
//
//     if (visiblePageRect.containsPoint(point)) {
//         // no need to scroll, target point is within visible viewport area
//         return false
//     }
//
//     const div           = doc.createElement('div')
//
//     div.style.cssText   =
//         `position: absolute !important; left: ${ point[ 0 ] }px !important; top: ${ point[ 1 ] }px !important;` +
//         'border-width: 0 !important; padding: 0 !important; margin: 0 !important;' +
//         'width: 1px !important; height: 1px !important;'
//
//     doc.body.appendChild(div)
//
//     div.scrollIntoView()
//
//     doc.body.removeChild(div)
//
//     return true
// }



//---------------------------------------------------------------------------------------------------------------------
// element is considered "scrollable" by this method if its `overflow-x` style is `auto` or `scroll`
// and `scrollWidth` is bigger than `clientWidth` (same for Y-axis and height)
export const isElementScrollable = (el : Element, axis : 'x' | 'y') : boolean => {
    const win               = el.ownerDocument.defaultView

    const style             = win.getComputedStyle(el)

    if (axis === 'x') {
        const overflowX     = style.overflowX

        if (overflowX === 'hidden' || overflowX === 'visible') return false

        return el.scrollWidth > el.clientWidth
    } else {
        const overflowY     = style.overflowY

        if (overflowY === 'hidden' || overflowY === 'visible') return false

        return el.scrollHeight > el.clientHeight
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const getScrollbarWidth = (el : HTMLElement, axis : 'x' | 'y') : number => {
    const win               = el.ownerDocument.defaultView
    const style             = win.getComputedStyle(el)

    if (axis === 'x') {
        return el.offsetWidth - el.clientWidth - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth)
    } else {
        return el.offsetHeight - el.clientHeight - Number.parseFloat(style.borderTopWidth) - Number.parseFloat(style.borderBottomWidth)
    }
}
