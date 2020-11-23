import { ChannelNodeIpcChild, ChannelNodeIpcParent } from "../../../channel/ChannelNodeIpc.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { ExecutionContextRemoteNodeIpc, ExecutionContextRemoteNodeIpcChild } from "../../../context/ExecutionContextRemoteNodeIpc.js"
import { TestLaunchLauncherSide, TestLaunchTestSide } from "../Launcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextNodeIpc extends Mixin(
    [
        ExecutionContextRemoteNodeIpc,
        ChannelNodeIpcParent,
        TestLaunchLauncherSide
    ],
    (base : ClassUnion<
        typeof ExecutionContextRemoteNodeIpc,
        typeof ChannelNodeIpcParent,
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
        ChannelNodeIpcChild,
        TestLaunchTestSide
    ],
    (base : ClassUnion<
        typeof ExecutionContextRemoteNodeIpcChild,
        typeof ChannelNodeIpcChild,
        typeof TestLaunchTestSide>
    ) => {

        class TestContextNodeIpcChild extends base {
        }

        return TestContextNodeIpcChild
    }
) {}

