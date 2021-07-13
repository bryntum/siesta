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

            return <div
                onmousedown = { e => this.onMouseDown(e) }
                onclick     = { e => this.onClick(e) }
                ondblclick  = { e => this.onDoubleClick(e) }
                class       = "is-flex is-align-items-stretch" style="height: 100%;"
            >
                <ProjectPlanComponent style="width: 300px" projectData={ this.launcher.projectData }></ProjectPlanComponent>
                <div style="flex: 1; overflow-y: auto">
                    {
                        () => this.currentTest && dispatcher.results.get(this.currentTest).mostRecentResult
                            ? <TestNodeResultComponent
                                testNode={ dispatcher.results.get(this.currentTest).mostRecentResult }
                                dispatcher={ this.launcher.dispatcher }
                            ></TestNodeResultComponent>
                            : undefined
                    }
                </div>
            </div>
        }


        getTestDescriptorComponentFromMouseEvent (e : MouseEvent) : TestDescriptorComponent | undefined {
            const testPlanItem : ComponentElement<TestDescriptorComponent> = (e.target as Element).closest('.project-plan-test, .project-plan-folder')

            return testPlanItem ? testPlanItem.comp : undefined
        }


        onMouseDown (e : MouseEvent) {
            const comp      = this.getTestDescriptorComponentFromMouseEvent(e)

            // prevent the text selection on double click only (still works for mouse drag)
            if (comp && e.detail > 1) e.preventDefault()
        }


        onClick (e : MouseEvent) {
            const comp      = this.getTestDescriptorComponentFromMouseEvent(e)

            if (comp) {
                this.currentTest    = comp.testDescriptor
            }
        }


        onDoubleClick (e : MouseEvent) {
            const comp      = this.getTestDescriptorComponentFromMouseEvent(e)

            if (comp) {
                this.currentTest    = comp.testDescriptor

                this.launcher.launchContinuously(comp.testDescriptor.leavesAxis())
            }
        }
    }
) {}
