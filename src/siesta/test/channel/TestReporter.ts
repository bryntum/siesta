import { Channel, local, remote } from "../../../channel/Channel.js"
import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { Assertion, AssertionAsync, Exception, LogMessage, TestNodeResult } from "../Result.js"
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

            @local()
            onAssertionStarted () : Promise<any> {
                return
            }

            @local()
            onTopTestStart () : Promise<any> {
                return
            }

            @local()
            onTopTestFinish () : Promise<any> {
                return
            }

            @local()
            onSubTestStart () : Promise<any> {
                console.log("ON SUBTEST START")

                return
            }

            @local()
            onSubTestFinish () : Promise<any> {
                return
            }

            @local()
            onException () : Promise<any> {
                return
            }

            @local()
            onLogMessage () : Promise<any> {
                return
            }

            @local()
            onAssertion (/*test : SubTest, */assertion : Assertion) : Promise<any> {
                console.log("ON ASSERTION START", assertion)

                return
            }

            @local()
            onAssertionFinish (test : SubTest, assertion : Assertion) : Promise<any> {
                return
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
            onSubTestStart : (/*testNode : TestNodeResult*/) => Promise<any>

            @remote()
            onSubTestFinish : (/*testNodeId : string*/) => Promise<any>

            @remote()
            onException : (testNodeId : string, exception : Exception) => Promise<any>

            @remote()
            onLogMessage : (testNodeId : string, logMessage : LogMessage) => Promise<any>

            @remote()
            onAssertion : (/*testNodeId : string, */assertion : Assertion) => Promise<any>

            @remote()
            onAssertionFinish : (testNodeId : string, assertion : AssertionAsync) => Promise<any>
        }

        return TestReporterChild
    }
) {}


