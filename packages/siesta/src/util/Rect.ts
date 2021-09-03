import { Base } from "typescript-mixin-class"

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


    isEmpty () {
        return this.left === undefined
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


    equalsTo (rect : Rect) : boolean {
        return this.left === rect.left && this.right === rect.right && this.top === rect.top && this.bottom === rect.bottom
    }
}
