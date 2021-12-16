import { ClassUnion, Mixin } from "typescript-mixin-class"
import { serializable } from "typescript-serializable-mixin"
import { prototypeValue } from "../../util/Helpers.js"
import { config } from "../test/TestDescriptor.js"
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

        /**
         * By default the test will start after `Ext.onReady()`. Set to `false` to launch the test immediately
         * after page load.
         *
         * Defaults to: `true`
         */
        @config()
        @prototypeValue(true)
        waitForExtReady     : boolean
    }
){}

