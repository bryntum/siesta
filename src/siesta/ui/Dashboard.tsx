/** @jsx ChronoGraphJSX.createElement */

import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { ChronoGraphJSX } from "../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../chronograph-jsx/Component.js"
import { ComponentElement } from "../../chronograph-jsx/ElementReactivity.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { awaitDomReady } from "../../util/Helpers.js"
import { Launcher } from "../launcher/Launcher.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { ProjectPlanComponent, TestDescriptorComponent } from "./ProjectPlanComponent.js"
import { TestNodeResultComponent } from "./test_result/TestResult.js"


ChronoGraphJSX

//---------------------------------------------------------------------------------------------------------------------
export class Dashboard extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class Dashboard extends base {
        launcher            : Launcher                      = undefined

        @field()
        currentTest         : TestDescriptor                = undefined


        async start () {
            await awaitDomReady()

            document.body.appendChild(this.el)
        }


        render () : Element {
            const dispatcher        = this.launcher.dispatcher

            return <div ondblclick={ e => this.onDoubleClick(e) } class="is-flex is-align-items-stretch" style="height : 100%;">
                <ProjectPlanComponent style="width: 300px" projectData={ this.launcher.projectData }></ProjectPlanComponent>
                <div style="flex : 1">
                    Test details
                    {
                        () => this.currentTest && dispatcher.results.get(this.currentTest).mostRecentResult
                            ? <TestNodeResultComponent
                                testNode={ dispatcher.results.get(this.currentTest).mostRecentResult }
                                dispatcher={ this.launcher.dispatcher }
                            ></TestNodeResultComponent>
                            : <span>{ this.currentTest && this.currentTest.filename }</span>
                    }
                </div>
            </div>
        }


        onDoubleClick (e : MouseEvent) {
            const testPlanItem : ComponentElement<TestDescriptorComponent> = (e.target as Element).closest('.project-plan-test')

            if (testPlanItem) {
                this.currentTest    = testPlanItem.comp.testDescriptor

                this.launcher.launchContinuously([ testPlanItem.comp.testDescriptor ])
            }
        }
    }
) {}
