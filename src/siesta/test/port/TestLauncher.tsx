import { Channel } from "../../../rpc/channel/Channel.js"
import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { local, remote } from "../../../rpc/port/Port.js"
import { PortEvaluateChild, PortEvaluateParent } from "../../../rpc/port/PortEvaluate.js"
import { PortHandshakeChild, PortHandshakeParent } from "../../../rpc/port/PortHandshake.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { TestDescriptor } from "../TestDescriptor.js"
import { globalTestEnv, Test } from "../Test.js"
import { TestDescriptorBrowser } from "../TestDescriptorBrowser.js"
import { TestDescriptorNodejs } from "../TestDescriptorNodejs.js"
import { TestReporterChild, TestReporterParent } from "./TestReporter.js"

//---------------------------------------------------------------------------------------------------------------------
// make sure we actually import these class symbols (and not just types),
// so that their `registerSerializableClass()` calls are made

TestDescriptor
// IMPORTANT the following 2 classes are assumed to be isomorphic by themselves
// (even that they represent the data for non-isomorphic classes)
TestDescriptorNodejs
TestDescriptorBrowser

//---------------------------------------------------------------------------------------------------------------------
interface TestLauncher {
    launchTest (testDescriptor : TestDescriptor) : Promise<any>
}

//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherParent extends Mixin(
    [ TestReporterParent, PortEvaluateParent, PortHandshakeParent, Base ],
    (base : ClassUnion<typeof TestReporterParent, typeof PortEvaluateParent, typeof PortHandshakeParent, typeof Base>) => {

        class TestLauncherParent extends base implements TestLauncher {
            @remote()
            launchTest : (testDescriptor : TestDescriptor) => Promise<any>
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
            async launchTest (testDescriptor : TestDescriptor) {
                if (globalTestEnv.topTest) throw new Error("Test context is already running a test")

                globalTestEnv.topTestDescriptor = testDescriptor
                globalTestEnv.launcher          = this

                let topTest : Test

                try {
                    await import(testDescriptor.url)
                } catch (e) {
                    // there might be no `topTest` if test file does not contain any calls
                    // to static `it` method of any test class
                    topTest = globalTestEnv.topTest || Test.new({
                        descriptor      : testDescriptor,
                        reporter        : this
                    })

                    topTest.failOnExceptionDuringImport(e)

                    globalTestEnv.clear()

                    return
                }

                // there might be no `topTest` if test file does not contain any calls
                // to static `it` method of any test class
                topTest = globalTestEnv.topTest || Test.new({
                    descriptor      : testDescriptor,
                    reporter        : this
                })

                await topTest.start()

                globalTestEnv.clear()
            }
        }

        return TestLauncherChild
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ChannelTestLauncher extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class ChannelTestLauncher extends base {
            parentPort              : TestLauncherParent                = undefined
            parentPortClass         : typeof TestLauncherParent         = TestLauncherParent

            childPortClassUrl       : string                            = import.meta.url
            childPortClassSymbol    : string                            = 'TestLauncherChild'
        }

        return ChannelTestLauncher
    }
) {}
