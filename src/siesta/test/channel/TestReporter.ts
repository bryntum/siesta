import { Channel, local, remote } from "../../../channel/Channel.js"
import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { Reporter } from "../../reporter/Reporter.js"
import { TestDescriptor } from "../Descriptor.js"
import { InternalId } from "../InternalIdSource.js"
import { Assertion, AssertionAsync, Exception, LogMessage, Result, TestNodeResult } from "../Result.js"
import { SubTest } from "../Test.js"

//---------------------------------------------------------------------------------------------------------------------
// make sure we actually import these class symbols (and not just types),
// so that their `registerSerializableClass()` calls are made

Assertion
AssertionAsync
Exception
LogMessage

//---------------------------------------------------------------------------------------------------------------------
export class TestReporterParent extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class TestReporterParent extends base {

            reporter        : Reporter          = undefined


            currentTestNodeResult       : TestNodeResult        = undefined

            // @local()
            // onTopTestStart () : Promise<any> {
            //     return
            // }
            //
            // @local()
            // onTopTestFinish () : Promise<any> {
            //     return
            // }

            @local()
            onSubTestStart (testNodeId : InternalId, parentTestNodeId : InternalId, descriptor : TestDescriptor) {
                // console.log("ON SUBTEST START", descriptor)

                if (this.currentTestNodeResult) {
                    if (this.currentTestNodeResult.internalId !== parentTestNodeId) {
                        throw new Error("Parent test node internal id mismatch")
                    }

                    const newNode       = TestNodeResult.new({
                        internalId      : testNodeId,
                        descriptor      : descriptor,
                        state           : 'running',

                        parentNode      : this.currentTestNodeResult
                    })

                    this.currentTestNodeResult.childNodes.push(newNode)

                    this.currentTestNodeResult  = newNode
                } else {
                    const newNode       = TestNodeResult.new({
                        internalId      : testNodeId,
                        descriptor      : descriptor,
                        state           : 'running',

                    })

                    this.currentTestNodeResult  = newNode
                }

                this.reporter.onSubTestStart(this.currentTestNodeResult)
            }

            @local()
            onSubTestFinish (testNodeId : InternalId) {
                if (!this.currentTestNodeResult || this.currentTestNodeResult.internalId !== testNodeId) {
                    throw new Error("No current test node or test node id mismatch")
                }

                this.currentTestNodeResult.frozen   = true
                this.currentTestNodeResult.state    = "completed"

                this.reporter.onSubTestFinish(this.currentTestNodeResult)

                this.currentTestNodeResult          = this.currentTestNodeResult.parentNode
            }


            @local()
            onResult (testNodeId : InternalId, result : Result) {
                // console.log("ON ASSERTION START", result)

                if (!this.currentTestNodeResult || this.currentTestNodeResult.internalId !== testNodeId) {
                    throw new Error("Parent node id mismatch for test result")
                }

                this.currentTestNodeResult.addResult(result)

                this.reporter.onResult(this.currentTestNodeResult, result)
            }


            @local()
            onAssertionFinish (testNodeId : InternalId, assertion : AssertionAsync) {
                if (!this.currentTestNodeResult || this.currentTestNodeResult.internalId !== testNodeId) {
                    throw new Error("Parent node id mismatch for asynchronous test result finalization")
                }

                if (!this.currentTestNodeResult.resultMap.has(assertion.internalId)) {
                    throw new Error("Missing asynchronous assertion in current test node result")
                }

                this.currentTestNodeResult.updateResult(assertion)

                this.reporter.onAssertionFinish(this.currentTestNodeResult, assertion)
            }
        }

        return TestReporterParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestReporterChild extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class TestReporterChild extends base {
            // @remote()
            // onTopTestStart : (testNode : TestNodeResult) => Promise<any>
            //
            // @remote()
            // onTopTestFinish : (testNodeId : string) => Promise<any>

            @remote()
            onSubTestStart : (testNodeId : InternalId, parentTestNodeId : InternalId, descriptor : TestDescriptor) => Promise<any>

            @remote()
            onSubTestFinish : (testNodeId : InternalId) => Promise<any>

            @remote()
            onResult : (testNodeId : InternalId, assertion : Result) => Promise<any>

            @remote()
            onAssertionFinish : (testNodeId : InternalId, assertion : AssertionAsync) => Promise<any>
        }

        return TestReporterChild
    }
) {}


