import { ActionTargetOffset, Point } from "../siesta/simulate/Types.js"
import { Rect } from "../util/Rect.js"
import { normalizeOffset } from "./Coordinates.js"
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
// TODO not clear if this property returns `true` for element,
// connected to the shadow root of the unconnected web component el
export const isElementConnected = (el : Element) : boolean => {
    return el.isConnected
}


//---------------------------------------------------------------------------------------------------------------------
export const isElementVisible = (el : Element) : boolean => {
    if (!isElementConnected(el)) return false

    const style     = getComputedStyle(el)

    if (style.display === 'none' || style.visibility === 'hidden') return false

    const rect      = el.getBoundingClientRect()

    return rect.width > 0 || rect.height > 0
}


//---------------------------------------------------------------------------------------------------------------------
export const waitForElementStable = async (el : Element, timeout : number) : Promise<boolean> => {
    const doc               = el.ownerDocument
    const win               = doc.defaultView

    let prevRect : Rect     = undefined
    let counter : number    = 0

    const start             = Date.now()

    return new Promise(resolve => {

        const checkForStability = () => {
            const elapsed   = Date.now() - start

            if (elapsed >= timeout) {
                resolve(false)

                return
            }

            //-----------------
            const rect      = Rect.new(el.getBoundingClientRect())

            if (!prevRect || !prevRect.isEqual(rect)) {
                prevRect    = rect
                counter     = 0
            } else {
                counter++

                if (counter >= 1) {
                    resolve(true)
                } else {
                    win.requestAnimationFrame(checkForStability)
                }
            }
        }

        win.requestAnimationFrame(checkForStability)
    })
}


//---------------------------------------------------------------------------------------------------------------------
export const isElementPointReachable = (el : Element, offsetArg : ActionTargetOffset, allowChild : boolean = false) : boolean => {
    const doc               = el.ownerDocument
    const win               = doc.defaultView

    const offset            = normalizeOffset(el, offsetArg)

    const rect              = el.getBoundingClientRect()

    // TODO should check that point is within visible viewport?

    const elAtPoint         = doc.elementFromPoint(rect.left + offset[ 0 ], rect.top + offset[ 1 ])

    return elAtPoint === el || allowChild && el.contains(elAtPoint)
}


//---------------------------------------------------------------------------------------------------------------------


/**
 * This method will return the top-most DOM element at the specified coordinates from the test page. If
 * the resulting element is an iframe and `shallow` argument is not passed as `true`
 * it'll query the iframe for its element from the local point inside it.
 *
 * @param {Number} x The X coordinate, relative to the viewport area (currently visible part of the page)
 * @param {Number} y The Y coordinate, relative to the viewport area (currently visible part of the page)
 * @param {Boolean} [shallow] Pass `true` to _not_ check nested iframes if an element at the original coordinates is an iframe.
 *
 * @return {HTMLElement} The top-most element at the specified position on the test page
 */
export const elementFromPoint = (queryRoot : DocumentOrShadowRoot, viewportX : number, viewportY : number, shallow : boolean = true)
    :
        { el : Element, localXY : Point } =>
{
    const el            = queryRoot.elementFromPoint(viewportX, viewportY)
    const rect          = el.getBoundingClientRect()

    if (!shallow && isHTMLIFrameElement(el) && isSameDomainIframe(el)) {
        return elementFromPoint(el.contentDocument, viewportX - rect.left, viewportY - rect.top, false)
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
