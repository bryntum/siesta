import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { ProjectBrowser } from "../project/ProjectBrowser.js"
import { ProjectDescriptorReact } from "./ProjectDescriptorReact.js"
import { TestDescriptorReact } from "./TestDescriptorReact.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Siesta project for React code.
 */
export class ProjectReact extends Mixin(
    [ ProjectBrowser, ProjectDescriptorReact ],
    (base : ClassUnion<typeof ProjectBrowser, typeof ProjectDescriptorReact>) =>

    class ProjectReact extends base {
        testDescriptorClass     : typeof TestDescriptorReact  = TestDescriptorReact
    }
) {}
