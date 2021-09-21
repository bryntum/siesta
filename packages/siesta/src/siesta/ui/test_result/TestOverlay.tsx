/** @jsx ChronoGraphJSX.createElement */
/** @jsxFrag ChronoGraphJSX.FragmentSymbol */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { entity } from "@bryntum/chronograph/src/schema2/Schema.js"
import { ChronoGraphJSX } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../../chronograph-jsx/Component.js"
import { ReactiveElement } from "../../../chronograph-jsx/ElementReactivity.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { ContextBrowserIframe } from "../../context/ContextBrowserIframe.js"
import { Dashboard } from "../Dashboard.js"
import { TestLaunchInfo } from "../TestLaunchInfo.js"
import { Translator } from "./Translator.js"

ChronoGraphJSX

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@entity()
export class TestOverlay extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class TestOverlay extends base {
        // props       : Component[ 'props' ] & {
        //     dashboard               : TestOverlay[ 'dashboard' ]
        // }
        //
        // dashboard               : Dashboard         = undefined

        @field()
        context                 : ContextBrowserIframe      = undefined


        render () : ReactiveElement {
            // const launchInfo            = this.launchInfo

            return <div class="test-overlay is-justify-content-center is-align-items-center" class:overlay-active={ () => Boolean(this.context) }>
                <div class='close-button'><span class='icon is-large'><i class='far fa-lg fa-times-circle'></i></span></div>
                {
                    () => this.context?.wrapper
                        ?
                            <Translator
                                class           = 'translator'
                                roundValues     = { true }
                                targetElement   = { this.context?.wrapper }
                                style           = { `width: ${ this.context?.iframe.style.width }; height: ${ this.context?.iframe.style.height }` }
                                scaleMode       = { Box.new('none') }
                            ></Translator>
                        :
                            null
                }
            </div>
        }
    }
) {}

