import { Base } from "typescript-mixin-class"
import { Point } from "../siesta/simulate/Types.js"
import { getScrollbarWidth } from "../util_browser/Scroll.js"

export class Rect extends Base {
    left            : number        = undefined
    top             : number        = undefined

    width           : number        = undefined
    height          : number        = undefined

    right           : number        = undefined
    bottom          : number        = undefined


    initialize () {
        super.initialize(...arguments)

        const left          = this.left
        const width         = this.width
        const right         = this.right

        if (right === undefined && left !== undefined && width !== undefined) this.right = left + width - 1
        if (width === undefined && left !== undefined && right !== undefined) this.width = right - left + 1

        const top           = this.top
        const height        = this.height
        const bottom        = this.bottom

        if (bottom === undefined && top !== undefined && height !== undefined) this.bottom = top + height - 1
        if (height === undefined && top !== undefined && bottom !== undefined) this.height = bottom - top + 1
    }


    // rect is empty when it does not have any of the coords to form a rect, or its width or height <= 0
    isEmpty () : boolean {
        return this.left === undefined || this.top === undefined || this.width === 0 || this.height === 0
    }


    get leftTop () : Point {
        return [ this.left, this.top ]
    }


    get center () : Point {
        return [ this.left + this.width / 2, this.top + this.height / 2 ]
    }


    intersect (rect : Rect) : Rect {
        if (
            rect.isEmpty() || this.isEmpty()
                ||
            rect.left > this.right || rect.right < this.left
                ||
            rect.top > this.bottom || rect.bottom < this.top
        ) {
            return Rect.new()
        }

        const cls       = this.constructor as typeof Rect

        return cls.new({
            left        : Math.max(this.left, rect.left),
            right       : Math.min(this.right, rect.right),
            top         : Math.max(this.top, rect.top),
            bottom      : Math.min(this.bottom, rect.bottom)
        })
    }


    contains (left : number, top : number) : boolean {
        return this.left <= left && left <= this.right
            && this.top <= top && top <= this.bottom
    }


    containsPoint (point : Point) : boolean {
        return this.contains(point[ 0 ], point[ 1 ])
    }


    shiftHorizontally (dx : number) : Rect {
        const cls       = this.constructor as typeof Rect

        return cls.new({
            left        : this.left + dx,
            top         : this.top,
            width       : this.width,
            height      : this.height
        })
    }


    shiftVertically (dy : number) : Rect {
        const cls       = this.constructor as typeof Rect

        return cls.new({
            left        : this.left,
            top         : this.top  + dy,
            width       : this.width,
            height      : this.height
        })
    }


    cropLeftRight (rect : Rect) : Rect {
        const cls       = this.constructor as typeof Rect

        return this.intersect(cls.new({
            left        : rect.left,
            right       : rect.right,
            top         : this.top,
            bottom      : this.bottom
        }))
    }


    cropTopBottom (rect : Rect) : Rect {
        const cls       = this.constructor as typeof Rect

        return this.intersect(cls.new({
            left        : this.left,
            right       : this.right,
            top         : rect.top,
            bottom      : rect.bottom
        }))
    }


    translateToParentViewport (win : Window) : Rect {
        const frame     = win.frameElement

        if (!frame) throw new Error('Window is already top')

        const frameRect = frame.getBoundingClientRect()

        const cls       = this.constructor as typeof Rect

        return cls.new({
            left        : frameRect.left + this.left,
            top         : frameRect.top + this.top,
            width       : this.width,
            height      : this.height
        })
    }


    isEqual (rect : Rect) : boolean {
        return this.left === rect.left && this.right === rect.right && this.top === rect.top && this.bottom === rect.bottom
    }


    static fromElement<T extends typeof Rect> (this : T, el : Element) : InstanceType<T> {
        const rect      = el.getBoundingClientRect()

        return this.new({
            left        : rect.left,
            top         : rect.top,
            width       : rect.width,
            height      : rect.height
        } as Partial<InstanceType<T>>)
    }


    static fromElementContent<T extends typeof Rect> (this : T, el : HTMLElement) : InstanceType<T> {
        const win       = el.ownerDocument.defaultView
        const style     = win.getComputedStyle(el)
        const rect      = el.getBoundingClientRect()

        const borderLeftWidth   = Number.parseFloat(style.borderLeftWidth)
        const borderRightWidth  = Number.parseFloat(style.borderRightWidth)
        const borderTopWidth    = Number.parseFloat(style.borderTopWidth)
        const borderBottomWidth = Number.parseFloat(style.borderBottomWidth)

        return this.new({
            left        : rect.left + borderLeftWidth,
            top         : rect.top + borderTopWidth,
            width       : rect.width - borderLeftWidth - borderRightWidth - getScrollbarWidth(el, 'x'),
            height      : rect.height - borderTopWidth - borderBottomWidth - getScrollbarWidth(el, 'y')
        } as Partial<InstanceType<T>>)
    }
}
