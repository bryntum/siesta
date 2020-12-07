import { ChannelSerializableJSON } from "../../../channel/ChannelSerializable.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { ExecutionContextRemoteNodeIpc, ExecutionContextRemoteNodeIpcChild } from "../../../context/ExecutionContextRemoteNodeIpc.js"
import { TestLauncherChild, TestLauncherParent } from "../channel/TestLauncher.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextBrowserIframe extends Mixin(
    [
        ExecutionContextRemoteNodeIpc,
        ChannelSerializableJSON,
        TestLauncherParent
    ],
    (base : ClassUnion<
        typeof ExecutionContextRemoteNodeIpc,
        typeof ChannelSerializableJSON,
        typeof TestLauncherParent
    >) => {

        class TestContextBrowserIframe extends base {
        }

        return TestContextBrowserIframe
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestContextBrowserIframeChild extends Mixin(
    [
        ExecutionContextRemoteNodeIpcChild,
        ChannelSerializableJSON,
        TestLauncherChild
    ],
    (base : ClassUnion<
        typeof ExecutionContextRemoteNodeIpcChild,
        typeof ChannelSerializableJSON,
        typeof TestLauncherChild
    >) => {

        class TestContextBrowserIframeChild extends base {
        }

        return TestContextBrowserIframeChild
    }
) {}

