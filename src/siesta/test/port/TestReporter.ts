import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { XmlElement } from "../../../jsx/XmlElement.js"
import { local, Port, remote } from "../../../rpc/port/Port.js"
import { LUID } from "../../common/LUID.js"
import { TestLaunchInfo } from "../../launcher/TestLaunchInfo.js"
import { Reporter } from "../../reporter/Reporter.js"
import { AssertionWaitForCreation, AssertionWaitForResolution } from "../assertion/AssertionAsync.js"
import { TestDescriptor } from "../TestDescriptor.js"
import {
    Assertion,
    AssertionAsyncCreation,
    AssertionAsyncResolution,
    Exception,
    LogMessage,
    TestNodeResultReactive,
    TestResultLeaf
} from "../TestResult.js"

//---------------------------------------------------------------------------------------------------------------------
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

//---------------------------------------------------------------------------------------------------------------------
interface TestReporter {
    onSubTestStart (testNodeId : LUID, parentTestNodeId : LUID, descriptor : TestDescriptor) : Promise<any>

    onSubTestFinish (testNodeId : LUID, isIgnored : boolean) : Promise<any>

    onResult (testNodeId : LUID, result : TestResultLeaf) : Promise<any>

    onAssertionFinish (testNodeId : LUID, assertion : AssertionAsyncResolution) : Promise<any>
}

//---------------------------------------------------------------------------------------------------------------------
export class TestReporterParent extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) =>

        class TestReporterParent extends base implements TestReporter {

            reporter                    : Reporter                  = undefined

            rootTestNodeResult          : TestNodeResultReactive    = undefined

            currentTestNodeResult       : TestNodeResultReactive    = undefined

            launchInfo                  : TestLaunchInfo            = undefined


            @local()
            async onSubTestStart (testNodeId : LUID, parentTestNodeId : LUID, descriptor : TestDescriptor) {
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

                    this.currentTestNodeResult  = newNode
                } else {
                    const newNode       = TestNodeResultReactive.new({
                        localId         : testNodeId,
                        descriptor      : descriptor,
                        state           : 'running',
                    })

                    this.currentTestNodeResult          = this.rootTestNodeResult = newNode

                    this.launchInfo.setMostRecentResult(newNode)
                    this.launchInfo.launchState         = 'running'
                }

                this.reporter.onSubTestStart(this.currentTestNodeResult)
            }

            @local()
            async onSubTestFinish (testNodeId : LUID, isIgnored : boolean) {
                if (!this.currentTestNodeResult || this.currentTestNodeResult.localId !== testNodeId) {
                    throw new Error("No current test node or test node id mismatch")
                }

                this.currentTestNodeResult.frozen   = true
                this.currentTestNodeResult.state    = isIgnored ? 'ignored' : 'completed'

                this.reporter.onSubTestFinish(this.currentTestNodeResult)

                this.currentTestNodeResult          = this.currentTestNodeResult.parentNode

                if (!this.currentTestNodeResult) {
                    this.launchInfo.syncResultsInfo()
                }
            }


            @local()
            async onResult (testNodeId : LUID, result : TestResultLeaf) {
                if (!this.currentTestNodeResult || this.currentTestNodeResult.localId !== testNodeId) {
                    throw new Error("Parent node id mismatch for test result")
                }

                this.currentTestNodeResult.addResult(result)

                this.reporter.onResult(this.currentTestNodeResult, result)
            }


            @local()
            async onAssertionFinish (testNodeId : LUID, assertion : AssertionAsyncResolution) {
                if (!this.currentTestNodeResult || this.currentTestNodeResult.localId !== testNodeId) {
                    throw new Error("Parent node id mismatch for asynchronous test result finalization")
                }

                this.currentTestNodeResult.addAsyncResolution(assertion)

                this.reporter.onAssertionFinish(this.currentTestNodeResult, assertion)
            }
        }

) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestReporterChild extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) =>

        class TestReporterChild extends base implements TestReporter {
            @remote()
            onSubTestStart : (testNodeId : LUID, parentTestNodeId : LUID, descriptor : TestDescriptor) => Promise<any>

            @remote()
            onSubTestFinish : (testNodeId : LUID, isIgnored : boolean) => Promise<any>

            @remote()
            onResult : (testNodeId : LUID, result : TestResultLeaf) => Promise<any>

            @remote()
            onAssertionFinish : (testNodeId : LUID, assertion : AssertionAsyncResolution) => Promise<any>
        }

) {}


