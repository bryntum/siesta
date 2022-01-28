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

            const renderLeft    = JsonDeepDiffContentRendering.new({
                stream      : 'left',
                difference  : this.difference,
                renderer,
                maxWidth
            })
            const iteratorLeft      = renderLeft.render()

            const renderRight   = JsonDeepDiffContentRendering.new({
                stream      : 'right',
                difference  : this.difference,
                renderer,
                maxWidth
            })
            const iteratorRight     = renderRight.render()

            const renderExpander   = JsonDeepDiffContentRendering.new({
                stream      : 'expander',
                difference  : this.difference,
                renderer,
                maxWidth
            })
            const iteratorExpander     = renderExpander.render()

            while (true) {
                const leftIteration     = iteratorLeft.next()
                const rightIteration    = iteratorRight.next()
                const expanderIteration = iteratorExpander.next()

                if (leftIteration.done === true && rightIteration.done === true && expanderIteration.done === true) break

                if (leftIteration.done === false && rightIteration.done === false && expanderIteration.done === false) {
                    const maxHeight     = Math.max(leftIteration.value.height, rightIteration.value.height)

                    leftIteration.value.el.setAttribute('style', `height: ${ 1.5 * maxHeight }em`)
                    rightIteration.value.el.setAttribute('style', `height: ${ 1.5 * maxHeight }em`)
                    expanderIteration.value.el.setAttribute('style', `height: ${ 1.5 * maxHeight }em`)
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
                        { convertXmlElement(renderExpander.output.flush(), true) }
                    </JsonDeepDiffContent>
                </div>
                <div class="json-deep-diff-left">
                    <JsonDeepDiffContent
                        // stream      = 'left'
                        // rootComp    = { this }
                        // difference  = { this.difference }
                    >
                        { convertXmlElement(renderLeft.output.flush(), true) }
                    </JsonDeepDiffContent>
                </div>
                <div class="json-deep-diff-middle">
                    middle
                </div>
                <div class="json-deep-diff-right">
                    <JsonDeepDiffContent
                        // stream      = 'right'
                        // rootComp    = { this }
                        // difference  = { this.difference }
                    >
                        { convertXmlElement(renderRight.output.flush(), true) }
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

                [ expander, leftEl, rightEl ].forEach(el => {
                    el.closest('diff-entry')?.classList.toggle('diff-entry-collapsed')
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

