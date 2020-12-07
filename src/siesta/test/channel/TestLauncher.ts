import { local, remote } from "../../../channel/Channel.js"
import { ChannelEvaluateChild, ChannelEvaluateParent } from "../../../channel/ChannelEvaluate.js"
import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TestDescriptor } from "../Descriptor.js"
import { globalTestEnv, Test } from "../Test.js"
import { TestReporterChild, TestReporterParent } from "./TestReporter.js"

//---------------------------------------------------------------------------------------------------------------------
// make sure we actually import these class symbols (and not just types),
// so that their `registerSerializableClass()` calls are made

TestDescriptor

//---------------------------------------------------------------------------------------------------------------------
interface TestLauncher {
    launchTest (testDescriptor : TestDescriptor) : Promise<any>
}

//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherParent extends Mixin(
    [ TestReporterParent, ChannelEvaluateParent ],
    (base : ClassUnion<typeof TestReporterParent, typeof ChannelEvaluateParent>) => {

        class TestLauncherParent extends base implements TestLauncher {
            @remote()
            launchTest : (testDescriptor : TestDescriptor) => Promise<any>
        }

        return TestLauncherParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherChild extends Mixin(
    [ TestReporterChild, ChannelEvaluateChild ],
    (base : ClassUnion<typeof TestReporterChild, typeof ChannelEvaluateChild>) => {

        class TestLauncherChild extends base implements TestLauncher {

            @local()
            async launchTest (testDescriptor : TestDescriptor) {
                if (globalTestEnv.topTest) throw new Error("Test context is already running a test")

                globalTestEnv.topTestDescriptor = testDescriptor
                globalTestEnv.launcher          = this

                try {
                    await import(testDescriptor.url)
                    //debugger

                    // there might be no `topTest` if test file does not contain any calls
                    // to static `it` method of any test class
                    const topTest = globalTestEnv.topTest || Test.new({
                        descriptor      : testDescriptor,

                        reporter        : this
                    })

                    await topTest.start()

                } catch (e) {
                    //debugger
                    console.log(e)
                } finally {
                    globalTestEnv.clear()
                }
            }
        }

        return TestLauncherChild
    }
) {}


