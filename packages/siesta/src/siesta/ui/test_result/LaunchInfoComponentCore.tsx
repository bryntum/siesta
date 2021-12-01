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
import { Splitter } from "../components/Splitter.js"
import { DashboardCore } from "../DashboardCore.js"
import { TestLaunchInfo } from "../TestLaunchInfo.js"
import { TestNodeResultComponent } from "./TestResult.js"
import { Translator } from "./Translator.js"

ChronoGraphJSX

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type DomContainerPosition = { orientation : 'horizontal' | 'vertical', reverse : boolean }


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@entity()
export class LaunchInfoComponentCore extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class LaunchInfoComponentCore extends base {
        props       : Component[ 'props' ] & {
            dashboard               : LaunchInfoComponentCore[ 'dashboard' ]
            launchInfo              : LaunchInfoComponentCore[ 'launchInfo' ]
            domContainerWidthBox?   : LaunchInfoComponentCore[ 'domContainerWidthBox' ]
            domContainerHeightBox?  : LaunchInfoComponentCore[ 'domContainerHeightBox' ]
            domContainerPositionBox? : LaunchInfoComponentCore[ 'domContainerPositionBox']
        }

        launchInfo              : TestLaunchInfo    = undefined
        dashboard               : DashboardCore     = undefined

        @field()
        scaleMode               : 'none' | 'fit_full' | 'fit_width' | 'fit_height'   = 'fit_full'

        domContainerWidthBox    : Box<number>       = Box.new(400)
        domContainerHeightBox   : Box<number>       = Box.new(300)

        domContainerPositionBox : Box<DomContainerPosition> = Box.new({ orientation : 'horizontal', reverse : false })


        topToolbar () : ElementSource {
            return null
        }


        rotate () {
            const { orientation, reverse } = this.domContainerPositionBox.read()

            let newPosition : DomContainerPosition

            if (orientation === 'horizontal' && !reverse)
                newPosition     = { orientation : 'vertical', reverse : false }
            else if (orientation === 'vertical' && !reverse)
                newPosition     = { orientation : 'horizontal', reverse : true }
            else if (orientation === 'horizontal' && reverse)
                newPosition     = { orientation : 'vertical', reverse : true }
            else if (orientation === 'vertical' && reverse)
                newPosition     = { orientation : 'horizontal', reverse : false }

            this.domContainerPositionBox.write(newPosition)
        }


        render () : ReactiveElement {
            const launchInfo            = this.launchInfo

            // w/o the `min-width: 0` the nested results tree does not shrink smaller than its content size
            // which prevents the dom container splitter from working
            // https://stackoverflow.com/questions/36247140/why-dont-flex-items-shrink-past-content-size
            return <div class="test-results-area is-flex is-flex-direction-column" style="flex: 1; min-width: 0">
                { () => this.topToolbar() }

                <div
                    class = "is-flex is-align-items-stretch"
                    style = "flex: 1; overflow: hidden"
                    style:flex-direction = { () => {
                        const { orientation, reverse } = this.domContainerPositionBox.read()

                        return `${ orientation === 'horizontal' ? 'row' : 'column' }${ reverse ? '-reverse' : '' }`
                    } }
                >
                    {
                        () => {
                            const mostRecentResult      = launchInfo.mostRecentResult

                            return mostRecentResult
                                ?
                                    <TestNodeResultComponent
                                        class       = 'result-content'
                                        style       = 'flex: 1; overflow-y: auto'
                                        testNode    = { mostRecentResult }
                                        dashboard   = { this.dashboard }
                                        launchInfo  = { launchInfo }
                                    ></TestNodeResultComponent>
                                :
                                    this.noResultsContent()
                        }
                    }
                    {
                        () => {
                            if (!this.shouldShowDomContainer(launchInfo)) return null

                            const { orientation, reverse } = this.domContainerPositionBox.read()

                            return <>
                                <Splitter
                                    resizeTarget    = 'next'
                                    mode            = { orientation }
                                    style           = { orientation === 'horizontal' ? "min-width: 8px; width: 8px" : "min-height: 8px; height: 8px" }
                                    companionsFunc  = {
                                        el => launchInfo?.context?.wrapper
                                            ? [ el.previousElementSibling, el.nextElementSibling, launchInfo.context.wrapper ] as HTMLElement[]
                                            : [ el.previousElementSibling, el.nextElementSibling ] as HTMLElement[]
                                    }
                                    sizeBox         = { orientation === 'horizontal' ? this.domContainerWidthBox : this.domContainerHeightBox }
                                ></Splitter>
                                <div
                                    class={ () => `is-flex ${ launchInfo?.context?.wrapper ? 'is-align-items-stretch' : 'is-justify-content-center is-align-items-center' }` }
                                    style={ () => orientation === 'horizontal' ? `width: ${ this.domContainerWidthBox.read() + 'px' }` : `height: ${ this.domContainerHeightBox.read() + 'px' }`}
                                >
                                    {
                                        launchInfo?.context?.wrapper
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
    }
) {}

