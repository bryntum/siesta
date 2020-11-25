import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Channel, local, remote } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelHandshakeParent extends Mixin(
    [ Channel ],
    (base : ClassUnion<typeof Channel>) => {

        class ChannelHandshakeParent extends base {
            childConnectedResolve : Function        = undefined


            // TODO should have a timeout how long to wait for child connection
            async connect () : Promise<any> {
                this.childConnectedResolve      = undefined

                await super.connect()

                await new Promise((resolve, reject) => {
                    this.childConnectedResolve  = resolve
                })
            }


            @local()
            childConnected () {
                this.childConnectedResolve()
            }
        }

        return ChannelHandshakeParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ChannelHandshakeChild extends Mixin(
    [ Channel ],
    (base : ClassUnion<typeof Channel>) => {

        class ChannelHandshakeChild extends base {
            @remote()
            childConnected : () => Promise<any>


            async connect () : Promise<any> {
                await super.connect()

                await this.childConnected()
            }
        }

        return ChannelHandshakeChild
    }
) {}

