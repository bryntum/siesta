/** @jsx ChronoGraphJSX.createElement */

import { ChronoGraphJSX } from "../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../chronograph-jsx/Component.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
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
            projectData            : ProjectSerializableData
        }

        projectData            : ProjectSerializableData                = undefined


        render () : Element {
            return <div class="siesta-project-plan is-flex is-align-items-stretch is-flex-direction-column" style="height: 100%; overflow-y:scroll">
                <div style="height: 1.5em">Project plan</div>
                <div style="flex : 1">
                    <TestDescriptorComponent testDescriptor={ this.projectData.projectPlan }></TestDescriptorComponent>
                </div>
            </div>
        }
    }
) {}


export class TestDescriptorComponent extends Component {
    props : Component[ 'props' ] & {
        testDescriptor              : TestDescriptor
    }

    testDescriptor              : TestDescriptor                = undefined


    render () : Element {
        const testDescriptor    = this.testDescriptor

        if (testDescriptor.childNodes) {
            return <TreeComponent
                collapsible = { Boolean(testDescriptor.parentNode) }
                state       = "expanded"
                iconCls     = { [ 'far fa-folder-open', 'far fa-folder' ] }
            >
                <span>{ testDescriptor.title || testDescriptor.filename }</span>
                {
                    testDescriptor.childNodes.map(childNode =>
                        <leaf><TestDescriptorComponent testDescriptor={ childNode }></TestDescriptorComponent></leaf>
                    )
                }
            </TreeComponent>
        } else {
            return <span>
                { testDescriptor.filename }
            </span>
        }
    }
}
