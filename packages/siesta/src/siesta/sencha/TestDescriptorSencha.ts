import { ClassUnion, Mixin } from "typescript-mixin-class"
import { serializable } from "typescript-serializable-mixin"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test descriptor class for tests running in the browser environment.
 */
@serializable({ id : 'TestDescriptorSencha' })
export class TestDescriptorSencha extends Mixin(
    [ TestDescriptorBrowser ],
    (base : ClassUnion<typeof TestDescriptorBrowser>) =>

    class TestDescriptorSencha extends base {
    }
){}

