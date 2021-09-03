import { ActionTargetOffset } from "../siesta/simulate/Types.js"
import { lastElement } from "../util/Helpers.js"
import { Rect } from "../util/Rect.js"
import { getBoundingPageRect, normalizeOffset } from "./Coordinates.js"


//---------------------------------------------------------------------------------------------------------------------
export const isElementPointScrolledOut = (el : Element, offset : ActionTargetOffset = [ '50%', '50%' ]) : boolean => {
    const doc               = el.ownerDocument
    const win               = doc.defaultView

    let parents : Element[] = []

    for (let parent : Element = el; parent; parent = parent.parentElement) parents.push(parent)

    let currentRect         = Rect.new({
        left        : window.scrollX,
        top         : window.scrollY,
        width       : window.innerWidth,
        height      : window.innerHeight
    })

    for (let i = parents.length - 1; i >= 0; i--) {
        const parent        = parents[ i ]

        const overflowX     = win.getComputedStyle(parent)[ 'overflow-x' ]
        const overflowY     = win.getComputedStyle(parent)[ 'overflow-y' ]

        if (overflowX !== 'visible' || overflowY !== 'visible') {
            let parentRect  = getBoundingPageRect(parent)

            if (overflowX !== 'visible') {
                currentRect = currentRect.cropLeftRight(parentRect)
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
