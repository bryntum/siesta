import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { local, remote } from "../../../rpc/port/Port.js"
import { PortEvaluateChild, PortEvaluateParent } from "../../../rpc/port/PortEvaluate.js"
import { PortHandshakeChild, PortHandshakeParent } from "../../../rpc/port/PortHandshake.js"
import { parse } from "../../../serializable/Serializable.js"
import { globalTestEnv, Test } from "../Test.js"
import { SubTestCheckInfo } from "../TestResult.js"
import { TestReporterChild, TestReporterParent } from "./TestReporter.js"


//---------------------------------------------------------------------------------------------------------------------
interface TestLauncher {
    launchTest (testDescriptorStr : string, checkInfo : SubTestCheckInfo) : Promise<any>
}

//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherParent extends Mixin(
    [ TestReporterParent, PortEvaluateParent, PortHandshakeParent, Base ],
    (base : ClassUnion<typeof TestReporterParent, typeof PortEvaluateParent, typeof PortHandshakeParent, typeof Base>) =>

    class TestLauncherParent extends base implements TestLauncher {
        @remote()
        launchTest : (testDescriptorStr : string, checkInfo : SubTestCheckInfo) => Promise<any>
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherChild extends Mixin(
    [ TestReporterChild, PortEvaluateChild, PortHandshakeChild, Base ],
    (base : ClassUnion<typeof TestReporterChild, typeof PortEvaluateChild, typeof PortHandshakeChild, typeof Base>) =>

    class TestLauncherChild extends base implements TestLauncher {

        @local()
        async launchTest (testDescriptorStr : string, checkInfo : SubTestCheckInfo) {
            // there might be no `topTest` if test file does not contain any calls
            // to static `it` method of any test class
            const topTest = globalTestEnv.topTest || Test.new({
                descriptor      : parse(testDescriptorStr)
            })

            topTest.reporter    = this

            await topTest.start(checkInfo)

            globalTestEnv.clear()
        }
    }
) {}
