/** @jsx ChronoGraphJSX.createElement */
/** @jsxFrag ChronoGraphJSX.FragmentSymbol */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { entity } from "@bryntum/chronograph/src/schema2/Schema.js"
import { ChronoGraphJSX, ElementSource } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../../chronograph-jsx/Component.js"
import { ReactiveElement } from "../../../chronograph-jsx/ElementReactivity.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { checkInfoFromTestResult } from "../../test/TestResult.js"
import { Splitter } from "../components/Splitter.js"
import { Dashboard } from "../Dashboard.js"
import { TestLaunchInfo } from "../TestLaunchInfo.js"
import { TestNodeResultComponent } from "./TestResult.js"
import { Translator } from "./Translator.js"

ChronoGraphJSX

//---------------------------------------------------------------------------------------------------------------------
@entity()
export class LaunchInfoComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class LaunchInfoComponent extends base {
        props       : Component[ 'props' ] & {
            dashboard               : LaunchInfoComponent[ 'dashboard' ]
            launchInfo              : LaunchInfoComponent[ 'launchInfo' ]
            domContainerWidthBox?   : LaunchInfoComponent[ 'domContainerWidthBox' ]
        }

        launchInfo              : TestLaunchInfo    = undefined
        dashboard               : Dashboard         = undefined

        @field()
        scaleMode               : 'none' | 'fit_full' | 'fit_width' | 'fit_height'   = 'fit_full'

        domContainerWidthBox    : Box<number>       = Box.new(400)


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


        render () : ReactiveElement {
            const launchInfo            = this.launchInfo

            return <div class="test-results-area is-flex is-flex-direction-column" style="flex: 1">
                { () => this.topToolbar() }

                <div class="is-flex is-flex-direction-row is-align-items-stretch" style="flex: 1;overflow: hidden">
                    {
                        () => {
                            const mostRecentResult      = launchInfo.mostRecentResult

                            return mostRecentResult
                                ?
                                    <TestNodeResultComponent
                                        class='result-content'
                                        style='flex: 1; overflow-y: auto'
                                        testNode={ mostRecentResult }
                                        dashboard={ this.dashboard }
                                        launchInfo={ launchInfo }
                                    ></TestNodeResultComponent>
                                :
                                    this.noResultsContent()
                        }
                    }
                    {
                        () => {
                            if (!this.shouldShowDomContainer(launchInfo)) return null

                            return <>
                                <Splitter
                                    resizeTarget    = 'next'
                                    mode            = "horizontal"
                                    style           = "width: 8px"
                                    companionsFunc  = {
                                        el => launchInfo.context
                                            ? [ el.previousElementSibling, el.nextElementSibling, launchInfo.context.wrapper ] as HTMLElement[]
                                            : [ el.previousElementSibling, el.nextElementSibling ] as HTMLElement[]
                                    }
                                    sizeBox         = { this.domContainerWidthBox }
                                ></Splitter>
                                <div
                                    class={ () => `is-flex ${ launchInfo.context ? 'is-align-items-stretch' : 'is-justify-content-center is-align-items-center' }` }
                                    style:width={ () => this.domContainerWidthBox.read() + 'px' }
                                >
                                    {
                                        launchInfo.context
                                            ?
                                                <Translator
                                                    targetElement   = { launchInfo.context.wrapper }
                                                    style           = 'flex: 1'
                                                    class           = 'dom-container'
                                                    scaleMode       = { this.$.scaleMode as Translator[ 'scaleMode' ] }
                                                ></Translator>
                                            :
                                                <div style='text-align: center'>No DOM view available</div>
                                    }
                                </div>
                            </>
                        }
                    }
                </div>
            </div>
        }


        noResultsContent () : ElementSource {
            return <div class="s-dashboard-no-results is-flex is-justify-content-center is-align-items-center" style="flex: 1; height: 100%">
                <div>
                    <div>No results yet for <span class='current_test_filename'>{ this.launchInfo.descriptor.filename }</span></div>
                    <div>Double click a test to launch it</div>
                    <div>Double click a folder to launch all tests in it</div>
                </div>
            </div>
        }


        noDomViewAvailable () : ElementSource {
            return <div class="s-dashboard-no-selection is-flex is-justify-content-center is-align-items-center" style="flex: 1; height: 100%">
                <div>
                    <div>No test selected</div>
                    <div>Click a test to select it</div>
                    <div>Double click a test to launch it</div>
                    <div>Double click a folder to launch all tests in it</div>
                </div>
            </div>
        }


        shouldShowDomContainer (launchInfo : TestLaunchInfo) : boolean {
            if (this.dashboard.projectData.type === 'nodejs' || this.dashboard.projectData.type === 'deno') return false

            if (this.dashboard.projectData.environment.type !== 'browser') return false

            if (!launchInfo.mostRecentResult) return false

            return true
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
