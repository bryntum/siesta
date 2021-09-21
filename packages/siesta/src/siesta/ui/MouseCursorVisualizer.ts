import { siestaPackageRootUrl } from "../../../index.js"
import { Base } from "../../class/Mixin.js"
import { awaitDomInteractive } from "../../util_browser/Dom.js"

//---------------------------------------------------------------------------------------------------------------------
export class MouseCursorVisualizer extends Base {

    listenerDown    : (e : PointerEvent) => void        = undefined
    listenerUp      : (e : PointerEvent) => void        = undefined
    listenerMove    : (e : PointerEvent) => void        = undefined
    listenerClick   : (e : MouseEvent) => void          = undefined


    pointerEl       : HTMLImageElement                  = undefined


    async start () {
        await awaitDomInteractive()

        const pointerEl             = this.pointerEl = document.createElement('img')

        pointerEl.src               = `${ siestaPackageRootUrl }resources/styling/browser/images/mouse-pointer-solid.svg`
        pointerEl.style.cssText     =
            'position: fixed; pointer-events: none; width: 10px; left: 0; top: 0; z-index: 100000; transition: all 0.2s'

        document.body.appendChild(pointerEl)

        this.listenerDown           = e => this.onPointerDown(e)
        this.listenerUp             = e => this.onPointerUp(e)
        this.listenerMove           = e => this.onPointerMove(e)
        this.listenerClick          = e => this.onClick(e)

        document.addEventListener('pointerdown', this.listenerDown, true)
        document.addEventListener('pointerup', this.listenerUp, true)
        document.addEventListener('pointermove', this.listenerMove, true)
        document.addEventListener('click', this.listenerClick, true)
    }


    stop () {
        document.removeEventListener('pointerdown', this.listenerDown, true)
        document.removeEventListener('pointerup', this.listenerUp, true)
        document.removeEventListener('pointermove', this.listenerMove, true)
        document.removeEventListener('click', this.listenerClick, true)
    }


    onPointerMove (e : PointerEvent) {
        if (!this.pointerEl.isConnected) document.body.appendChild(this.pointerEl)

        this.pointerEl.style.left   = e.clientX + 'px'
        this.pointerEl.style.top    = e.clientY + 'px'
    }


    onPointerUp (e : PointerEvent) {
    }


    onPointerDown (e : PointerEvent) {
    }


    onClick (e : MouseEvent) {
        const clickEl       = document.createElement('div')

        clickEl.style.cssText   =
            'position: fixed; pointer-events: none; z-index: 100000; ' +
            'border-radius: 50%; ' +
            'transform: translate(-50%, -50%);' +
            'background: rgba(215, 187, 187, 0.7);' +
            'transition: all 1.2s ease-in-out;' +
            `width: 0px; height: 0px; left: ${ e.clientX }px; top: ${ e.clientY }px;`

        document.body.appendChild(clickEl)

        clickEl.offsetTop

        clickEl.style.width     = '30px'
        clickEl.style.height    = '30px'
        clickEl.style.opacity   = '0'

        clickEl.addEventListener('transitionend', () => clickEl.remove(), { once : true })
        clickEl.addEventListener('transitioncancel', () => clickEl.remove(), { once : true })
    }
}
