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
import { Difference, DifferenceRenderingContext } from "./DeepDiffRendering.js"

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
        renderWidth         : number                = 15


        render () : Element {
            const width         = this.renderWidth

            const renderer      = XmlRendererStreaming.new({
                // styles      : styles
            })

            renderer.blockLevelElements.add('diff-entry')
            renderer.blockLevelElements.add('diff-inner')

            const renderLeft    = JsonDeepDiffContentRendering.new({
                stream      : 'left',
                difference  : this.difference,
                renderer,
                maxWidth    : width
            })
            const iteratorLeft      = renderLeft.render()

            const renderRight   = JsonDeepDiffContentRendering.new({
                stream      : 'right',
                difference  : this.difference,
                renderer,
                maxWidth    : width
            })
            const iteratorRight     = renderRight.render()

            while (true) {
                const leftIteration     = iteratorLeft.next()
                const rightIteration    = iteratorRight.next()

                if (leftIteration.done === true && rightIteration.done === true) break

                if (leftIteration.done === false && rightIteration.done === false) {
                    const maxHeight         = Math.max(leftIteration.value.height, rightIteration.value.height)

                    leftIteration.value.el.setAttribute('style', `height: ${ 1.5 * maxHeight }em`)
                    rightIteration.value.el.setAttribute('style', `height: ${ 1.5 * maxHeight }em`)
                } else
                    throw new Error("Desync")
            }

            return <div class="json-deep-diff">
                <div class="json-deep-diff-expander">expander</div>
                <div class="json-deep-diff-left">
                    <JsonDeepDiffContent
                        stream      = 'left'
                        rootComp    = { this }
                        difference  = { this.difference }
                    >
                        { convertXmlElement(renderLeft.output.flush(), true) }
                    </JsonDeepDiffContent>
                </div>
                <div class="json-deep-diff-middle">
                    middle
                </div>
                <div class="json-deep-diff-right">
                    <JsonDeepDiffContent
                        stream      = 'right'
                        rootComp    = { this }
                        difference  = { this.difference }
                    >
                        { convertXmlElement(renderRight.output.flush(), true) }
                    </JsonDeepDiffContent>
                </div>
            </div>
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class JsonDeepDiffContentRendering extends Base {
    renderer        : XmlRendererStreaming      = undefined

    maxWidth        : number                    = Number.MAX_SAFE_INTEGER

    stream          : 'left' | 'right'          = undefined

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
                attributes      : { class : 'json-deep-diff-content', style : `width: ${ this.maxWidth }ch` }
            })
        )
    }


    * render () : Generator<{ el : XmlElement, height : number }> {
        const iterator      = this.difference.renderGen(this.output, DifferenceRenderingContext.new({ stream : this.stream }))

        const heightStart   : Map<XmlElement, number>  = new Map()

        for (const syncPoint of iterator) {
            if (syncPoint.type === 'before') {
                heightStart.set(this.output.currentElement, this.canvas.height)
            } else {
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
        props : Component[ 'props' ] & {
            expanded?           : JsonDeepDiffContent[ 'expanded' ]
            stream?             : JsonDeepDiffContent[ 'stream' ]
            difference?         : JsonDeepDiffContent[ 'difference' ]
            rootComp?           : JsonDeepDiffContent[ 'rootComp' ]
        }

        @field()
        expanded        : boolean                       = true

        stream          : 'expander' | 'left' | 'middle' | 'right' = undefined

        difference      : Difference                    = undefined

        rootComp        : JsonDeepDiffComponent         = undefined

        width           : number                        = undefined

        @field()
        height          : number                        = undefined

        // difference      : Difference     = undefined


        // initialize (props? : Partial<JsonDeepDiffContent>) {
        //     super.initialize(props)
        // }


        render () : Element {
            return <div class='json-deep-diff-content'>{ this.children }</div>
            // const output        = RenderingXmlFragment.new()
            //
            // output.start(XmlElement.new({
            //     tagName     : 'div',
            //     attributes  : { class : 'json-deep-diff-content', style : `width: ${ this.rootComp.renderWidth }ch` }
            // }))
            //
            // this.difference.render(output, DifferenceRenderingContext.new({ stream : this.stream }))
            //
            // return convertXmlElement(output.flush())

            // return <div>{ this.difference.render() }</div>
            //
            //
            // if (this.difference instanceof DifferenceTemplateAtomic) {
            //     return this.renderDifferenceAtomic()
            // }
            // else {
            //     throw new Error("Unknown difference type")
            // }
        }


        // renderDifferenceAtomic () : Element {
        //     const diff       = this.difference as DifferenceTemplateAtomic
        //
        //     const el         = this.stream === 'left' ? diff.childNodes[ 0 ] : diff.childNodes[ 1 ]
        //
        //     if (el instanceof MissingValue)
        //         return <div>░</div>
        //     else {
        //         if (this.rootComp.context.atomicElementNodes.has(el.tagName)) {
        //             return <div id={ "" }>{ el.childNodes[ 0 ] }</div>
        //         }
        //         else {
        //             throw new Error("Unknown atomic")
        //         }
        //     }
        //
        // }
    }
){}

