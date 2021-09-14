import { ActionTargetOffset, Point } from "../siesta/simulate/Types.js"
import { Rect } from "../util/Rect.js"
import { getViewportActionPoint, getViewportRect, isOffsetInsideElementBox, normalizeOffset } from "./Coordinates.js"
import { isHTMLIFrameElement } from "./Typeguards.js"

//---------------------------------------------------------------------------------------------------------------------
export const awaitDomReady = async () : Promise<void> => {
    if (document.readyState === 'complete') return

    await new Promise<Event>(resolve => window.addEventListener('load', resolve, { once : true }))
}


//---------------------------------------------------------------------------------------------------------------------
export const awaitDomInteractive = async () : Promise<void> => {
    if (document.readyState === 'interactive' || document.readyState === 'complete') return

    await new Promise<void>(resolve => {
        document.addEventListener(
            'readystatechange',
            () => {
                if (document.readyState === 'interactive' || document.readyState === 'complete') resolve()
            },
            { once : true }
        )
    })
}


//---------------------------------------------------------------------------------------------------------------------
export function * parentElements (el : Element, includeSelf : boolean = false) : Generator<Element> {
    if (includeSelf) yield el

    let current             = el.parentElement

    while (current) {
        yield current

        current             = current.parentElement
    }
}

//---------------------------------------------------------------------------------------------------------------------
export const isTopWindow = (win : Window) : boolean => {
    // @ts-ignore
    return !win.parent || win.parent.SIESTA_DASHBOARD
}



//---------------------------------------------------------------------------------------------------------------------
// TODO not clear if this property returns `true` for element,
// connected to the shadow root of the unconnected web component el
export const isElementConnected = (el : Element) : boolean => {
    return el.isConnected
}


//---------------------------------------------------------------------------------------------------------------------
export const isElementAccessible = (el : Element) : boolean => {
    if (!isElementConnected(el)) return false

    const style     = getComputedStyle(el)

    if (style.display === 'none' || style.visibility === 'hidden') return false

    const rect      = el.getBoundingClientRect()

    return rect.width > 0 && rect.height > 0
}


//---------------------------------------------------------------------------------------------------------------------
export const isElementVisible = (el : Element) : boolean => {
    if (!isElementAccessible(el)) return false

    const elViewportRect        = Rect.fromElement(el)
    const visibleViewportRect   = getViewportRect(el.ownerDocument.defaultView)

    const intersection          = visibleViewportRect.intersect(elViewportRect)

    return !intersection.isEmpty() && intersection.width > 0 && intersection.height > 0
}


//---------------------------------------------------------------------------------------------------------------------
// export const waitForElementStable = async (el : Element, timeout : number) : Promise<boolean> => {
//     const doc               = el.ownerDocument
//     const win               = doc.defaultView
//
//     let prevRect : Rect     = undefined
//     let counter : number    = 0
//
//     const start             = Date.now()
//
//     return new Promise(resolve => {
//
//         const checkForStability = () => {
//             const elapsed   = Date.now() - start
//
//             if (elapsed >= timeout) {
//                 resolve(false)
//
//                 return
//             }
//
//             //-----------------
//             const rect      = Rect.new(el.getBoundingClientRect())
//
//             if (!prevRect || !prevRect.isEqual(rect)) {
//                 prevRect    = rect
//                 counter     = 0
//             } else {
//                 counter++
//
//                 if (counter >= 1) {
//                     resolve(true)
//                 } else {
//                     win.requestAnimationFrame(checkForStability)
//                 }
//             }
//         }
//
//         win.requestAnimationFrame(checkForStability)
//     })
// }


//---------------------------------------------------------------------------------------------------------------------
export const isElementPointReachable = (
    el : Element, offset : ActionTargetOffset, allowChild : boolean = false
)
    : { reachable : boolean, point : Point, elAtPoint : Element } =>
{
    const doc               = el.ownerDocument

    const isInside          = isOffsetInsideElementBox(el, offset)

    const point             = getViewportActionPoint(el, offset)

    const elAtPoint         = doc.elementFromPoint(...point)

    // if the offset specifies a point outside of the element, this check
    // always succeeds
    const reachable         = !isInside || elAtPoint === el || allowChild && el.contains(elAtPoint)

    return { reachable, point, elAtPoint }
}


//---------------------------------------------------------------------------------------------------------------------
export const elementFromPoint = (queryRoot : DocumentOrShadowRoot, viewportX : number, viewportY : number, deep : boolean = false)
    :
        { el : Element, localXY : Point } =>
{
    const el            = queryRoot.elementFromPoint(viewportX, viewportY)
    const rect          = el.getBoundingClientRect()

    if (deep && isHTMLIFrameElement(el) && isSameDomainIframe(el)) {
        return elementFromPoint(el.contentDocument, viewportX - rect.left, viewportY - rect.top, true)
    }
    // else if (!shallow && el.shadowRoot) {
    //     return elementFromPoint(el.shadowRoot, viewportX - rect.left, viewportY - rect.top, false)
    // }
    else {
        return {
            el,
            localXY   : [ viewportX, viewportY ]
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const isSameDomainIframe = (el : HTMLIFrameElement) : boolean => {
    // according to MDN no try/catch is needed:
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentDocument

    // try {
        return Boolean(el.contentDocument)
    // }
    // catch (e) {
    //     return false
    // }
}
