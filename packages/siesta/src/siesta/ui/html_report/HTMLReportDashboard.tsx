/** @jsx ChronoGraphJSX.createElement */
import { ClassUnion, Mixin } from "typescript-mixin-class/index.js"
import { TestLaunchResult } from "../../launcher/TestLaunchResult.js"
import { TestDescriptor } from "../../test/TestDescriptor.js"
import { DashboardCore } from "../DashboardCore.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class HTMLReportDashboard extends Mixin(
    [ DashboardCore ],
    (base : ClassUnion<typeof DashboardCore>) =>

    class HTMLReportDashboard extends base {
        launchResult            : TestLaunchResult          = undefined


        setupData () {
            const hasResults : Set<TestDescriptor>      = new Set()

            for (const launchRes of this.launchResult.traverseGen())
                if (launchRes.isLeaf() && launchRes.mostRecentResult) hasResults.add(launchRes.descriptor)

            super.setupData()

            for (const launchRes of this.launchResult.traverseGen()) {
                if (launchRes.isLeaf() && launchRes.mostRecentResult) {
                    const launchInfo = this.mapping.get(launchRes.descriptor.guid)

                    launchInfo.mostRecentResult = launchRes.mostRecentResult
                }
            }
        }
    }
) {}

