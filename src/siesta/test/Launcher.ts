import { local, remote } from "../../channel/Channel.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContextRemote, ExecutionContextRemoteChild } from "../../context/ExecutionContextRemote.js"
import { ChannelTestLauncher, ChannelTestReporter } from "./channel/Reporter.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestLaunchLauncherSide extends Mixin(
    [ ChannelTestLauncher, ExecutionContextRemote ],
    (base : ClassUnion<typeof ChannelTestLauncher, typeof ExecutionContextRemote>) => {

        class TestLaunchLauncherSide extends base {
            @remote()
            launchTest : (testUrl : string) => Promise<any>
        }

        return TestLaunchLauncherSide
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestLaunchTestSide extends Mixin(
    [ ChannelTestReporter, ExecutionContextRemoteChild ],
    (base : ClassUnion<typeof ChannelTestReporter, typeof ExecutionContextRemoteChild>) => {

        class TestLaunchTestSide extends base {

            @local()
            async launchTest (testUrl : string) {
                // try {
                    await import(testUrl)
                    debugger
                // } catch (e) {
                //     debugger
                //     console.log(e)
                // }
            }
        }

        return TestLaunchTestSide
    }
) {}


