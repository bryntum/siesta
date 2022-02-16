/** @jsx ChronoGraphJSX.createElement */

import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { entity } from "@bryntum/chronograph/src/schema2/Schema.js"
import { ChronoGraphJSX } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../../chronograph-jsx/Component.js"
import { ReactiveElement } from "../../../chronograph-jsx/ElementReactivity.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { SerialComponent } from "../../../serializer/SerialComponent.js"
import { SerialElement } from "../../../serializer/SerialRendering.js"

ChronoGraphJSX

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@entity()
export class GotExpectComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class GotExpectComponent extends base {
        props       : Component[ 'props' ] & {
        }

        description         : string        = undefined
        description2        : string        = undefined

        gotEl               : SerialElement = undefined

        gotTitle            : string        = 'Received'

        expectEl            : SerialElement = undefined

        expectTitle         : string        = 'Expected'


        render () : ReactiveElement {
            return <div class="got_expected">
                { this.description }
                {
                    this.gotEl && <div class='got'>
                        <div class="underlined got_title">{ this.gotTitle }:</div>
                        <div class="indented got_value">{ SerialComponent.new({ serial : this.gotEl.serialization }).el }</div>
                    </div>
                }
                { this.description2 }
                {
                    this.expectEl && <div class='expect'>
                        <div class="underlined expect_title">{ this.expectTitle }:</div>
                        <div class="indented expect_value">{ SerialComponent.new({ serial : this.expectEl.serialization }).el }</div>
                    </div>
                }
            </div>
        }
    }
) {}
