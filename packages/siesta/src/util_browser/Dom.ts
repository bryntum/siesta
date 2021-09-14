import { ActionTargetOffset, Point, sumPoints } from "../siesta/simulate/Types.js"
import { Rect } from "../util/Rect.js"
import { getViewportActionPoint, getViewportRect, isOffsetInsideElementBox, normalizeOffset, translatePointToParentViewport } from "./Coordinates.js"
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
export const isElementVisible = (el : Element, globally : boolean = false) : boolean => {
    if (!isElementAccessible(el)) return false

    let currentWin : Window     = el.ownerDocument.defaultView
    let currentRect : Rect      = Rect.fromElement(el)

    while (true) {
        const visibleViewportRect   = getViewportRect(currentWin)

        const intersection          = visibleViewportRect.intersect(currentRect)

        if (intersection.isEmpty() || intersection.width === 0 || intersection.height === 0)
            return false
        else
            if (!globally || currentWin === currentWin.top) return true

        currentRect             = intersection.translateToParentViewport(currentWin)
        currentWin              = currentWin.parent
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const isElementPointVisible = (el : Element, offset : ActionTargetOffset | undefined, globally : boolean = false) : boolean => {
    if (!isElementAccessible(el)) return false

    let currentWin : Window     = el.ownerDocument.defaultView
    let currentEl : Element     = el
    let currentRect : Rect      = Rect.fromElement(el)
    let currentPoint : Point    = sumPoints([ currentRect.left, currentRect.top ], normalizeOffset(el, offset))

    while (true) {
        const visibleViewportRect   = getViewportRect(currentWin)

        const intersection          = visibleViewportRect.intersect(currentRect)

        // no offset mean - any visible point is suitable
        const isPointVisible    = (!offset && !intersection.isEmpty()) || intersection.containsPoint(currentPoint)

        if (!isPointVisible || isTopWindow(currentWin)) return isPointVisible

        currentPoint            = translatePointToParentViewport(currentPoint, currentWin)
        currentRect             = intersection.translateToParentViewport(currentWin)
        currentWin              = currentWin.parent
    }
}


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
    return Boolean(el.contentDocument)
}
