import { ClassUnion, Mixin } from "typescript-mixin-class"
import { serializable } from "typescript-serializable-mixin"
import { ProjectDescriptorBrowser } from "../project/ProjectDescriptorBrowser.js"
import { TestDescriptorReact } from "./TestDescriptorReact.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'ProjectDescriptorReact', mode : 'optIn' })
export class ProjectDescriptorReact extends Mixin(
    [ ProjectDescriptorBrowser ],
    (base : ClassUnion<typeof ProjectDescriptorBrowser>) =>

    class ProjectDescriptorReact extends base {
        testDescriptor      : Partial<TestDescriptorReact>
    }
) {}
