import { ChannelHandshakeChild, ChannelHandshakeParent } from "../channel/ChannelHandshake.js"
import { ChannelNodeIpcChild, ChannelNodeIpcParent } from "../channel/ChannelNodeIpc.js"
import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ExecutionContextRemote, ExecutionContextRemoteChild } from "./ExecutionContextRemote.js"

//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextRemoteNodeIpc extends Mixin(
    [
        ExecutionContextRemote,
        ChannelNodeIpcParent,
        ChannelHandshakeParent,
        Base
    ],
    (base : ClassUnion<
        typeof ExecutionContextRemote,
        typeof ChannelNodeIpcParent,
        typeof ChannelHandshakeParent,
        typeof Base
    >) => {

        class ExecutionContextRemoteNodeIpc extends base {
        }

        return ExecutionContextRemoteNodeIpc
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextRemoteNodeIpcChild extends Mixin(
    [
        ExecutionContextRemoteChild,
        ChannelNodeIpcChild,
        ChannelHandshakeChild,
        Base
    ],
    (base : ClassUnion<
        typeof ExecutionContextRemoteChild,
        typeof ChannelNodeIpcChild,
        typeof ChannelHandshakeChild,
        typeof Base
    >) => {

        class ExecutionContextRemoteNodeIpcChild extends base {
        }

        return ExecutionContextRemoteNodeIpcChild
    }
) {}

