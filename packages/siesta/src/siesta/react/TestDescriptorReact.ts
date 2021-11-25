import { ClassUnion, Mixin } from "typescript-mixin-class"
import { serializable } from "typescript-serializable-mixin"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test descriptor class for tests running in the browser environment.
 */
@serializable({ id : 'TestDescriptorReact' })
export class TestDescriptorReact extends Mixin(
    [ TestDescriptorBrowser ],
    (base : ClassUnion<typeof TestDescriptorBrowser>) =>

    class TestDescriptorReact extends base {
    }
){}

