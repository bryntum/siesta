import { Base } from "typescript-mixin-class"
import { CI } from "chained-iterator"
import { ActionTargetOffset, Point, sumPoints } from "../siesta/simulate/Types.js"
import { Rect } from "../util/Rect.js"
import { getViewportRect, isOffsetInsideElementBox, normalizeOffset, translatePointToParentViewport } from "./Coordinates.js"
import { isElementAccessible, isTopWindow, parentElements } from "./Dom.js"


//---------------------------------------------------------------------------------------------------------------------
export const scrollElementPointIntoView = (
    el : Element, offset : ActionTargetOffset = undefined, globally : boolean = false
)
    : boolean =>
{
    if (!isOffsetInsideElementBox(el, offset)) throw new Error("For `isElementPointVisible` offset should be inside the element's box")

    if (!isElementAccessible(el)) return false

    // let currentWin : Window     = el.ownerDocument.defaultView
    // let currentEl : Element     = el
    let rect : Rect             = Rect.fromElement(el)
    let point : Point           = sumPoints(rect.leftTop, normalizeOffset(el, offset))

    const elDimensionX          = ElementDimension.new({ el, type : 'width', rect })
    const elDimensionY          = ElementDimension.new({ el, type : 'height', rect, style : elDimensionX.style })

    let currentDimensionX       = elDimensionX
    let currentDimensionY       = elDimensionY

    CI(parentElements(el)).forEach(el => {
        const parentDimensionX      = ElementDimension.new({ el, type : 'width' })
        // micro-opt - re-use the `rect` and `style` properties from the sibling dimension
        const parentDimensionY      = ElementDimension.new({ el, type : 'height', rect : parentDimensionX.rect, style : parentDimensionX.style })

        currentDimensionX.parent    = parentDimensionX
        currentDimensionY.parent    = parentDimensionY

        currentDimensionX           = parentDimensionX
        currentDimensionY           = parentDimensionY
    })

    const horizontalRes             = elDimensionX.scrollContentPointIntoView(point[ 0 ])
    const verticalRes               = elDimensionY.scrollContentPointIntoView(point[ 1 ])

    return horizontalRes && verticalRes
}


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


//---------------------------------------------------------------------------------------------------------------------
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
            this.rect   = this.el.parentElement ? Rect.fromElementContent(this.el as HTMLElement) : getViewportRect(this.el.ownerDocument.defaultView)

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
        return this.scrollLength - this.length
    }


    get rootViewport () : Segment {
        const rect      = getViewportRect(this.el.ownerDocument.defaultView)

        return this.parent
            ?
                this.parent.scrollable ? this.parent.rootViewport : this.parent.rootViewport.intersect(this)
            :
                Segment.new({ start : this.start, length : this.length })
    }


    get scrollSegment () : Segment {
        return Segment.new({ start : this.start - this.scroll, length : this.scrollLength })
    }


    get viewport () : Segment {
        const parent        = this.parent

        if (!parent) return this.rootViewport

        if (parent.scrollable || parent.overflowVisible) {
            return Segment.new({ start : this.start, length : this.length })
        }
        else {
            return parent.viewport.intersect(this)
        }
    }


    scrollScrollPointIntoView (sourcePoint : number) : boolean {
        if (!this.scrollable) {
            if (!this.overflowVisible && !this.contains(sourcePoint)) return false

            if (this.parent)
                return this.parent.scrollScrollPointIntoView(sourcePoint)
            else {
                return this.contains(sourcePoint)
            }
        }

        // this is area we _can_ scroll to
        const thisVisibleArea       = this.viewport
        // this is the point, we'd _like_ to scroll to
        const rootViewportCenter    = this.rootViewport.center

        const targetPoint       = thisVisibleArea.contains(rootViewportCenter)
            ? rootViewportCenter
            : thisVisibleArea.start > rootViewportCenter
                ? thisVisibleArea.start
                : thisVisibleArea.end

        const delta             = sourcePoint - targetPoint
        const needScroll        = this.scroll + delta

        if (0 <= needScroll && needScroll <= this.maxScroll) {
            this.scroll       += delta

            return true
        }
        else if (needScroll < 0) {
            const delta         = -this.scroll

            this.scroll         = 0

            return this.parent ? this.parent.scrollScrollPointIntoView(sourcePoint + delta) : this.contains(sourcePoint + delta)
        }
        else if (needScroll > this.maxScroll) {
            const delta         = this.maxScroll - this.scroll

            this.scroll         = this.maxScroll

            return this.parent ? this.parent.scrollScrollPointIntoView(sourcePoint - delta) : this.contains(sourcePoint - delta)
        }

    }


    scrollContentPointIntoView (sourcePoint : number) : boolean {
        if (!this.contains(sourcePoint)) throw new Error("Can only scroll points within own content area")

        return this.scrollScrollPointIntoView(sourcePoint)
    }
}
