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

        /**
         * Setting this configuration option to `true` will cause Siesta to wait until the SenchaCmd application on the test page will become ready,
         * before starting the test. More precisely, it will wait till the `launched` property of the application, specified
         * in the `Ext.manifest.name` becomes `true`.
         *
         * Defaults to: `false`
         */
        @config()
        @prototypeValue(false)
        waitForAppReady     : boolean
    }
){}

