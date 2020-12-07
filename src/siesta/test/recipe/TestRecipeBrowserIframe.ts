import { ChannelBrowserMessagePort } from "../../../channel/ChannelBrowserMessagePort.js"
import { ChannelHandshakeChild, ChannelHandshakeParent } from "../../../channel/ChannelHandshake.js"
import { ChannelSerializableJSON } from "../../../channel/ChannelSerializable.js"
import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TestLauncherChild, TestLauncherParent } from "../channel/TestLauncher.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestRecipeBrowserIframeParent extends Mixin(
    [
        ChannelBrowserMessagePort,
        ChannelHandshakeParent,
        ChannelSerializableJSON,
        TestLauncherParent,
        Base
    ],
    (base : ClassUnion<
        typeof ChannelBrowserMessagePort,
        typeof ChannelHandshakeParent,
        typeof ChannelSerializableJSON,
        typeof TestLauncherParent,
        typeof Base
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
        ChannelHandshakeChild,
        ChannelSerializableJSON,
        TestLauncherChild,
        Base
    ],
    (base : ClassUnion<
        typeof ChannelBrowserMessagePort,
        typeof ChannelHandshakeChild,
        typeof ChannelSerializableJSON,
        typeof TestLauncherChild,
        typeof Base
    >) => {

        class TestRecipeBrowserIframeChild extends base {
        }

        return TestRecipeBrowserIframeChild
    }
) {}

