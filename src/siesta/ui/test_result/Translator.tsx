/** @jsx ChronoGraphJSX.createElement */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { calculate, field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { ChronoGraphJSX } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../../chronograph-jsx/Component.js"
import { ReactiveElement } from "../../../chronograph-jsx/ElementReactivity.js"
import { TextJSX } from "../../../jsx/TextJSX.js"

ChronoGraphJSX

//---------------------------------------------------------------------------------------------------------------------
// TODO extract `ResizeObserverComponent` from this component with `connectCallback/disconnectedCallback/resizeCallback`
// methods

// TODO currently this component "knowns" intrinsic details about iframe wrapper - need to imporve that,
// probably a new component <TranslationTarget> and then iframe context provider should use that for iframe
// (or its subclass with cursor/clicks simulation)
export class Translator extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class Translator extends base {
        props : Component[ 'props' ] & {
            targetElement           : Translator[ 'targetElement' ]
        }

        targetElement           : HTMLElement           = undefined

        previousStyles          : { left : string, top : string, height : string, width : string }  = undefined

        resizeObserver          : ResizeObserver        = undefined

        connected               : boolean               = false

        scrollBarSize           : { width : number, height : number }   = { width : 8, height : 8 }

        @field()
        scaleMode               : 'none' | 'fit_full' | 'fit_width' | 'fit_height'   = 'fit_full'

        @field()
        availableWidth          : number        = 0

        @field()
        availableHeight         : number        = 0

        @field()
        contentWidth            : number        = 0

        @field()
        contentHeight           : number        = 0

        @field({ lazy : false })
        scale                   : number

        @field({ lazy : false })
        offset                  : [ number, number ]

        @calculate('scale')
        calculateScale () : number {
            const widthScale    = this.availableWidth / this.contentWidth
            const heightScale   = this.availableHeight / this.contentHeight

            return this.scaleMode === 'none'
                ? 1
                : this.scaleMode === 'fit_width'
                    ? widthScale
                    : this.scaleMode === 'fit_height'
                        ? heightScale
                        : Math.min(widthScale, heightScale)

        }


        @calculate('offset')
        calculateOffset () : [ number, number ] {
            if (this.scaleMode === 'none') return [ 0, 0 ]

            const leftWidth     = Math.max(this.availableWidth - this.scale * this.contentWidth, 0)
            const leftHeight    = Math.max(this.availableHeight - this.scale * this.contentHeight, 0)

            return [ leftWidth / 2, leftHeight / 2 ]
        }


        get el () : ReactiveElement {
            if (this.$el !== undefined) return this.$el

            const el    = super.el

            this.resizeObserver = new ResizeObserver((entries : ResizeObserverEntry[], observer : ResizeObserver) => {
                if (this.connected) {
                    if (el.isConnected)
                        this.syncPosition()
                    else
                        this.disconnectedCallback()
                }
                else {
                    if (el.isConnected)
                        this.connectedCallback()
                }
            })

            this.resizeObserver.observe(el)

            const targetStyle   = this.targetElement.style;

            (this.$.offset as Box<[ number, number]>).commitValueOptimisticHook.on((box, offset) => {
                if (el.isConnected) {
                    targetStyle.setProperty('--translateX', String(offset[ 0 ]) + 'px')
                    targetStyle.setProperty('--translateY', String(offset[ 1 ]) + 'px')
                }
            });

            (this.$.scale as Box<number>).commitValueOptimisticHook.on((box, scale) => {
                if (el.isConnected) {
                    targetStyle.setProperty('--scaleFactor', String(scale))
                    targetStyle.setProperty('--scaledWidth', String(scale * this.contentWidth) + 'px')
                    targetStyle.setProperty('--scaledHeight', String(scale * this.contentHeight) + 'px')
                }
            })

            return el
        }


        render () : ReactiveElement {
            return <div></div>
        }


        connectedCallback () {
            this.connected = true

            this.startTranslation()
        }


        startTranslation () {
            this.targetElement.classList.add('translating')

            const targetStyle   = this.targetElement.style

            this.previousStyles = {
                left            : targetStyle.left,
                top             : targetStyle.top,
                width           : targetStyle.width,
                height          : targetStyle.height,
            }

            this.syncPosition()
        }


        syncPosition () {
            const ownRect           = this.el.getBoundingClientRect()

            this.availableWidth     = ownRect.width - (this.scaleMode === 'fit_width' ? this.scrollBarSize.width : 0)
            this.availableHeight    = ownRect.height - (this.scaleMode === 'fit_height' ? this.scrollBarSize.height : 0)

            const iframe            = this.targetElement.firstElementChild.firstElementChild as HTMLElement

            this.contentWidth       = iframe.offsetWidth
            this.contentHeight      = iframe.offsetHeight

            const targetStyle       = this.targetElement.style

            targetStyle.left        = ownRect.left + 'px'
            targetStyle.top         = ownRect.top + 'px'
            targetStyle.height      = ownRect.height + 'px'
            targetStyle.width       = ownRect.width + 'px'

            globalGraph.commit()
        }


        stopTranslation () {
            this.targetElement.classList.remove('translating')

            const targetStyle       = this.targetElement.style
            const previousStyles    = this.previousStyles

            targetStyle.left    = previousStyles.left
            targetStyle.top     = previousStyles.top
            targetStyle.height  = previousStyles.height
            targetStyle.width   = previousStyles.width
        }


        disconnectedCallback () {
            this.stopTranslation()
            this.resizeObserver.disconnect()
        }
    }
) {}
