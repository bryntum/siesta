import { Base } from "typescript-mixin-class"
import { CI } from "chained-iterator"
import { ActionTargetOffset, Point, sumPoints } from "../siesta/simulate/Types.js"
import { Rect } from "../util/Rect.js"
import { getViewportRect, isOffsetInsideElementBox, normalizeOffset, translatePointToParentViewport } from "./Coordinates.js"
import { isElementAccessible, isTopWindow, parentElements, parentWindows } from "./Dom.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const scrollElementPointIntoView = (
    el : Element, offset : ActionTargetOffset = undefined, globally : boolean = false
)
    : boolean =>
{
    if (!isOffsetInsideElementBox(el, offset)) throw new Error("For `isElementPointVisible` offset should be inside the element's box")

    if (!isElementAccessible(el)) return false

    //-----------------------
    let currentWin : Window     = el.ownerDocument.defaultView

    //-----------------------
    const offsets               = new Map<Window, Point>()
    const windows               = Array.from(parentWindows(currentWin, true))

    for (let i = windows.length - 1; i >= 0; i--) {
        const win       = windows[ i ]

        if (i === windows.length - 1)
            offsets.set(win, [ 0, 0 ])
        else {
            const rect              = Rect.fromElement(win.frameElement)
            const previousOffset    = offsets.get(windows[ i + 1 ])

            offsets.set(win, sumPoints(rect.leftTop, previousOffset))
        }
    }

    //-----------------------
    let rect : Rect             = Rect.fromElement(el).shift(...offsets.get(currentWin))
    let point : Point           = sumPoints(rect.leftTop, normalizeOffset(el, offset))

    const elDimensionX          = ElementDimension.new({ el, type : 'width', rect })
    const elDimensionY          = ElementDimension.new({ el, type : 'height', rect, style : elDimensionX.style })

    let currentDimensionX       = elDimensionX
    let currentDimensionY       = elDimensionY

    let currentEl               = el

    do {
        const offset            = offsets.get(currentWin)

        CI(parentElements(currentEl)).forEach(el => {
            const parentDimensionX      = ElementDimension.new({
                el,
                type        : 'width'
            })
            // delegate the creation of the rectangle to the ElementDimension, since it uses special logic for
            // root <html> element
            parentDimensionX.rect       = parentDimensionX.rect.shift(...offset)
            // micro-opt - re-use the `rect` and `style` properties from the sibling dimension
            const parentDimensionY      = ElementDimension.new({
                el,
                type        : 'height',
                rect        : parentDimensionX.rect,
                style       : parentDimensionX.style
            })

            currentDimensionX.parent    = parentDimensionX
            currentDimensionY.parent    = parentDimensionY

            currentDimensionX           = parentDimensionX
            currentDimensionY           = parentDimensionY
        })

        if (!globally || isTopWindow(currentWin)) break

        currentEl                       = currentWin.frameElement
        currentWin                      = currentWin.parent

        const frameElDimensionX         = ElementDimension.new({
            el          : currentEl,
            type        : 'width',
            rect        : Rect.fromElementContent(currentEl as HTMLElement).shift(...offsets.get(currentWin))
        })
        const frameElDimensionY         = ElementDimension.new({
            el          : currentEl,
            type        : 'height',
            rect        : frameElDimensionX.rect,
            style       : frameElDimensionX.style
        })

        currentDimensionX.parent        = frameElDimensionX
        currentDimensionY.parent        = frameElDimensionY

        currentDimensionX               = frameElDimensionX
        currentDimensionY               = frameElDimensionY
    } while (true)

    const horizontalRes         = elDimensionX.scrollContentPointIntoView(point[ 0 ])
    const verticalRes           = elDimensionY.scrollContentPointIntoView(point[ 1 ])

    return horizontalRes && verticalRes
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getScrollbarWidth = (el : HTMLElement, axis : 'x' | 'y') : number => {
    const win               = el.ownerDocument.defaultView
    const style             = win.getComputedStyle(el)

    if (axis === 'x') {
        return el.offsetWidth - el.clientWidth - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth)
    } else {
        return el.offsetHeight - el.clientHeight - Number.parseFloat(style.borderTopWidth) - Number.parseFloat(style.borderBottomWidth)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getMaxScroll = (el : HTMLElement, axis : 'x' | 'y') : number => {
    if (axis === 'x') {
        return el.scrollWidth - (el.getBoundingClientRect().width - getScrollbarWidth(el, 'x'))
    } else {
        return el.scrollHeight - (el.getBoundingClientRect().height - getScrollbarWidth(el, 'y'))
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Segment extends Base {
    start           : number        = undefined
    end             : number        = undefined

    length          : number        = undefined


    initialize (props? : Partial<Segment>) {
        super.initialize(props)

        const start         = this.start
        const end           = this.end
        const length        = this.length

        if (start === undefined && end !== undefined && length !== undefined) this.start    = end - length
        if (end === undefined && start !== undefined && length !== undefined) this.end      = start + length
        if (end !== undefined && start !== undefined && length === undefined) this.length   = end - start
    }


    get center () : number {
        return this.start + this.length / 2
    }


    isEmpty () : boolean {
        return this.start === undefined || this.end === undefined || this.length === undefined || this.length === 0
    }


    intersect (another : Segment) : Segment {
        const cls       = this.constructor as typeof Segment

        if (this.isEmpty() || another.isEmpty() || another.start >= this.end || this.end <= another.start) return cls.new()

        return cls.new({
            start   : Math.max(this.start, another.start),
            end     : Math.min(this.end, another.end),
        })
    }


    contains (point : number) : boolean {
        return this.start <= point && point < this.end
    }
}


export class ElementDimension extends Segment {
    el              : Element               = undefined
    type            : 'width' | 'height'    = 'width'

    rect            : Rect                  = undefined
    style           : CSSStyleDeclaration   = undefined

    parent          : ElementDimension      = undefined


    initialize (props? : Partial<ElementDimension>) {
        Object.assign(this, props)

        if (!this.rect)
            this.rect   = this.el.parentElement
                ? Rect.fromElementContent(this.el as HTMLElement)
                : getViewportRect(this.el.ownerDocument.defaultView)

        super.initialize(...arguments)

        if (!this.style) this.style = this.el.ownerDocument.defaultView.getComputedStyle(this.el)
    }


    // @ts-expect-error
    get start () : number {
        return this.type === 'width' ? this.rect.left : this.rect.top
    }
    set start (value : number) {
    }


    // @ts-expect-error
    get end () : number {
        return this.type === 'width' ? this.rect.right : this.rect.bottom
    }
    set end (value : number) {
    }


    // @ts-expect-error
    get length () : number {
        return this.type === 'width' ? this.rect.width : this.rect.height
    }
    set length (value : number) {
    }


    get scrollLength () : number {
        return this.type === 'width' ? this.el.scrollWidth : this.el.scrollHeight
    }


    get scroll () : number {
        return this.type === 'width' ? this.el.scrollLeft : this.el.scrollTop
    }
    set scroll (value : number) {
        this.type === 'width' ? this.el.scrollLeft = value : this.el.scrollTop = value
    }


    get overflowVisible () : boolean {
        const style     = this.type === 'width' ? this.style[ 'overflow-x' ] : this.style[ 'overflow-y' ]

        return style === 'visible'
    }

    get scrollable () : boolean {
        const style     = this.type === 'width' ? this.style[ 'overflow-x' ] : this.style[ 'overflow-y' ]

        /*
            from the: https://www.w3.org/TR/CSS22/visufx.html

            UAs must apply the 'overflow' property set on the root element to the viewport. When the root element
            is an HTML "HTML" element or an XHTML "html" element, and that element has an HTML "BODY" element
            or an XHTML "body" element as a child, user agents must instead apply the 'overflow' property from
            the first such child element to the viewport, if the value on the root element is 'visible'.
        ->> The 'visible' value when used for the viewport must be interpreted as 'auto'. <<-
            The element from which the value is propagated must have a used value for 'overflow' of 'visible'.
         */
        return (style === 'scroll' || style === 'auto' || (style === 'visible' && this.isHtmlElement)) && this.maxScroll > 0
    }


    get isHtmlElement () : boolean {
        return !this.el.parentElement
    }


    get maxScroll () : number {
        // this is a hack, since on the <html> element the scroll bar is not included into the `getBoundingClientRect`
        // results, plus we don't use `getBoundingClientRect` for <html>, instead we use `getViewportRect`
        // ideally, we need one more element on top of the ElementDimension, that would represent `getViewportRect`
        // but applying this hack is easier for now
        const length        = this.isHtmlElement
            ? this.type === 'width' ? this.el.getBoundingClientRect().width : this.el.getBoundingClientRect().height
            : this.length

        return this.scrollLength - (length - getScrollbarWidth(this.el as HTMLElement, this.type === 'width' ? 'x' : 'y'))
    }


    get clientSegment () : Segment {
        return Segment.new({ start : this.start, length : this.length })
    }


    get viewport () : Segment {
        const parent        = this.parent

        if (!parent) return this.clientSegment

        return parent.scrollable || parent.overflowVisible ? this.clientSegment : parent.viewport.intersect(this)
    }


    calculateScrollDelta (sourcePoint : number, targetPoint : number) : number {
        const delta             = sourcePoint - targetPoint
        const needScroll        = this.scroll + delta

        const maxScroll         = this.maxScroll

        if (0 <= needScroll && needScroll <= maxScroll) {
            return delta
        }
        else if (needScroll < 0) {
            return -this.scroll
        }
        else if (needScroll > maxScroll) {
            return maxScroll - this.scroll
        }
    }


    scrollScrollPointIntoView (sourcePoint : number) : boolean {
        if (this.viewport.isEmpty() || !this.scrollable && !this.overflowVisible && !this.contains(sourcePoint)) return false

        const delta     = this.scrollable ? this.calculateScrollDelta(sourcePoint, this.viewport.center) : 0

        this.scroll     += delta

        return this.parent ? this.parent.scrollScrollPointIntoView(sourcePoint - delta) : this.contains(sourcePoint - delta)
    }


    scrollContentPointIntoView (sourcePoint : number) : boolean {
        if (!this.contains(sourcePoint)) throw new Error("Can only scroll points within own content area")

        return this.parent.scrollScrollPointIntoView(sourcePoint)
    }
}
