/** @jsx ChronoGraphJSX.createElement */

import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { ChronoGraphJSX } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../../chronograph-jsx/Component.js"
import { ReactiveElement } from "../../../chronograph-jsx/ElementReactivity.js"

ChronoGraphJSX

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ResizeObserverComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class ResizeObserverComponent extends base {
        props : Component[ 'props' ] & {
        }

        resizeObserver          : ResizeObserver        = undefined

        isConnected             : boolean               = false


        get el () : ReactiveElement {
            if (this.$el !== undefined) return this.$el

            const el    = super.el

            this.resizeObserver = new ResizeObserver((entries : ResizeObserverEntry[], observer : ResizeObserver) => {
                if (this.isConnected) {
                    if (el.isConnected) {
                        this.resizeCallback(entries)
                    } else {
                        this.disconnectedCallback()
                        this.resizeObserver.disconnect()
                        this.isConnected = false
                    }
                }
                else {
                    if (el.isConnected) {
                        this.connectedCallback()
                        this.isConnected = true
                    }
                }
            })

            this.resizeObserver.observe(el)

            return el
        }


        connectedCallback () {
        }


        disconnectedCallback () {
        }


        // TODO will always be called with 1 entry only?
        resizeCallback (entries : ResizeObserverEntry[]) {
        }
    }
) {}
