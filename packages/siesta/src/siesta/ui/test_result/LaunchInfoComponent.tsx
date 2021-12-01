/** @jsx ChronoGraphJSX.createElement */
/** @jsxFrag ChronoGraphJSX.FragmentSymbol */

import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { entity } from "@bryntum/chronograph/src/schema2/Schema.js"
import { ChronoGraphJSX, ElementSource } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { checkInfoFromTestResult } from "../../test/TestResultReactive.js"
import { Dashboard } from "../Dashboard.js"
import { LaunchInfoComponentCore } from "./LaunchInfoComponentCore.js"

ChronoGraphJSX


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@entity()
export class LaunchInfoComponent extends Mixin(
    [ LaunchInfoComponentCore ],
    (base : ClassUnion<typeof LaunchInfoComponentCore>) =>

    class LaunchInfoComponent extends base {
        props       : LaunchInfoComponentCore[ 'props' ] & {
        }

        dashboard               : Dashboard         = undefined


        topToolbar () : ElementSource {
            const mostRecentResult      = this.launchInfo

            return <div class='tbar is-flex'>
                <span class="icon ripple is-large" onclick={ () => this.runTest() }><i class="fas fa-lg fa-play"></i></span>

                {
                    mostRecentResult
                        ?
                            <>
                                <span class="icon ripple icon-play-checked is-large" onclick={ () => this.runTestChecked() }>
                                    <i class="fas fa-lg fa-play"></i>
                                    <span class="icon is-small"><i class="fas fs-sm fa-check"></i></span>
                                </span>
                                <span style='flex:1'></span>
                                <span class="icon ripple is-large" onclick={ () => this.rotate() }>
                                    <i class="fas fa-lg fa-retweet"></i>
                                </span>
                                <span class="icon ripple is-large" onclick={ () => this.scaleMode = 'fit_width' }>
                                    <i class="fas fa-lg fa-arrows-alt-h"></i>
                                </span>
                                <span class="icon ripple is-large" onclick={ () => this.scaleMode = 'fit_height' }>
                                    <i class="fas fa-lg fa-arrows-alt-v"></i>
                                </span>
                                <span class="icon ripple is-large" onclick={ () => this.scaleMode = 'fit_full' }>
                                    <i class="fas fa-lg fa-expand-arrows-alt"></i>
                                </span>
                                <span class="icon ripple is-large" onclick={ () => this.scaleMode = 'none' }>
                                    <i class="fas fa-lg fa-expand"></i>
                                </span>
                            </>
                        :
                            null
                }
            </div>
        }


        runTest () {
            this.dashboard.launchContinuously([ this.launchInfo.descriptor ])
        }


        runTestChecked () {
            const testResult        = this.launchInfo.mostRecentResult

            this.dashboard.launchContinuouslyWithCheckInfo(this.launchInfo.descriptor, checkInfoFromTestResult(testResult))
        }
    }
) {}

