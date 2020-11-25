import { ChannelNodeIpcChild, ChannelNodeIpcParent } from "../../../channel/ChannelNodeIpc.js"
import { ChannelSerializableJSON } from "../../../channel/ChannelSerializable.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { ExecutionContextRemoteNodeIpc, ExecutionContextRemoteNodeIpcChild } from "../../../context/ExecutionContextRemoteNodeIpc.js"
import { TestLaunchLauncherSide, TestLaunchTestSide } from "../Launcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextNodeIpc extends Mixin(
    [
        ExecutionContextRemoteNodeIpc,
        ChannelSerializableJSON,
        TestLaunchLauncherSide
    ],
    (base : ClassUnion<
        typeof ExecutionContextRemoteNodeIpc,
        typeof ChannelSerializableJSON,
        typeof TestLaunchLauncherSide
    >) => {

        class TestContextNodeIpc extends base {
        }

        return TestContextNodeIpc
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestContextNodeIpcChild extends Mixin(
    [
        ExecutionContextRemoteNodeIpcChild,
        ChannelSerializableJSON,
        TestLaunchTestSide
    ],
    (base : ClassUnion<
        typeof ExecutionContextRemoteNodeIpcChild,
        typeof ChannelSerializableJSON,
        typeof TestLaunchTestSide>
    ) => {

        class TestContextNodeIpcChild extends base {
        }

        return TestContextNodeIpcChild
    }
) {}

