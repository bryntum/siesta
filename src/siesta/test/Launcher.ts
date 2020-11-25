import { local, remote } from "../../channel/Channel.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ExecutionContextRemote, ExecutionContextRemoteChild } from "../../context/ExecutionContextRemote.js"
import { ChannelTestLauncher, ChannelTestReporter } from "./channel/Reporter.js"
import { TestDescriptor } from "./Descriptor.js"
import { globalTestEnv, Test } from "./Test.js"

//---------------------------------------------------------------------------------------------------------------------
// make sure we actually import these class symbols (and not just types),
// so that their `registerSerializableClass()` calls are made

TestDescriptor

//---------------------------------------------------------------------------------------------------------------------
export class TestLaunchLauncherSide extends Mixin(
    [ ChannelTestLauncher, ExecutionContextRemote ],
    (base : ClassUnion<typeof ChannelTestLauncher, typeof ExecutionContextRemote>) => {

        class TestLaunchLauncherSide extends base {
            @remote()
            launchTest : (testUrl : string, testDescriptor : TestDescriptor) => Promise<any>
        }

        return TestLaunchLauncherSide
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestLaunchTestSide extends Mixin(
    [ ChannelTestReporter, ExecutionContextRemoteChild ],
    (base : ClassUnion<typeof ChannelTestReporter, typeof ExecutionContextRemoteChild>) => {

        class TestLaunchTestSide extends base {
            topTest         : Test              = undefined


            @local()
            async launchTest (testUrl : string, testDescriptor : TestDescriptor) {
                const topTest           = globalTestEnv.topTest = Test.new({
                    descriptor      : testDescriptor,

                    reporter        : this
                })
                try {
                    await import(testUrl)
                    debugger

                    globalTestEnv.topTest   = undefined

                    await topTest.start()

                } catch (e) {
                    debugger
                    console.log(e)
                }
            }
        }

        return TestLaunchTestSide
    }
) {}


