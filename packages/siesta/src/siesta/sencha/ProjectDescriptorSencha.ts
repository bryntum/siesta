import { ClassUnion, Mixin } from "typescript-mixin-class"
import { serializable } from "typescript-serializable-mixin"
import { ProjectDescriptorBrowser } from "../project/ProjectDescriptorBrowser.js"
import { TestDescriptorSencha } from "./TestDescriptorSencha.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'ProjectDescriptorSencha', mode : 'optIn' })
export class ProjectDescriptorSencha extends Mixin(
    [ ProjectDescriptorBrowser ],
    (base : ClassUnion<typeof ProjectDescriptorBrowser>) =>

    class ProjectDescriptorSencha extends base {
        testDescriptor      : Partial<TestDescriptorSencha>
    }
) {}
