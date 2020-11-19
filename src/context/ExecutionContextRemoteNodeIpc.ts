import { local, remote } from "../channel/Channel.js"
import { ChannelNodeIpcChild, ChannelNodeIpcParent } from "../channel/ChannelNodeIpc.js"
import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ExecutionContextRemote, ExecutionContextRemoteChild } from "./ExecutionContextRemote.js"

//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextRemoteNodeIpc extends Mixin(
    [ ExecutionContextRemote, ChannelNodeIpcParent, Base ],
    (base : ClassUnion<typeof ExecutionContextRemote, typeof ChannelNodeIpcParent, typeof Base>) => {

        class ExecutionContextRemoteNodeIpc extends base {
            childConnectedResolve : Function        = undefined


            async connect () : Promise<any> {
                this.childConnectedResolve      = undefined

                await super.connect()

                await new Promise((resolve, reject) => {
                    this.childConnectedResolve  = resolve
                })
            }


            @local()
            childIsReady () {
                this.childConnectedResolve()
            }
        }

        return ExecutionContextRemoteNodeIpc
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextRemoteNodeIpcChild extends Mixin(
    [ ExecutionContextRemoteChild, ChannelNodeIpcChild, Base ],
    (base : ClassUnion<typeof ExecutionContextRemoteChild, typeof ChannelNodeIpcChild, typeof Base>) => {

        class ExecutionContextRemoteNodeIpcChild extends base {
            @remote()
            childIsReady : () => Promise<any>


            async connect () : Promise<any> {
                await super.connect()

                await this.childIsReady()
            }
        }

        return ExecutionContextRemoteNodeIpcChild
    }
) {}

