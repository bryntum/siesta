import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { EnvironmentType } from "../common/Environment.js"
import { LauncherDeno } from "../launcher/LauncherDeno.js"
import { Runtime } from "../runtime/Runtime.js"
import { RuntimeDeno } from "../runtime/RuntimeDeno.js"
import { TestDescriptorDeno } from "../test/TestDescriptorDeno.js"
import { Project } from "./Project.js"
import { ProjectDescriptorDeno } from "./ProjectDescriptor.js"
import { ProjectTerminal } from "./ProjectTerminal.js"

//---------------------------------------------------------------------------------------------------------------------
declare const Deno

//---------------------------------------------------------------------------------------------------------------------
/**
 * Siesta project for [Deno](https://deno.land/) code.
 */
export class ProjectDeno extends Mixin(
    [ Project, ProjectDescriptorDeno, ProjectTerminal ],
    (base : ClassUnion<typeof Project, typeof ProjectDescriptorDeno, typeof ProjectTerminal>) =>

    class ProjectDeno extends base {
        type                    : EnvironmentType                   = 'deno'

        launcherClass           : typeof LauncherDeno               = LauncherDeno
        testDescriptorClass     : typeof TestDescriptorDeno         = TestDescriptorDeno
        runtimeClass            : typeof Runtime                    = RuntimeDeno
    }
) {}
