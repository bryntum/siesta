import { local, remote } from "../../../channel/Channel.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { ExecutionContextRemote, ExecutionContextRemoteChild } from "../../../context/ExecutionContextRemote.js"
import { TestDescriptor } from "../Descriptor.js"
import { globalTestEnv, Test } from "../Test.js"
import { TestReporterChild, TestReporterParent } from "./TestReporter.js"

//---------------------------------------------------------------------------------------------------------------------
// make sure we actually import these class symbols (and not just types),
// so that their `registerSerializableClass()` calls are made

TestDescriptor

//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherParent extends Mixin(
    [ TestReporterParent, ExecutionContextRemote ],
    (base : ClassUnion<typeof TestReporterParent, typeof ExecutionContextRemote>) => {

        class TestLauncherParent extends base {
            @remote()
            launchTest : (testDescriptor : TestDescriptor) => Promise<any>
        }

        return TestLauncherParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherChild extends Mixin(
    [ TestReporterChild, ExecutionContextRemoteChild ],
    (base : ClassUnion<typeof TestReporterChild, typeof ExecutionContextRemoteChild>) => {

        class TestLauncherChild extends base {

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


