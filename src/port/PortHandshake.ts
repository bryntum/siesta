import { ClassUnion, Mixin } from "../class/Mixin.js"
import { Port, local, remote } from "./Port.js"


//---------------------------------------------------------------------------------------------------------------------
interface PortHandshake {
    childConnected ()
}


//---------------------------------------------------------------------------------------------------------------------
export class PortHandshakeParent extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) => {

        class PortHandshakeParent extends base implements PortHandshake {
            childConnectedResolve : Function        = undefined


            // TODO should have a timeout for how long to wait for child connection
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

        return PortHandshakeParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class PortHandshakeChild extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) => {

        class PortHandshakeChild extends base implements PortHandshake {
            @remote()
            childConnected : () => Promise<any>


            async connect () : Promise<any> {
                await super.connect()

                await this.childConnected()
            }
        }

        return PortHandshakeChild
    }
) {}

