import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ProjectBrowser } from "../project/ProjectBrowser.js"
import { ProjectDescriptorSencha } from "./ProjectDescriptorSencha.js"
import { TestDescriptorSencha } from "./TestDescriptorSencha.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Siesta project for Sencha code.
 */
export class ProjectSencha extends Mixin(
    [ ProjectBrowser, ProjectDescriptorSencha ],
    (base : ClassUnion<typeof ProjectBrowser, typeof ProjectDescriptorSencha>) =>

    class ProjectSencha extends base {
        testDescriptorClass     : typeof TestDescriptorSencha  = TestDescriptorSencha
    }
) {}
