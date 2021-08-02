/** @jsx ChronoGraphJSX.createElement */

import { ChronoGraphJSX } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../../chronograph-jsx/Component.js"
import { ComponentElement } from "../../../chronograph-jsx/ElementReactivity.js"

ChronoGraphJSX

//---------------------------------------------------------------------------------------------------------------------
export class Splitter extends Component {
    props : Component[ 'props' ] & {
        mode?       : Splitter[ 'mode' ]
    }

    mode            : 'horizontal' | 'vertical'     = 'horizontal'

    resizeTarget    : (self : ComponentElement<Splitter>) => Element    = self => self.previousElementSibling


    render () : Element {
        return <div
            class={ `splitter is-justify-content-center is-flex is-align-items-center splitter-${ this.mode }` }
            onpointerdown={ e => this.onPointerDown(e) }
        ></div>
    }


    onPointerDown (e : MouseEvent) {
        let pointerMoveListener, pointerUpListener

        const startX        = e.clientX
        const startY        = e.clientY

        const target        = this.resizeTarget(this.el as ComponentElement<this>) as HTMLElement

        const initialWidth  = Number.parseInt(target.style.width)
        const initialHeight = Number.parseInt(target.style.height)

        const companions    = [ this.el.previousElementSibling, this.el.nextElementSibling ] as HTMLElement[]

        const prevStyles    = companions.map(el => {
            return {
                el                      : el,
                'pointer-events'        : el.style[ 'pointer-events' ],
                'user-select'           : el.style[ 'user-select' ]
            }
        })

        const prevBodyCursor        = document.body.style.cursor

        document.body.style.cursor  = this.mode === 'horizontal' ? 'col-resize' : 'row-resize'

        companions.forEach(el => {
            el.style[ 'pointer-events' ]    = 'none'
            el.style[ 'user-select' ]       = 'none'
        })

        this.onDragStart()

        document.addEventListener('pointermove', pointerMoveListener = (e : MouseEvent) => {
            const deltaX    = e.clientX - startX
            const deltaY    = e.clientY - startY

            if (this.mode === 'horizontal') {
                target.style.width  = (initialWidth + deltaX) + 'px'
            } else {
                target.style.height  = (initialHeight + deltaY) + 'px'
            }
        })

        document.addEventListener('pointerup', pointerUpListener = (e : MouseEvent) => {
            document.removeEventListener('pointerup', pointerUpListener)
            document.removeEventListener('pointermove', pointerMoveListener)

            document.body.style.cursor  = prevBodyCursor

            prevStyles.forEach(entry => {
                const el                        = entry.el

                el.style[ 'pointer-events' ]    = entry[ 'pointer-events' ]
                el.style[ 'user-select' ]       = entry[ 'user-select' ]
            })

            this.onDragStop()
        })
    }


    onDragStart () {
    }


    onDragStop () {
    }
}