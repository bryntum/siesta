import { CI } from "../../../chained-iterator"
import { ActionTargetOffset, Point } from "../siesta/simulate/Types.js"
import { getBoundingPageRect, getViewportPageRect, isOffsetInsideElementBox, normalizeOffset } from "./Coordinates.js"
import { isElementVisible, parentElements } from "./Dom.js"


//---------------------------------------------------------------------------------------------------------------------
// this method assumes offset is within the element! see `isOffsetInsideElementBox`

export const isElementPointCropped = (el : Element, offset : ActionTargetOffset = [ '50%', '50%' ]) : boolean => {
    if (!isOffsetInsideElementBox(el, offset)) throw new Error("Can not use this method for offset outside of the element")

    const doc               = el.ownerDocument
    const win               = doc.defaultView

    let parents : Element[] = []

    for (let parent : Element = el; parent; parent = parent.parentElement) parents.push(parent)

    let currentRect         = getViewportPageRect(win)

    for (let i = parents.length - 1; i >= 0; i--) {
        const parent        = parents[ i ]

        const overflowX     = win.getComputedStyle(parent)[ 'overflow-x' ]
        const overflowY     = win.getComputedStyle(parent)[ 'overflow-y' ]

        if (overflowX !== 'visible' || overflowY !== 'visible') {
            let parentRect  = getBoundingPageRect(parent)

            if (overflowX !== 'visible') {
                currentRect     = currentRect.cropLeftRight(parentRect)
                if (currentRect.isEmpty()) return true
            }

            if (overflowY !== 'visible') {
                currentRect     = currentRect.cropTopBottom(parentRect)

                if (currentRect.isEmpty()) return true
            }
        }
    }

    const elPageRect        = getBoundingPageRect(el)
    const offsetPoint       = normalizeOffset(el, offset)

    return !currentRect.contains(elPageRect.left + offsetPoint[ 0 ], elPageRect.top + offsetPoint[ 1 ])
}


//---------------------------------------------------------------------------------------------------------------------
// A quite rough scroll-into-view functionality, does not take into account many things
// ideally, should go from bottom to top, scrolling the elements so that the target point becomes visible
// key consideration is that scrollable parent, by definition, can display any point of its (supposedly un-scrollable) children
// based on that, first need to scroll the target point into view of the scrollable parent
// then, treat that point as the point of that parent itself, and recursively continue to the top
// just porting from version 5 for now
export const scrollElementPointIntoView = (el : Element, offsetArg : ActionTargetOffset) : boolean => {
    // const doc               = el.ownerDocument
    // const win               = doc.defaultView

    const offset            = normalizeOffset(el, offsetArg)
    const isInside          = isOffsetInsideElementBox(el, offset)

    // If element isn't visible, try to bring it into view
    if (isElementVisible(el) && isInside && isElementPointCropped(el, offset)) {
        el.scrollIntoView()

        // If element is still out of view, try manually scrolling first scrollable parent found
        if (isElementPointCropped(el, offset)) {

            const scrollableParent  = CI(parentElements(el)).filter(el => isElementScrollable(el, 'x') || isElementScrollable(el, 'y')).take(1)[ 0 ]

            if (scrollableParent) {
                let parentBox       = scrollableParent.getBoundingClientRect()
                let targetBox       = el.getBoundingClientRect()

                scrollableParent.scrollLeft = Math.max(0, scrollableParent.scrollLeft + targetBox.left - parentBox.left + offset[ 0 ] - 1)
                scrollableParent.scrollTop  = Math.max(0, scrollableParent.scrollTop + targetBox.top - parentBox.top + offset[ 1 ] - 1)
            }
        }

        return true
    } else {
        return false
    }
}



//---------------------------------------------------------------------------------------------------------------------
export const scrollPagePointIntoView = (point : Point, win : Window) : boolean => {
    const doc           = win.document

    const visiblePageRect = getViewportPageRect(win)

    if (visiblePageRect.containsPoint(point)) {
        // no need to scroll, target point is within visible viewport area
        return false
    }

    const div           = doc.createElement('div')

    div.style.cssText   =
        `position: absolute !important; left: ${ point[ 0 ] }px !important; top: ${ point[ 1 ] }px !important;` +
        'border-width: 0 !important; padding: 0 !important; margin: 0 !important;' +
        'width: 1px !important; height: 1px !important;'

    doc.body.appendChild(div)

    div.scrollIntoView()

    doc.body.removeChild(div)

    return true
}



//---------------------------------------------------------------------------------------------------------------------
// element is considered "scrollable" by this method if its `overflow-x` style is `auto` or `scroll`
// and `scrollWidth` is bigger than `clientWidth` (same for Y-axis and height)
export const isElementScrollable = (el : Element, axis : 'x' | 'y') : boolean => {
    const doc               = el.ownerDocument
    const win               = doc.defaultView

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
