/** @jsx ChronoGraphJSX.createElement */

import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { ChronoGraphJSX, convertXmlElement } from "../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../chronograph-jsx/Component.js"
import { Base, ClassUnion, Mixin } from "../class/Mixin.js"
import { RenderCanvas, RenderingXmlFragmentWithCanvas } from "../jsx/RenderBlock.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { XmlRendererStreaming } from "../jsx/XmlRenderer.js"
import { AbstractSplitter, SplitterDragContext } from "../siesta/ui/components/Splitter.js"
import { lastElement } from "../util/Helpers.js"
import { XmlRendererDifference } from "./CompareDeepDiffRendering.js"
import { Difference, DifferenceRenderingContext, DifferenceRenderingStream } from "./DeepDiffRendering.js"

// added as expression here, otherwise IDE thinks `ChronoGraphJSX` is unused import
ChronoGraphJSX


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class JsonDeepDiffComponent extends Mixin(
    [ AbstractSplitter, Component ],
    (base : ClassUnion<typeof AbstractSplitter, typeof Component>) =>

    class JsonDeepDiffComponent extends base {
        context             : XmlRendererDifference             = XmlRendererDifference.new()

        difference          : Difference            = undefined

        @field()
        maxWidth            : number                = 15


        render () : Element {
            const maxWidth         = this.maxWidth

            const renderer      = XmlRendererStreaming.new({
                // styles      : styles
            })

            renderer.blockLevelElements.add('diff-entry')
            renderer.blockLevelElements.add('diff-inner')

            const streams       = [ 'expander', 'left', 'middle', 'right' ] as DifferenceRenderingStream[]

            const renderers     = streams.map(stream => JsonDeepDiffContentRendering.new({
                stream,
                difference  : this.difference,
                renderer,
                maxWidth
            }))

            const iterators     = renderers.map(renderer => renderer.render())

            while (true) {
                const iterations        = iterators.map(iterator => iterator.next())

                if (iterations.every(iteration => iteration.done)) break

                if (iterations.every(iteration => !iteration.done)) {
                    const maxHeight     = Math.max(iterations[ 1 ].value.height, iterations[ 3 ].value.height)

                    iterations.forEach(iteration => {
                        // this comparison is only used for typing purposes
                        // (TS can't track the `every !done` assertion from above)
                        if (iteration.done === false)
                            iteration.value.el.setAttribute('style', `height: ${ 1.5 * maxHeight }em`)
                    })
                } else
                    throw new Error("Desync")
            }

            return <div class="json-deep-diff">
                <div class="json-deep-diff-expander" on:click={ e => this.onExpanderClick(e) }>
                    <div className='json-deep-diff-content'>{ convertXmlElement(renderers[ 0 ].output.flush(), true) }</div>
                </div>
                <div class="json-deep-diff-left" on:scroll={ e => this.onLeftContentScroll(e) } on:mouseover={ e => this.onMouseOver(e) }>
                    <div className="json-deep-diff-highlighter"></div>
                    {/*TODO: `style:width` here does not work w/o a function wrapper: () =>*/}
                    <div className='json-deep-diff-content' style:width = { () => `${ maxWidth }ch` }>
                        { convertXmlElement(renderers[ 1 ].output.flush(), true) }
                    </div>
                </div>
                <div class="json-deep-diff-middle" on:pointerdown={ e => this.onSplitterPointerDown(e) }>
                    <div className='json-deep-diff-content'>{ convertXmlElement(renderers[ 2 ].output.flush(), true) }</div>
                </div>
                <div class="json-deep-diff-right" on:scroll={ e => this.onRightContentScroll(e) } on:mouseover={ e => this.onMouseOver(e) }>
                    <div className="json-deep-diff-highlighter"></div>
                    <div className='json-deep-diff-content' style:width = { () => `${ maxWidth }ch` }>
                        { convertXmlElement(renderers[ 3 ].output.flush(), true) }
                    </div>
                </div>
            </div>
        }


        onExpanderClick (e : MouseEvent) {
            const target    = e.target as Element

            if (target.matches('diff-expander-opener, diff-expander-closer')) {
                const expander  = target.closest('diff-expander')
                const diffId    = /expander-(\d+)/.exec(expander.id)[ 1 ]

                const leftEl    = document.getElementById(`left-${ diffId }`)
                const rightEl   = document.getElementById(`right-${ diffId }`)
                const middleEl  = document.getElementById(`middle-${ diffId }`);

                [ expander, leftEl, middleEl, rightEl ].forEach(el => {
                    (el.closest('diff-entry') || el.parentElement).classList.toggle('diff-entry-collapsed')
                    el.classList.toggle('diff-collapsed')
                })
            }
        }


        onLeftContentScroll (e : Event) {
            const leftEl                    = this.leftArea
            const scrollTop                 = leftEl.scrollTop

            this.expanderArea.scrollTop     = scrollTop
            this.middleArea.scrollTop       = scrollTop

            this.rightArea.scrollTop        = scrollTop
            this.rightArea.scrollLeft       = leftEl.scrollLeft
        }


        onRightContentScroll (e : Event) {
            const rightEl                   = this.rightArea
            const scrollTop                 = rightEl.scrollTop

            this.expanderArea.scrollTop     = scrollTop
            this.middleArea.scrollTop       = scrollTop

            this.leftArea.scrollTop         = scrollTop
            this.leftArea.scrollLeft        = rightEl.scrollLeft
        }


        get leftHighlighter () : HTMLElement {
            // TODO this is the fastest, but fragile, can we improve?
            // some cached references mechanism? (query performed once)
            return this.leftArea.children[ 0 ] as HTMLElement
        }


        get rightHighlighter () : HTMLElement {
            return this.rightArea.children[ 0 ] as HTMLElement
        }


        get expanderArea () : HTMLElement {
            return this.el.children[ 0 ] as HTMLElement
        }

        get leftArea () : HTMLElement {
            return this.el.children[ 1 ] as HTMLElement
        }

        get middleArea () : HTMLElement {
            return this.el.children[ 2 ] as HTMLElement
        }

        get rightArea () : HTMLElement {
            return this.el.children[ 3 ] as HTMLElement
        }

        // TODO implement `mouseOut`
        // only need to highlight the atomics? highlighting the structure is not that needed?
        onMouseOver (e : Event) {
            const target            = e.target as HTMLElement
            const entry             = target.closest('diff-entry') as HTMLElement

            if (entry) {
                const entryBox      = entry.getBoundingClientRect()
                const leftAreaBox   = this.leftArea.getBoundingClientRect()

                const offset        = entryBox.top - leftAreaBox.top + this.leftArea.scrollTop

                const leftHighlighterEl         = this.leftHighlighter

                leftHighlighterEl.style.top     = offset + 'px'
                leftHighlighterEl.style.height  = entry.style.height

                const rightHighlighterEl        = this.rightHighlighter

                rightHighlighterEl.style.top    = offset + 'px'
                rightHighlighterEl.style.height = entry.style.height
            }
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class JsonDeepDiffContentRendering extends Base {
    renderer        : XmlRendererStreaming      = undefined

    maxWidth        : number                    = Number.MAX_SAFE_INTEGER

    stream          : DifferenceRenderingStream = undefined

    difference      : Difference                = undefined

    output          : RenderingXmlFragmentWithCanvas    = undefined

    canvas          : RenderCanvas              = undefined


    initialize (props? : Partial<JsonDeepDiffContentRendering>) {
        super.initialize(props)

        this.canvas     = RenderCanvas.new({ maxWidth : this.maxWidth })

        this.output     = RenderingXmlFragmentWithCanvas.new({
            canvas          : this.canvas,
            renderer        : this.renderer
        })

        this.output.start(
            XmlElement.new({
                tagName         : 'div',
                attributes      : { class : 'json-deep-diff-content-root' }
            })
        )
    }


    * render () : Generator<{ el : XmlElement, height : number }> {
        const iterator      = this.difference.renderGen(this.output, DifferenceRenderingContext.new({ stream : this.stream }))

        const heightStart   : Map<XmlElement, number>  = new Map()

        for (const syncPoint of iterator) {
            if (syncPoint.type === 'before') {
                heightStart.set(this.output.currentElement, this.canvas.height)
            }
            else if (syncPoint.type === 'after') {
                const el    = lastElement(this.output.currentElement.childNodes) as XmlElement

                yield {
                    el,
                    height  : this.canvas.height - heightStart.get(el)
                }
            }
        }
    }
}


// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// export class JsonDeepDiffContent extends Mixin(
//     [ Component ],
//     (base : ClassUnion<typeof Component>) =>
//
//     class JsonDeepDiffContent extends base {
//         // props : Component[ 'props' ] & {
//         //     expanded?           : JsonDeepDiffContent[ 'expanded' ]
//         //     stream?             : JsonDeepDiffContent[ 'stream' ]
//         //     difference?         : JsonDeepDiffContent[ 'difference' ]
//         //     rootComp?           : JsonDeepDiffContent[ 'rootComp' ]
//         // }
//         //
//         // @field()
//         // expanded        : boolean                       = true
//         //
//         // stream          : DifferenceRenderingStream     = undefined
//         //
//         // difference      : Difference                    = undefined
//         //
//         // rootComp        : JsonDeepDiffComponent         = undefined
//         //
//         // width           : number                        = undefined
//         //
//         // @field()
//         // height          : number                        = undefined
//
//
//         render () : Element {
//             return <div class='json-deep-diff-content'>{ this.children }</div>
//         }
//     }
// ){}
//
