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
            return <div class="project-plan is-flex is-align-items-stretch is-flex-direction-column" style="height: 100%">
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
            const launchInfo    = this.dispatcher.resultsGroups.get(this.testDescriptor)

            return <TreeComponent
                collapsible = { Boolean(testDescriptor.parentNode) }
                state       = "expanded"
                iconCls     = { [ 'far fa-folder-open', 'far fa-folder' ] }
                iconClsSource = { () => this.calculateGroupIconClass() }
                class       = { () => `project-plan-folder ${ launchInfo.viewState }` }
            >
                <span class='project-plan-folder-title'>{ testDescriptor.title || testDescriptor.filename }</span>
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
                <span class={ () => `project-plan-test-icon icon ${ launchInfo.viewState }`}>{
                    () => {
                        switch (launchInfo.viewState) {
                            case 'noinfo':
                                return <i class='far fa-file'></i>
                            case 'pending':
                                return <i class='far fa-hourglass'></i>
                            case 'started':
                                return <i class='far fa-clock'></i>
                            case 'running':
                                return <i class='fas fa-running'></i>
                            case 'exception':
                                return <i class='fas fa-spider'></i>
                            case 'passed':
                                return <i class='far fa-check-circle'></i>
                            case 'failed':
                                return <i class='far fa-times-circle'></i>
                        }
                    }
                }</span>
                <span class="project-plan-test-title">{ testDescriptor.filename }</span>
            </span>
        }
    }


    calculateGroupIconClass () : [ string, string ] {
        const launchInfo    = this.dispatcher.resultsGroups.get(this.testDescriptor)

        if (launchInfo.viewState === 'noinfo') {
            return [ 'far fa-folder-open', 'far fa-folder' ]
        }
        else if (launchInfo.viewState === 'pending') {
            return [ 'far fa-hourglass', 'far fa-hourglass' ]
        }
        else if (launchInfo.viewState === 'running') {
            return [ 'fas fa-running', 'fas fa-running' ]
        }
        else if (launchInfo.viewState === 'passed') {
            return [ 'fas fa-check-double', 'fas fa-check-double' ]
        }
        else if (launchInfo.viewState === 'failed') {
            return [ 'far fa-times-circle', 'far fa-times-circle' ]
        }
    }
}
