import { Channel, local, remote } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Assertion, AssertionAsync, Exception, LogMessage, TestNodeResult } from "./Result.js"
import { SubTest } from "./Test.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelTestLauncher extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class ChannelTestReporter extends base {
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
            onAssertionStart (test : SubTest, assertion : Assertion) : Promise<any> {
                return
            }

            @local()
            onAssertionFinish (test : SubTest, assertion : Assertion) : Promise<any> {
                return
            }
        }

        return ChannelTestReporter
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ChannelTestReporter extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class ChannelTestReporter extends base {
            // @remote()
            // onTopTestStart : (testNode : TestNodeResult) => Promise<any>
            //
            // @remote()
            // onTopTestFinish : (testNodeId : string) => Promise<any>

            @remote()
            onSubTestStart : (testNode : TestNodeResult) => Promise<any>

            @remote()
            onSubTestFinish : (testNodeId : string) => Promise<any>

            @remote()
            onException : (testNodeId : string, exception : Exception) => Promise<any>

            @remote()
            onLogMessage : (testNodeId : string, logMessage : LogMessage) => Promise<any>

            @remote()
            onAssertion : (testNodeId : string, assertion : Assertion) => Promise<any>

            @remote()
            onAssertionFinish : (testNodeId : string, assertion : AssertionAsync) => Promise<any>
        }

        return ChannelTestReporter
    }
) {}


