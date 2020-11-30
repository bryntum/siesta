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
            launchTest : (testUrl : string, testDescriptor : TestDescriptor) => Promise<any>
        }

        return TestLauncherParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherChild extends Mixin(
    [ TestReporterChild, ExecutionContextRemoteChild ],
    (base : ClassUnion<typeof TestReporterChild, typeof ExecutionContextRemoteChild>) => {

        class TestLauncherChild extends base {
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

        return TestLauncherChild
    }
) {}

