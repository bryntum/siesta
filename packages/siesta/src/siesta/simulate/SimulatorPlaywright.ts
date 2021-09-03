import { Page } from "playwright"
import { AnyConstructor, Base, ClassUnion, Mixin } from "typescript-mixin-class/index.js"
import { local, remote } from "../../rpc/port/Port.js"
import { PortHandshakeChild, PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { PointerClickOptions, PointerMoveOptions, PointerUpDownOptions, Simulator } from "./Simulator.js"
import { MouseButton, Point } from "./Types.js"


//---------------------------------------------------------------------------------------------------------------------
export class SimulatorPlaywrightServer extends Mixin(
    [ PortHandshakeParent, Base ],
    (base : ClassUnion<typeof PortHandshakeParent, typeof Base>) =>

    class SimulatorPlaywrightServer extends base implements Simulator {
        page                : Page      = undefined

        currentPosition     : Point     = [ 0, 0 ]

        offset              : Point     = [ 0, 0 ]


        @local()
        async simulateMouseUp (options? : Partial<PointerUpDownOptions>) : Promise<any> {
            await this.page.mouse.up(options)
        }


        @local()
        async simulateMouseDown (options? : Partial<PointerUpDownOptions>) : Promise<any> {
            await this.page.mouse.down(options)
        }


        @local()
        async simulateMouseMove (target : Point, options? : PointerMoveOptions) : Promise<any> {
            await this.page.mouse.move(target[ 0 ], target[ 1 ], { steps : 10 })
        }


        @local()
        async simulateClick (target : Point, options? : PointerClickOptions) : Promise<any> {
            console.log("CLICKING", target)

            await this.page.mouse.click(target[ 0 ], target[ 1 ], options)
        }


        @local()
        async simulateDblClick (target : Point, options? : PointerClickOptions) : Promise<any> {
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class SimulatorPlaywrightClient extends Mixin(
    [ PortHandshakeChild, Base ],
    (base : ClassUnion<typeof PortHandshakeChild, typeof Base>) =>

    class SimulatorPlaywrightClient extends base implements Simulator {
        offset              : Point     = [ 0, 0 ]

        currentPosition     : Point     = [ 0, 0 ]


        @remote()
        simulateMouseUp : (options? : Partial<PointerUpDownOptions>) => Promise<any>

        @remote()
        simulateMouseDown : (options? : Partial<PointerUpDownOptions>) => Promise<any>

        @remote()
        simulateMouseMove : (target : Point, options? : PointerMoveOptions) => Promise<any>

        @remote()
        simulateClick : (target : Point, options? : PointerClickOptions) => Promise<any>

        @remote()
        simulateDblClick : (target : Point, options? : PointerClickOptions) => Promise<any>
    }
) {}
