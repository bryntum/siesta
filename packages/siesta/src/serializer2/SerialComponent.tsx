/** @jsx ChronoGraphJSX.createElement */

import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { ChronoGraphJSX, convertXmlElement } from "../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../chronograph-jsx/Component.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { AbstractSplitter, SplitterDragContext } from "../siesta/ui/components/Splitter.js"
import { Fitter, RenderingStream, SerialContentRendering, SerialWrapper, XmlRendererSerial } from "./SerialRendering.js"

// added as expression here, otherwise IDE thinks `ChronoGraphJSX` is unused import
ChronoGraphJSX


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SerialComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class SerialComponent extends base {
        props : Component[ 'props' ] & {
            serial          : SerialComponent[ 'serial' ]
            maxWidth        : SerialComponent[ 'maxWidth' ]
        }

        serial              : SerialWrapper         = undefined

        @field()
        maxWidth            : number                = 100


        render () : Element {
            const maxWidth         = this.maxWidth

            const renderer      = XmlRendererSerial.new({ prettyPrint : true })

            const streams : RenderingStream[]      = [ 'expander', 'content' ]

            const renderers     = streams.map(stream => SerialContentRendering.new({
                stream,
                serialization  : this.serial,
                renderer,
                maxWidth
            }))

            const iterators     = renderers.map(renderer => renderer.render())

            while (true) {
                const iterations        = iterators.map(iterator => iterator.next())

                if (iterations.every(iteration => iteration.done)) break

                if (iterations.every(iteration => !iteration.done)) {
                    const maxHeight     = iterations[ 1 ].value.height

                    iterations.forEach((iteration, index) => {
                        // this comparison is only used for typing purposes
                        // (TS can't track the `every !done` assertion from above)
                        if (iteration.done === false) {
                            const heightDiff    = maxHeight - iteration.value.height

                            if (heightDiff > 0)
                                renderers[ index ].output.write(
                                    Fitter.new({
                                        tagName : 'div',
                                        attributes : {
                                            class   : 'serial-fitter',
                                            style   : `height: ${ 1.5 * heightDiff }em`
                                        },
                                        height      : heightDiff
                                    })
                                )
                        }
                    })
                } else
                    throw new Error("Elements flow de-synchronization")
            }

            return <div class="serial">
                <div class="serial-expander" on:click={ e => this.onExpanderClick(e) }>
                    <div className='serial-content'>{ convertXmlElement(renderers[ 0 ].output.flush(), true) }</div>
                </div>
                <div
                    class="serial-left"
                    // on:scroll={ e => this.onLeftContentScroll(e) }
                    on:mouseover={ e => this.onMouseOver(e) }
                    on:mouseout={ e => this.onMouseOut(e) }
                >
                    <div className="serial-highlighter"></div>
                    {/*TODO: `style:width` here does not work w/o a function wrapper: () =>*/}
                    <div className='serial-content' style:width = { () => `${ maxWidth }ch` }>
                        { convertXmlElement(renderers[ 1 ].output.flush(), true) }
                    </div>
                </div>
            </div>
        }


        onExpanderClick (e : MouseEvent) {
            const target    = e.target as Element

            if (target.matches('serial-expander-opener, serial-expander-closer')) {
                const expander  = target.closest('serial-expander')
                const diffId    = /expander-(\d+)/.exec(expander.id)[ 1 ]

                const leftEl    = document.getElementById(`serial-content-${ diffId }`);

                [ expander, leftEl ].forEach(el => {
                    el.classList.toggle('serial-collapsed')
                })
            }
            else if (target.matches('.serial-collapsed')) {
                const expander  = target
                const diffId    = /expander-(\d+)/.exec(expander.id)[ 1 ]

                const leftEl    = document.getElementById(`serial-content-${ diffId }`);

                [ expander, leftEl ].forEach(el => {
                    el.classList.toggle('serial-collapsed')
                })
            }
        }


        get leftHighlighter () : HTMLElement {
            // TODO this is the fastest, but fragile, can we improve?
            // some cached references mechanism? (query performed once)
            return this.leftArea.children[ 0 ] as HTMLElement
        }


        // get rightHighlighter () : HTMLElement {
        //     return this.rightArea.children[ 0 ] as HTMLElement
        // }


        get expanderArea () : HTMLElement {
            return this.el.children[ 0 ] as HTMLElement
        }

        get leftArea () : HTMLElement {
            return this.el.children[ 1 ] as HTMLElement
        }

        // get middleArea () : HTMLElement {
        //     return this.el.children[ 2 ] as HTMLElement
        // }
        //
        // get rightArea () : HTMLElement {
        //     return this.el.children[ 3 ] as HTMLElement
        // }

        // only need to highlight the atomics? highlighting the structure is not that needed?
        onMouseOver (e : Event) {
            const target            = e.target as HTMLElement
            const entry             = target.closest('serial-entry') as HTMLElement

            if (entry) {
                const entryBox      = entry.getBoundingClientRect()
                const leftAreaBox   = this.leftArea.getBoundingClientRect()

                const offset        = entryBox.top - leftAreaBox.top + this.leftArea.scrollTop

                const leftHighlighterEl         = this.leftHighlighter

                leftHighlighterEl.style.top     = offset + 'px'
                leftHighlighterEl.style.height  = entryBox.height + 'px'

                // const rightHighlighterEl        = this.rightHighlighter
                //
                // rightHighlighterEl.style.top    = offset + 'px'
                // rightHighlighterEl.style.height = entryBox.height + 'px'
            }
        }


        onMouseOut (e : Event) {
            const target            = e.target as HTMLElement
            const entry             = target.closest('serial-entry') as HTMLElement

            if (entry) {
                this.leftHighlighter.style.height   = '0px'
                // this.rightHighlighter.style.height  = '0px'
            }
        }

        // getSplitterCompanions () : HTMLElement[] {
        //     return [ this.leftArea, this.rightArea ]
        // }
        //
        //
        // onSplitterDrag (context : SplitterDragContext, e : MouseEvent) {
        //     const dx            = e.clientX - context.startX
        //
        //     const leftWidth     = context.companions[ 0 ].rect.width
        //     const rightWidth    = context.companions[ 1 ].rect.width
        //
        //     const flex          = (leftWidth + dx) / (rightWidth - dx)
        //
        //     this.leftArea.style.flex    = String(flex)
        // }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SerialPairComponent extends Mixin(
    [ AbstractSplitter, Component ],
    (base : ClassUnion<typeof AbstractSplitter, typeof Component>) =>

    class SerialPairComponent extends base {
        props : Component[ 'props' ] & {
            serial1         : SerialPairComponent[ 'serial1' ]
            serial2         : SerialPairComponent[ 'serial2' ]
            maxWidth        : SerialPairComponent[ 'maxWidth' ]
        }

        serial1             : SerialWrapper         = undefined
        serial2             : SerialWrapper         = undefined

        @field()
        maxWidth            : number                = 100


        render () : Element {
            return <div class="serial-pair">
                <SerialComponent
                    class={ 'serial-pair-left' }
                    serial={ this.serial1 }
                    maxWidth={ this.maxWidth }
                ></SerialComponent>
                <div class="serial-pair-middle" on:pointerdown={ e => this.onSplitterPointerDown(e) }></div>
                <SerialComponent
                    class={ 'serial-pair-right' }
                    serial={ this.serial2 }
                    maxWidth={ this.maxWidth }
                ></SerialComponent>
            </div>
        }


        get leftArea () : HTMLElement {
            return this.el.children[ 0 ] as HTMLElement
        }

        // get middleArea () : HTMLElement {
        //     return this.el.children[ 2 ] as HTMLElement
        // }


        get rightArea () : HTMLElement {
            return this.el.children[ 2 ] as HTMLElement
        }


        getSplitterCompanions () : HTMLElement[] {
            return [ this.leftArea, this.rightArea ]
        }


        onSplitterDrag (context : SplitterDragContext, e : MouseEvent) {
            const dx            = e.clientX - context.startX

            const leftWidth     = context.companions[ 0 ].rect.width
            const rightWidth    = context.companions[ 1 ].rect.width

            const flex          = (leftWidth + dx) / (rightWidth - dx)

            this.leftArea.style.flex    = String(flex)
        }
    }
){}
