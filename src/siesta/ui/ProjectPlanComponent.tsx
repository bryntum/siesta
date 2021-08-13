/** @jsx ChronoGraphJSX.createElement */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { ChronoGraphJSX } from "../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../chronograph-jsx/Component.js"
import { ComponentElement } from "../../chronograph-jsx/ElementReactivity.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { Dispatcher } from "../launcher/Dispatcher.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TreeComponent } from "./components/TreeComponent.js"
import { TestDescriptorFiltered } from "./Dashboard.js"

ChronoGraphJSX

//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class ProjectPlanComponent extends base {
        props : Component[ 'props' ] & {
            selectedTestBox         : ProjectPlanComponent[ 'selectedTestBox' ]
            dispatcher              : ProjectPlanComponent[ 'dispatcher' ]
            testDescriptor          : ProjectPlanComponent[ 'testDescriptor' ]
        }

        projectData             : ProjectSerializableData               = undefined

        testDescriptor          : TestDescriptorFiltered                = undefined

        selectedTestBox         : Box<TestDescriptor>                   = undefined

        dispatcher              : Dispatcher                            = undefined


        render () : Element {
            return <div class="project-plan">
                {
                    () => {
                        return this.testDescriptor
                            ?
                                <TestDescriptorComponent
                                    dispatcher      = { this.dispatcher }
                                    selectedTestBox = { this.selectedTestBox }
                                    testDescriptor  = { this.testDescriptor }
                                ></TestDescriptorComponent>
                            :
                                <div class='is-flex is-justify-content-center is-align-items-center' style='height: 100%'>
                                    <div>No matching tests</div>
                                </div>
                    }
                }
            </div>
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestDescriptorComponent extends Component {
    props : Component[ 'props' ] & {
        testDescriptor          : TestDescriptorComponent[ 'testDescriptor' ]
        selectedTestBox         : TestDescriptorComponent[ 'selectedTestBox' ]
        dispatcher              : TestDescriptorComponent[ 'dispatcher' ]
    }

    dispatcher                  : Dispatcher                    = undefined

    testDescriptor              : TestDescriptorFiltered        = undefined
    selectedTestBox             : Box<TestDescriptor>           = undefined


    render () : Element {
        const testDescriptor    = this.testDescriptor.descriptor

        if (testDescriptor.childNodes) {
            const launchInfo    = this.dispatcher.resultsGroups.get(testDescriptor)

            const el = <TreeComponent
                collapsible = { Boolean(testDescriptor.parentNode) }
                extraIconSource = {
                    () => <span onclick={ () => launchInfo.toggleChecked() } class="icon ripple">
                        <i class={ () => launchInfo.checked ? 'far fa-check-square' : 'far fa-square' }></i>
                    </span>
                }
                state       = { launchInfo.expandedState != null ? launchInfo.expandedState : 'expanded' }
                iconCls     = { [ 'far fa-folder-open', 'far fa-folder' ] }
                iconClsSource = { () => this.calculateGroupIconClass() }
                class       = { () => `project-plan-folder ${ launchInfo.viewState }` }
            >
                <span class='project-plan-folder-title'>{ testDescriptor.title || testDescriptor.filename }</span>
                {
                    this.testDescriptor.filteredChildren.map(childNode =>
                        <leaf>
                            <TestDescriptorComponent
                                dispatcher      = { this.dispatcher }
                                selectedTestBox = { this.selectedTestBox }
                                testDescriptor  = { childNode }
                            >
                            </TestDescriptorComponent>
                        </leaf>
                    )
                }
            </TreeComponent> as ComponentElement<TreeComponent>

            // save changes in `state` atom of the TreeComponent to the `expanded
            (el.comp.$.state as Box<TreeComponent[ 'state' ]>).commitValueOptimisticHook.on((atom, value) => launchInfo.expandedState = value)

            return el
        } else {
            const launchInfo        = this.dispatcher.results.get(testDescriptor)

            return <div class="project-plan-test" class:is-selected={ () => this.selectedTestBox.read() === testDescriptor }>
                <div class="ripple">

                    <span onclick={ () => launchInfo.toggleChecked() } class="icon ripple">
                        <i class={ () => launchInfo.checked ? 'far fa-check-square' : 'far fa-square' }></i>
                    </span>

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
                </div>
            </div>
        }
    }


    calculateGroupIconClass () : [ string, string ] {
        const launchInfo    = this.dispatcher.resultsGroups.get(this.testDescriptor.descriptor)

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
            return [ 'fas fa-times-circle', 'fas fa-times-circle' ]
        }
    }
}
