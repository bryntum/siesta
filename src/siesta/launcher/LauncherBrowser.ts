import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ProjectDescriptorBrowser } from "../project/ProjectDescriptor.js"
import { ReporterBrowser } from "../reporter/ReporterBrowser.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { Launcher } from "./Launcher.js"


//---------------------------------------------------------------------------------------------------------------------
export class LauncherBrowser extends Mixin(
    [ Launcher ],
    (base : ClassUnion<typeof Launcher>) =>

    class LauncherBrowser extends base {

        reporterClass   : typeof ReporterBrowser            = ReporterBrowser

        projectDescriptorClass : typeof ProjectDescriptorBrowser  = ProjectDescriptorBrowser
        testDescriptorClass : typeof TestDescriptorBrowser  = TestDescriptorBrowser


        print (str : string) {
            console.log(str)
        }
    }
) {}
