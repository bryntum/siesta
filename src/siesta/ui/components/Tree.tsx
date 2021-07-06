/** @jsx ChronoGraphJSX.createElement */

import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { ChronoGraphJSX } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../../chronograph-jsx/WebComponent.js"

ChronoGraphJSX

//---------------------------------------------------------------------------------------------------------------------
export class Tree extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class Tree extends base {
        @field()
        state       : 'collapsed' | 'expanded'      = 'expanded'


        render () : Element {
            return <tree state={ this.$.state }>
                {/*<span>&gt;</span>*/}
                { this.children }
            </tree>
        }
    }
) {}
