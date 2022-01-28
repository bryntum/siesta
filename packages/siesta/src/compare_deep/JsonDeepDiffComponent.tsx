/** @jsx ChronoGraphJSX.createElement */

import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { ChronoGraphJSX, convertXmlElement } from "../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../chronograph-jsx/Component.js"
import { Base, ClassUnion, Mixin } from "../class/Mixin.js"
import { RenderCanvas, RenderingXmlFragmentWithCanvas } from "../jsx/RenderBlock.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { XmlRendererStreaming } from "../jsx/XmlRenderer.js"
import { lastElement } from "../util/Helpers.js"
import { XmlRendererDifference } from "./CompareDeepDiffRendering.js"
import { Difference, DifferenceRenderingContext, DifferenceRenderingStream } from "./DeepDiffRendering.js"

// added as expression here, otherwise IDE thinks `ChronoGraphJSX` is unused import
ChronoGraphJSX


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class JsonDeepDiffComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

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
                            iteration.value.el.setAttribute('style', `height: ${1.5 * maxHeight}em`)
                    })
                } else
                    throw new Error("Desync")
            }

            return <div class="json-deep-diff">
                <div class="json-deep-diff-expander" on:click={ e => this.onExpanderClick(e) }>
                    <JsonDeepDiffContent
                        // stream      = 'expander'
                        // rootComp    = { this }
                        // difference  = { this.difference }
                    >
                        { convertXmlElement(renderers[ 0 ].output.flush(), true) }
                    </JsonDeepDiffContent>
                </div>
                <div class="json-deep-diff-left">
                    <JsonDeepDiffContent
                        // stream      = 'left'
                        // rootComp    = { this }
                        // difference  = { this.difference }
                    >
                        { convertXmlElement(renderers[ 1 ].output.flush(), true) }
                    </JsonDeepDiffContent>
                </div>
                <div class="json-deep-diff-middle">
                    <JsonDeepDiffContent
                        // stream      = 'expander'
                        // rootComp    = { this }
                        // difference  = { this.difference }
                    >
                        { convertXmlElement(renderers[ 2 ].output.flush(), true) }
                    </JsonDeepDiffContent>
                </div>
                <div class="json-deep-diff-right">
                    <JsonDeepDiffContent
                        // stream      = 'right'
                        // rootComp    = { this }
                        // difference  = { this.difference }
                    >
                        { convertXmlElement(renderers[ 3 ].output.flush(), true) }
                    </JsonDeepDiffContent>
                </div>
            </div>
        }


        onExpanderClick (e : MouseEvent) {
            const target    = e.target as Element

            if (target.matches('diff-expander-opener, diff-expander-closer')) {
                const expander  = target.closest('diff-expander')
                const diffId    = /expander-(\d+)/.exec(expander.id)[ 1 ]

                const leftEl    = document.getElementById(`left-${ diffId }`)
                const rightEl   = document.getElementById(`right-${ diffId }`);
                const middleEl  = document.getElementById(`middle-${ diffId }`);

                [ expander, leftEl, middleEl, rightEl ].forEach(el => {
                    const entry     = el.closest('diff-entry')

                    if (entry)
                        entry.classList.toggle('diff-entry-collapsed')
                    else
                        el.parentElement.classList.toggle('diff-entry-collapsed')

                    el.classList.toggle('diff-collapsed')
                })
            }
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class JsonDeepDiffContent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class JsonDeepDiffContent extends base {
        // props : Component[ 'props' ] & {
        //     expanded?           : JsonDeepDiffContent[ 'expanded' ]
        //     stream?             : JsonDeepDiffContent[ 'stream' ]
        //     difference?         : JsonDeepDiffContent[ 'difference' ]
        //     rootComp?           : JsonDeepDiffContent[ 'rootComp' ]
        // }
        //
        // @field()
        // expanded        : boolean                       = true
        //
        // stream          : DifferenceRenderingStream     = undefined
        //
        // difference      : Difference                    = undefined
        //
        // rootComp        : JsonDeepDiffComponent         = undefined
        //
        // width           : number                        = undefined
        //
        // @field()
        // height          : number                        = undefined


        render () : Element {
            return <div class='json-deep-diff-content'>{ this.children }</div>
        }
    }
){}

