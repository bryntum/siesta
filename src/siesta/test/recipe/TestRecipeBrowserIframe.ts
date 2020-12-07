import { ChannelBrowserMessagePort } from "../../../channel/ChannelBrowserMessagePort.js"
import { ChannelSerializableJSON } from "../../../channel/ChannelSerializable.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TestLauncherChild, TestLauncherParent } from "../channel/TestLauncher.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestRecipeBrowserIframeParent extends Mixin(
    [
        ChannelBrowserMessagePort,
        ChannelSerializableJSON,
        TestLauncherParent
    ],
    (base : ClassUnion<
        typeof ChannelBrowserMessagePort,
        typeof ChannelSerializableJSON,
        typeof TestLauncherParent
    >) => {

        class TestRecipeBrowserIframeParent extends base {
        }

        return TestRecipeBrowserIframeParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestRecipeBrowserIframeChild extends Mixin(
    [
        ChannelBrowserMessagePort,
        ChannelSerializableJSON,
        TestLauncherChild
    ],
    (base : ClassUnion<
        typeof ChannelBrowserMessagePort,
        typeof ChannelSerializableJSON,
        typeof TestLauncherChild
    >) => {

        class TestRecipeBrowserIframeChild extends base {
        }

        return TestRecipeBrowserIframeChild
    }
) {}

