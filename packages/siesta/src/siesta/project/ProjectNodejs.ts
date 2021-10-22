import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { EnvironmentType } from "../common/Environment.js"
import { Runtime } from "../runtime/Runtime.js"
import { RuntimeNodejs } from "../runtime/RuntimeNodejs.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { Project } from "./Project.js"
import { ProjectDescriptorNodejs } from "./ProjectDescriptor.js"
import { ProjectTerminal } from "./ProjectTerminal.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Siesta project for [Node.js](https://nodejs.org/) code.
 */
export class ProjectNodejs extends Mixin(
    [ Project, ProjectDescriptorNodejs, ProjectTerminal ],
    (base : ClassUnion<typeof Project, typeof ProjectDescriptorNodejs, typeof ProjectTerminal>) =>

    class ProjectNodejs extends base {
        type                    : EnvironmentType               = 'nodejs'

        testDescriptorClass     : typeof TestDescriptorNodejs   = TestDescriptorNodejs
        runtimeClass            : typeof Runtime                = RuntimeNodejs
    }
) {}
