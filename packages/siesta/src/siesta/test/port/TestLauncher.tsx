import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { local, remote } from "../../../rpc/port/Port.js"
import { PortHandshakeChild, PortHandshakeParent } from "../../../rpc/port/PortHandshake.js"
import { parse } from "../../../serializable/Serializable.js"
import { Launcher } from "../../launcher/Launcher.js"
import { globalTestEnv, Test } from "../Test.js"
import { SubTestCheckInfo } from "../TestResult.js"
import { TestReporterChild, TestReporterParent } from "./TestReporter.js"


//---------------------------------------------------------------------------------------------------------------------
interface TestLauncher {
    launchTest (testDescriptorStr : string, checkInfo : SubTestCheckInfo) : Promise<any>
}

//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherParent extends Mixin(
    [ TestReporterParent, PortHandshakeParent, Base ],
    (base : ClassUnion<typeof TestReporterParent, typeof PortHandshakeParent, typeof Base>) =>

    class TestLauncherParent extends base implements TestLauncher {
        launcher        : Launcher          = undefined

        @remote()
        launchTest : (testDescriptorStr : string, checkInfo : SubTestCheckInfo) => Promise<any>
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestLauncherChild extends Mixin(
    [ TestReporterChild, PortHandshakeChild, Base ],
    (base : ClassUnion<typeof TestReporterChild, typeof PortHandshakeChild, typeof Base>) =>

    class TestLauncherChild extends base implements TestLauncher {

        @local()
        async launchTest (testDescriptorStr : string, checkInfo : SubTestCheckInfo) {
            // there might be no `topTest` if test file does not contain any calls
            // to static `it` method of any test class
            const topTest = globalTestEnv.topTest || Test.new({
                descriptor      : parse(testDescriptorStr)
            })

            topTest.connector    = this

            await topTest.start(checkInfo)

            globalTestEnv.clear()
        }
    }
) {}
