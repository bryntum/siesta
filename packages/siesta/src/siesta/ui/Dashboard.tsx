/** @jsx ChronoGraphJSX.createElement */

import { ChronoGraphJSX, ElementSource } from "../../chronograph-jsx/ChronoGraphJSX.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { IsolationLevel } from "../common/IsolationLevel.js"
import { DashboardConnectorClient } from "../launcher/DashboardConnector.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { SubTestCheckInfo } from "../test/TestResult.js"
import { individualCheckInfoForTestResult } from "../test/TestResultReactive.js"
import { DashboardCore, flattenFilteredTestDescriptor } from "./DashboardCore.js"
import { LaunchInfoComponent } from "./test_result/LaunchInfoComponent.js"
import { LaunchInfoComponentCore } from "./test_result/LaunchInfoComponentCore.js"

ChronoGraphJSX

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Dashboard extends Mixin(
    [ DashboardCore ],
    (base : ClassUnion<typeof DashboardCore>) =>

    class Dashboard extends base {
        launchInfoComponentClass    : typeof LaunchInfoComponentCore            = LaunchInfoComponent

        connector                   : DashboardConnectorClient  = DashboardConnectorClient.new({ dashboard : this })


        onDoubleClick (e : MouseEvent) {
            const desc      = this.getTestDescriptorComponentFromMouseEvent(e)

            if (desc) {
                this.launchContinuously(desc.leavesAxis(), e.ctrlKey ? 'page' : undefined)
            }

            // TODO move this to `LaunchInfoComponent`
            const result    = this.getTestResultComponentFromMouseEvent(e)

            if (result) {
                this.launchContinuouslyWithCheckInfo(this.currentTest, individualCheckInfoForTestResult(result))
            }
        }


        projectPlanBottomToolbar () : ElementSource {
            return <div class='tbar is-flex'>
                <span class="icon ripple icon-play-checked is-large" onclick={ () => this.runChecked() }>
                    <i class="fas fa-lg fa-play"></i>
                    <span class="icon is-small"><i class="fas fs-sm fa-check"></i></span>
                </span>
                <span class="icon ripple icon-play-all is-large" onclick={ () => this.runAll() }>
                    <i class="fas fa-lg fa-play"></i>
                    <span class="icon is-large"><i class="fas fa-lg fa-play"></i></span>
                </span>
            </div>
        }


        onBeforeUnload () {
            this.connector.onBeforeUnload()
        }


        runChecked () {
            const toLaunch          = Array.from(
                flattenFilteredTestDescriptor(this.testDescriptorFiltered)
                    .map(desc => this.getTestLaunchInfo(desc))
                    .filter(info => info.checked)
                    .map(info => info.descriptor)
            )

            this.launchContinuously(toLaunch)
        }


        runAll () {
            this.launchContinuously(flattenFilteredTestDescriptor(this.testDescriptorFiltered))
        }


        async launchContinuously (projectPlanItemsToLaunch : TestDescriptor[], isolationOverride? : IsolationLevel) : Promise<any> {
            // when launching more than 1 test - run them with "page" isolation to allow
            // parallelization
            // TODO need a proper "exclusive" queue in dispatcher too
            if (projectPlanItemsToLaunch.length > 1) isolationOverride = isolationOverride ?? 'page'

            projectPlanItemsToLaunch.forEach(desc => this.getTestLaunchInfo(desc).schedulePendingTestLaunch(this))

            this.connector.launchContinuously(projectPlanItemsToLaunch, isolationOverride)
        }


        async launchContinuouslyWithCheckInfo (desc : TestDescriptor, checkInfo : SubTestCheckInfo) {
            // this method will fetch the fresh test sources, among other things
            this.getTestLaunchInfo(desc).schedulePendingTestLaunch(this)

            this.connector.launchContinuouslyWithCheckInfo(desc, checkInfo)
        }
    }
) {}

