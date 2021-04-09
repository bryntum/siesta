import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { timeout } from "../../util/Helpers.js"
import { Port, local, remote } from "./Port.js"

//---------------------------------------------------------------------------------------------------------------------
export type HandshakeType   = 'child_first' | 'parent_first'

//---------------------------------------------------------------------------------------------------------------------
interface PortHandshake {
    childConnectionId   : number
    parentConnectionId  : number

    handshakeTimeout    : number

    handshakeType       : HandshakeType

    handShakeFromChild (childConnectionId : number) : Promise<number>
    handShakeFromParent (parentConnectionId : number) : Promise<number>
}


//---------------------------------------------------------------------------------------------------------------------
export class PortHandshakeParent extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) => {

        class PortHandshakeParent extends base implements PortHandshake {
            handshakeType           : HandshakeType = 'parent_first'
            handshakeTimeout        : number        = 60000

            parentConnectionId      : number        = 0
            childConnectionId       : number        = 0

            onChildConnected        : Function      = undefined

            @remote()
            handShakeFromParent : (parentConnectionId : number) => Promise<number>


            async connect () : Promise<any> {
                await super.connect()

                if (this.handshakeType === 'child_first')
                    await timeout(new Promise(resolve => this.onChildConnected = resolve), this.handshakeTimeout, "Handshake timeout")
                else
                    await this.handShakeFromParent(this.parentConnectionId)
            }


            @local()
            async handShakeFromChild (childConnectionId : number) : Promise<number> {
                this.childConnectionId  = childConnectionId
                this.onChildConnected()

                return this.parentConnectionId
            }
        }

        return PortHandshakeParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class PortHandshakeChild extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) => {

        class PortHandshakeChild extends base implements PortHandshake {
            handshakeType           : HandshakeType = 'parent_first'
            handshakeTimeout        : number        = 60000

            parentConnectionId      : number        = 0
            childConnectionId       : number        = 0

            onParentConnected       : Function      = undefined

            @remote()
            handShakeFromChild : (childConnectionId : number) => Promise<any>


            async connect () : Promise<any> {
                await super.connect()

                if (this.handshakeType === 'child_first')
                    await this.handShakeFromChild(this.childConnectionId)
                else
                    await timeout(new Promise(resolve => this.onParentConnected = resolve), this.handshakeTimeout, "Handshake timeout")
            }


            @local()
            async handShakeFromParent (parentConnectionId : number) : Promise<number> {
                this.parentConnectionId  = parentConnectionId
                this.onParentConnected()

                return this.childConnectionId
            }
        }

        return PortHandshakeChild
    }
) {}

