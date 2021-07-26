/** @jsx ChronoGraphJSX.createElement */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { ChronoGraphJSX } from "../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../chronograph-jsx/Component.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { Dispatcher } from "../launcher/Dispatcher.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TreeComponent } from "./components/TreeComponent.js"

ChronoGraphJSX

//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class ProjectPlanComponent extends base {
        props : Component[ 'props' ] & {
            projectData             : ProjectPlanComponent[ 'projectData' ]
            selectedTestBox         : ProjectPlanComponent[ 'selectedTestBox' ]
            dispatcher              : ProjectPlanComponent[ 'dispatcher' ]
        }

        projectData             : ProjectSerializableData               = undefined

        selectedTestBox         : Box<TestDescriptor>                   = undefined

        dispatcher              : Dispatcher                            = undefined


        render () : Element {
            return <div class="project-plan is-flex is-align-items-stretch is-flex-direction-column" style="height: 100%; overflow-y:scroll">
                <div style="height: 1.5em">Project plan</div>
                <div style="flex : 1">
                    <TestDescriptorComponent dispatcher={ this.dispatcher } selectedTestBox={ this.selectedTestBox } testDescriptor={ this.projectData.projectPlan }></TestDescriptorComponent>
                </div>
            </div>
        }
    }
) {}


export class TestDescriptorComponent extends Component {
    props : Component[ 'props' ] & {
        testDescriptor          : TestDescriptor
        selectedTestBox         : TestDescriptorComponent[ 'selectedTestBox' ]
        dispatcher              : TestDescriptorComponent[ 'dispatcher' ]
    }

    dispatcher                  : Dispatcher                    = undefined

    testDescriptor              : TestDescriptor                = undefined
    selectedTestBox             : Box<TestDescriptor>           = undefined


    render () : Element {
        const testDescriptor    = this.testDescriptor

        if (testDescriptor.childNodes) {
            return <TreeComponent
                collapsible = { Boolean(testDescriptor.parentNode) }
                state       = "expanded"
                iconCls     = { [ 'far fa-folder-open', 'far fa-folder' ] }
                iconClsSource = { () => this.calculateGroupIconClass() }
                class       = "project-plan-folder"
            >
                <span>{ testDescriptor.title || testDescriptor.filename }</span>
                {
                    testDescriptor.childNodes.map(childNode =>
                        <leaf>
                            <TestDescriptorComponent
                                dispatcher={ this.dispatcher } selectedTestBox={ this.selectedTestBox } testDescriptor={ childNode }
                            >
                            </TestDescriptorComponent>
                        </leaf>
                    )
                }
            </TreeComponent>
        } else {
            const launchInfo        = this.dispatcher.results.get(testDescriptor)

            return <span class="project-plan-test" class:is-selected={ () => this.selectedTestBox.read() === testDescriptor }>
                {
                    () => {
                        switch (launchInfo.viewState) {
                            case 'noinfo':
                                return <span class="icon"><i class='far fa-clipboard'></i></span>
                            case 'pending':
                                return <span class="icon"><i class='far fa-hourglass'></i></span>
                            case 'started':
                                return <span class="icon"><i class='far fa-clock'></i></span>
                            case 'running':
                                return <span class="icon"><i class='fas fa-bolt'></i></span>
                            case 'exception':
                                return <span class="icon"><i class='fas fa-spider'></i></span>
                            case 'passed':
                                return <span class="icon"><i class='fas fa-check'></i></span>
                            case 'failed':
                                return <span class="icon"><i class='fas fa-times'></i></span>
                        }
                    }
                }
                { testDescriptor.filename }
            </span>
        }
    }


    calculateGroupIconClass () : [ string, string ] {
        const result    = this.dispatcher.resultsGroups.get(this.testDescriptor)

        if (result.viewState === 'noinfo') {
            return [ 'far fa-folder-open', 'far fa-folder' ]
        }
        else if (result.viewState === 'pending') {
            return [ 'far fa-hourglass', 'far fa-hourglass' ]
        }
        else if (result.viewState === 'running') {
            return [ 'fas fa-bolt', 'fas fa-bolt' ]
        }
        else if (result.viewState === 'passed') {
            return [ 'fas fa-check', 'fas fa-check' ]
        }
        else if (result.viewState === 'failed') {
            return [ 'fas fa-times', 'fas fa-times' ]
        }
    }
}
