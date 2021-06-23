/** @jsx ChronoGraphJSX.createElement */

import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ChronoGraphJSX } from "./util/ChronoGraphJSX.js"
import { Component } from "./util/WebComponent.js"


ChronoGraphJSX

//---------------------------------------------------------------------------------------------------------------------
export class Dashboard extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class Dashboard extends base {
        @field()
        some        : string        = "Some text"


        async start () {
            // if (document.readyState !== 'complete')
            //     await new Promise(resolve => window.addEventListener('load', resolve))

            document.body.appendChild(this.el)
        }


        render () : Element {
            return <div>
                Siesta Dashboard
                <button onclick={ e => this.onClick(e) }>Button</button>
                { this.$.some }
            </div>
        }


        onClick (e : Event) {
            console.log("Button clicked")
        }
    }
) {}

