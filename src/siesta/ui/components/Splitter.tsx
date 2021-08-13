/** @jsx ChronoGraphJSX.createElement */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { ChronoGraphJSX } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../../chronograph-jsx/Component.js"
import { ComponentElement } from "../../../chronograph-jsx/ElementReactivity.js"

ChronoGraphJSX

//---------------------------------------------------------------------------------------------------------------------
export class Splitter extends Component {
    props : Component[ 'props' ] & {
        mode?           : Splitter[ 'mode' ]
        resizeTarget?   : Splitter[ 'resizeTarget' ]
        companionsFunc? : Splitter[ 'companionsFunc' ]
        sizeBox?        : Splitter[ 'sizeBox' ]
    }

    mode            : 'horizontal' | 'vertical'     = 'horizontal'
    resizeTarget    : 'next' | 'previous'           = 'previous'

    resizeTargetFunc    : (self : ComponentElement<Splitter>) => Element    = undefined
    companionsFunc      : (self : ComponentElement<Splitter>) => HTMLElement[]   = undefined

    sizeBox         : Box<number>       = undefined


    render () : Element {
        return <div
            class={ `splitter is-justify-content-center is-flex is-align-items-center splitter-${ this.mode }` }
            onpointerdown={ e => this.onPointerDown(e) }
        ></div>
    }


    getResizeTarget () : HTMLElement {
        if (this.resizeTargetFunc) return this.resizeTargetFunc(this.el as ComponentElement<this>) as HTMLElement

        return this.resizeTarget === 'previous'
            ? this.el.previousElementSibling as HTMLElement
            : this.el.nextElementSibling as HTMLElement
    }


    getCompanions () : HTMLElement[] {
        if (this.companionsFunc) return this.companionsFunc(this.el as ComponentElement<this>)

        return [ this.el.previousElementSibling, this.el.nextElementSibling ] as HTMLElement[]
    }


    onPointerDown (e : MouseEvent) {
        const startX        = e.clientX
        const startY        = e.clientY

        const target        = this.getResizeTarget()

        const initialWidth  = Number.parseInt(target.style.width)
        const initialHeight = Number.parseInt(target.style.height)

        const companions    = this.getCompanions()

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

        let pointerMoveListener

        document.addEventListener('pointermove', pointerMoveListener = (e : MouseEvent) => {
            const direction = this.resizeTarget === 'previous' ? 1 : -1

            const deltaX    = e.clientX - startX
            const deltaY    = e.clientY - startY

            if (this.mode === 'horizontal') {
                const newWidth  = initialWidth + deltaX * direction

                this.sizeBox ? this.sizeBox.write(newWidth) : target.style.width = newWidth + 'px'
            } else {
                const newHeight = initialHeight + deltaY * direction

                this.sizeBox ? this.sizeBox.write(newHeight) : target.style.height = newHeight + 'px'
            }
        })

        document.addEventListener('pointerup', (e : MouseEvent) => {
            document.removeEventListener('pointermove', pointerMoveListener)

            document.body.style.cursor  = prevBodyCursor

            prevStyles.forEach(entry => {
                const el                        = entry.el

                el.style[ 'pointer-events' ]    = entry[ 'pointer-events' ]
                el.style[ 'user-select' ]       = entry[ 'user-select' ]
            })

            this.onDragStop()
        }, { once : true })
    }


    onDragStart () {
    }


    onDragStop () {
    }
}
