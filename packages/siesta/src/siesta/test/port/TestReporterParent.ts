import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { XmlElement } from "../../../jsx/XmlElement.js"
import { local, Port } from "../../../rpc/port/Port.js"
import { LUID } from "../../common/LUID.js"
import { DashboardConnectorServer } from "../../launcher/DashboardConnector.js"
import { TestLaunchResult } from "../../launcher/TestLaunchResult.js"
import { Reporter } from "../../reporter/Reporter.js"
import { AssertionWaitForCreation, AssertionWaitForResolution } from "../assertion/AssertionAsync.js"
import { TestDescriptor } from "../TestDescriptor.js"
import {
    Assertion,
    AssertionAsyncCreation,
    AssertionAsyncResolution,
    Exception,
    LogMessage,
    TestResultLeaf
} from "../TestResult.js"
import { AssertionAsyncCreationReactive, TestNodeResultReactive } from "../TestResultReactive.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// make sure we actually import these class symbols (and not just types),
// so that their `@serializable()` decorator calls are made

Assertion
AssertionAsyncCreation
AssertionAsyncResolution
AssertionWaitForCreation
AssertionWaitForResolution
Exception
LogMessage
XmlElement

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface TestReporter {
    onSubTestStart (rootTestId : LUID, testNodeId : LUID, parentTestNodeId : LUID, descriptor : TestDescriptor) : Promise<any>

    onSubTestFinish (rootTestId : LUID, testNodeId : LUID, isIgnored : boolean) : Promise<any>

    onResult (rootTestId : LUID, testNodeId : LUID, result : TestResultLeaf) : Promise<any>

    onAssertionFinish (rootTestId : LUID, testNodeId : LUID, assertion : AssertionAsyncResolution) : Promise<any>
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestReporterParent extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) =>

    class TestReporterParent extends base implements TestReporter {

        reporter                    : Reporter                  = undefined

        rootTestNodeResult          : TestNodeResultReactive    = undefined

        currentTestNodeResult       : TestNodeResultReactive    = undefined

        launchInfo                  : TestLaunchResult          = undefined


        get connector () : DashboardConnectorServer {
            return this.reporter.launcher.dashboardConnector
        }


        @local()
        async onSubTestStart (rootTestId : LUID, testNodeId : LUID, parentTestNodeId : LUID, descriptor : TestDescriptor) {
            if (this.currentTestNodeResult) {
                if (this.currentTestNodeResult.localId !== parentTestNodeId) {
                    throw new Error("Parent test node internal id mismatch")
                }

                const newNode       = TestNodeResultReactive.new({
                    localId         : testNodeId,
                    descriptor      : descriptor,
                    state           : 'running',

                    parentNode      : this.currentTestNodeResult
                })

                this.currentTestNodeResult.addResult(newNode)

                const previousChildResultsIndex     = this.currentTestNodeResult.previous?.childResultsIndex

                if (previousChildResultsIndex) {
                    const currentIndex      = this.currentTestNodeResult.childResultsIndex
                    const newNodeId         = currentIndex.childToId.get(newNode)
                    const previousNode      = previousChildResultsIndex.idToChild.get(newNodeId)

                    if (previousNode) {
                        newNode.previous = previousNode
                        newNode.syncFromPrevious()
                    }
                }

                this.currentTestNodeResult  = newNode
            } else {
                const newNode       = TestNodeResultReactive.new({
                    localId         : testNodeId,
                    descriptor      : descriptor,
                    state           : 'running',

                    previous        : this.launchInfo.mostRecentResult
                })

                this.currentTestNodeResult          = this.rootTestNodeResult = newNode

                this.launchInfo.mostRecentResult    = newNode
            }

            this.reporter.onSubTestStart(this.currentTestNodeResult)

            if (this.connector) this.connector.onSubTestStart(rootTestId, testNodeId, parentTestNodeId, descriptor)
        }

        @local()
        async onSubTestFinish (rootTestId : LUID, testNodeId : LUID, isIgnored : boolean) {
            if (!this.currentTestNodeResult || this.currentTestNodeResult.localId !== testNodeId) {
                throw new Error("No current test node or test node id mismatch")
            }

            this.currentTestNodeResult.frozen   = true
            this.currentTestNodeResult.state    = isIgnored ? 'ignored' : 'completed'

            this.reporter.onSubTestFinish(this.currentTestNodeResult)

            this.currentTestNodeResult          = this.currentTestNodeResult.parentNode

            if (this.connector) this.connector.onSubTestFinish(rootTestId, testNodeId, isIgnored)
        }


        @local()
        async onResult (rootTestId : LUID, testNodeId : LUID, res : TestResultLeaf) {
            if (!this.currentTestNodeResult || this.currentTestNodeResult.localId !== testNodeId) {
                throw new Error("Parent node id mismatch for test result")
            }

            // re-create the `AssertionAsyncCreation` in the reactive form
            const result        = res instanceof AssertionAsyncCreation ? AssertionAsyncCreationReactive.new(res) : res

            this.currentTestNodeResult.addResult(result)

            this.reporter.onResult(this.currentTestNodeResult, result)

            if (this.connector) this.connector.onResult(rootTestId, testNodeId, result)
        }


        @local()
        async onAssertionFinish (rootTestId : LUID, testNodeId : LUID, resolution : AssertionAsyncResolution) {
            if (!this.currentTestNodeResult || this.currentTestNodeResult.localId !== testNodeId) {
                throw new Error("Parent node id mismatch for asynchronous test result finalization")
            }

            this.currentTestNodeResult.addAsyncResolution(resolution)

            this.reporter.onAssertionFinish(this.currentTestNodeResult, resolution)

            if (this.connector) this.connector.onAssertionFinish(rootTestId, testNodeId, resolution)
        }
    }
) {}
