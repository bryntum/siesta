import { CI } from "chained-iterator"
import { ActionTargetOffset, Point, sumPoints } from "../siesta/simulate/Types.js"
import { Rect } from "../util/Rect.js"
import { getViewportActionPoint, getViewportRect, isOffsetInsideElementBox, normalizeOffset, translatePointToParentViewport } from "./Coordinates.js"
import { isHTMLIFrameElement, isShadowRoot } from "./Typeguards.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const awaitDomReady = async () : Promise<void> => {
    if (document.readyState === 'complete') return

    await new Promise<Event>(resolve => window.addEventListener('load', resolve, { once : true }))
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function * parentElements (el : Element, includeSelf : boolean = false) : Generator<Element> {
    if (includeSelf) yield el

    let current             = el.parentElement

    while (current) {
        yield current

        current             = current.parentElement
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function * parentWindows (win : Window, includeSelf : boolean = false) : Generator<Window> {
    let current             = win

    while (current) {
        if (current !== win || includeSelf) yield current

        if (isTopWindow(current)) return

        current             = current.parent
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isTopWindow = (win : Window) : boolean => {
    return win.parent === win
        // @ts-ignore
        || Boolean(win.parent.SIESTA_DASHBOARD)
}



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isElementConnected = (el : Element) : boolean => {
    return el.isConnected
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isElementAccessible = (el : Element) : boolean => {
    if (!isElementConnected(el)) return false

    const style     = getComputedStyle(el)

    if (style.display === 'none' || style.visibility === 'hidden') return false

    const rect      = el.getBoundingClientRect()

    return rect.width > 0 && rect.height > 0
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TODO rewrite to the ElementDimension mechanism
export const isElementPointVisible = (el : Element, offset : ActionTargetOffset | undefined = undefined, globally : boolean = false)
    : { visible : false } | { visible : true, globalXY : Point } =>
{
    if (!el) throw new Error("Element argument is required for `isElementPointVisible`")

    if (!isOffsetInsideElementBox(el, offset)) throw new Error("For `isElementPointVisible` offset should be inside the element's box")

    if (!isElementAccessible(el)) return { visible : false }

    let currentWin : Window     = el.ownerDocument.defaultView
    let currentEl : Element     = el
    let currentRect : Rect      = Rect.fromElement(el)
    let currentPoint : Point    = sumPoints(currentRect.leftTop, normalizeOffset(el, offset))

    while (true) {
        const parentEl          = currentEl.parentElement
        const isTopEl           = !parentEl || !parentEl.parentElement
        const isTop             = (!globally || isTopWindow(currentWin)) && isTopEl

        if (parentEl) {
            const parentRect        = isTopEl ? getViewportRect(currentWin) : Rect.fromElementContent(parentEl)

            const parentStyle       = currentWin.getComputedStyle(parentEl)
            const overflowX         = parentStyle[ 'overflow-x' ]
            const overflowY         = parentStyle[ 'overflow-y' ]

            if (overflowX !== 'visible' || isTopEl) currentRect = currentRect.cropLeftRight(parentRect)
            if (overflowY !== 'visible' || isTopEl) currentRect = currentRect.cropTopBottom(parentRect)
        } else {
            currentRect         = currentRect.intersect(getViewportRect(currentWin))
        }

        const isPointVisible    = (!offset && !currentRect.isEmpty()) || currentRect.containsPoint(currentPoint)

        if (!isPointVisible)
            return { visible : false }
        else
            if (isTop) return { visible : true, globalXY : currentPoint }

        if (parentEl.parentElement) {
            currentEl           = parentEl
        } else {
            currentEl           = currentWin.frameElement
            currentPoint        = translatePointToParentViewport(currentPoint, currentWin)
            currentRect         = currentRect.translateToParentViewport(currentWin)
            currentWin          = currentWin.parent
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isElementPointReachable = (
    el : Element, offset : ActionTargetOffset, allowChild : boolean = false
)
    : { reachable : boolean, point : Point, elAtPoint : Element } =>
{
    if (!isOffsetInsideElementBox(el, offset)) throw new Error("Can only check inside offsets for reachability")

    const point             = getViewportActionPoint(el, offset)

    if (!point) return { reachable : false, point, elAtPoint : undefined }

    const elAtPoint         = elementFromPoint(el.ownerDocument, ...point, true).el

    const reachable         = elAtPoint === el || allowChild && el.contains(elAtPoint)

    return { reachable, point, elAtPoint }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const elementFromPoint = (queryRoot : DocumentOrShadowRoot, viewportX : number, viewportY : number, deep : boolean = false)
    :
        { el : Element, localXY : Point } =>
{
    const el            = queryRoot.elementFromPoint(viewportX, viewportY)

    if (deep && isHTMLIFrameElement(el) && isSameDomainIframe(el)) {
        const rect      = el.getBoundingClientRect()

        return elementFromPoint(el.contentDocument, viewportX - rect.left, viewportY - rect.top, true)
    }
    else if (deep && el.shadowRoot) {
        const testSelf  = el.shadowRoot.elementFromPoint(viewportX, viewportY)

        // possibly the shadow root query will return the web component itself
        // in such case we should not recurse
        return testSelf === el
            ? { el, localXY : [ viewportX, viewportY ] }
            : elementFromPoint(el.shadowRoot, viewportX, viewportY, true)
    }
    else {
        return {
            el,
            localXY   : [ viewportX, viewportY ]
        }
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isSameDomainIframe = (el : HTMLIFrameElement) : boolean => {
    // according to MDN no try/catch is needed:
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentDocument
    return Boolean(el.contentDocument)
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const activeElement = (doc : DocumentOrShadowRoot = document, deep : boolean = true) : Element => {
    let focusedEl       = doc.activeElement

    if (deep && focusedEl) {
        if (isHTMLIFrameElement(focusedEl) && isSameDomainIframe(focusedEl))
            focusedEl = activeElement(focusedEl.contentDocument, true)
        else if (focusedEl.shadowRoot)
            focusedEl = activeElement(focusedEl.shadowRoot, true)
    }

    return focusedEl || (isShadowRoot(doc) ? doc.host : (doc as Document).body)
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// in Firefox, to focus the element inside the iframe, one need to focus the iframe
// element itself first, otherwise the call to `.focus()` method is ignored
export const focusElement = (el : HTMLElement) => {
    if (!el.isConnected) return

    CI(parentWindows(el.ownerDocument.defaultView, true)).reversed().forEach((win : Window, index : number) => {
        // ignore top window
        if (index === 0) return

        const frameElement  = win.frameElement as HTMLIFrameElement

        frameElement?.focus({ preventScroll : true })
    })

    el.focus({ preventScroll : true })
}

