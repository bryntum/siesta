import { ClassUnion, Mixin } from "typescript-mixin-class"
import { serializable } from "typescript-serializable-mixin"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { ProjectDescriptor } from "./ProjectDescriptor.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ProjectDescriptorBrowser has to reside in its own file to not mix the browser/non-browser
// compilation sets (required for declaration files support)
@serializable({ id : 'ProjectDescriptorBrowser', mode : 'optIn' })
export class ProjectDescriptorBrowser extends Mixin(
    [ ProjectDescriptor ],
    (base : ClassUnion<typeof ProjectDescriptor>) =>

    class ProjectDescriptorBrowser extends base {
        testDescriptor      : Partial<TestDescriptorBrowser>
    }
) {}
