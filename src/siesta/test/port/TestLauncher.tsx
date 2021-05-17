import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { local, remote } from "../../../rpc/port/Port.js"
import { PortEvaluateChild, PortEvaluateParent } from "../../../rpc/port/PortEvaluate.js"
import { PortHandshakeChild, PortHandshakeParent } from "../../../rpc/port/PortHandshake.js"
import { parse } from "../../../serializable/Serializable.js"
import { globalTestEnv, Test } from "../Test.js"
import { TestReporterChild, TestReporterParent } from "./TestReporter.js"

// //---------------------------------------------------------------------------------------------------------------------
// // make sure we actually import these class symbols (and not just types),
// // so that their `registerSerializableClass()` calls are made
//
// TestDescriptor
// // IMPORTANT the following classes are assumed to be isomorphic by themselves
// // (even that they represent the data for non-isomorphic classes)
// TestDescriptorNodejs
// TestDescriptorDeno
// TestDescriptorBrowser

//---------------------------------------------------------------------------------------------------------------------
interface TestLauncher {
    launchTest (url : string, testDescriptorStr : string) : Promise<any>

    getSameContextChildLauncher () : Promise<TestLauncherChild>
}

//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherParent extends Mixin(
    [ TestReporterParent, PortEvaluateParent, PortHandshakeParent, Base ],
    (base : ClassUnion<typeof TestReporterParent, typeof PortEvaluateParent, typeof PortHandshakeParent, typeof Base>) => {

        class TestLauncherParent extends base implements TestLauncher {
            @remote()
            launchTest : (url : string, testDescriptorStr : string) => Promise<any>

            @remote()
            getSameContextChildLauncher : () => Promise<TestLauncherChild>
        }

        return TestLauncherParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherChild extends Mixin(
    [ TestReporterChild, PortEvaluateChild, PortHandshakeChild, Base ],
    (base : ClassUnion<typeof TestReporterChild, typeof PortEvaluateChild, typeof PortHandshakeChild, typeof Base>) => {

        class TestLauncherChild extends base implements TestLauncher {

            @local()
            async getSameContextChildLauncher () : Promise<TestLauncherChild> {
                return this
            }


            @local()
            async launchTest (url : string, testDescriptorStr : string) {
                if (globalTestEnv.topTest) throw new Error("Test context is already running a test")

                globalTestEnv.topTestDescriptorStr  = testDescriptorStr
                globalTestEnv.launcher              = this

                let topTest : Test

                try {
                    await import(url)
                } catch (e) {
                    // TODO should account for possibility of `parse` throwing an error

                    // there might be no `topTest` if test file does not contain any calls
                    // to static `it` method of any test class
                    topTest = globalTestEnv.topTest || Test.new({
                        descriptor      : parse(testDescriptorStr),
                        reporter        : this
                    })

                    topTest.failOnExceptionDuringImport(e)

                    globalTestEnv.clear()

                    return
                }

                // TODO should account for possibility of `parse` throwing an error

                // there might be no `topTest` if test file does not contain any calls
                // to static `it` method of any test class
                topTest = globalTestEnv.topTest || Test.new({
                    descriptor      : parse(testDescriptorStr),
                    reporter        : this
                })

                await topTest.start()

                globalTestEnv.clear()
            }
        }

        return TestLauncherChild
    }
) {}
