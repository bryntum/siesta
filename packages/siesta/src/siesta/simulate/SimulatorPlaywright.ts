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
        async mouseUp (options? : Partial<PointerUpDownOptions>) : Promise<any> {
            await this.page.mouse.up(options)
        }


        @local()
        async mouseDown (options? : Partial<PointerUpDownOptions>) : Promise<any> {
            await this.page.mouse.down(options)
        }


        @local()
        async mouseMove (target : Point, options? : PointerMoveOptions) : Promise<any> {
            await this.page.mouse.move(target[ 0 ], target[ 1 ], { steps : 10 })
        }


        @local()
        async click (target : Point, options? : PointerClickOptions) : Promise<any> {
            console.log("CLICKING", target)

            await this.page.mouse.click(target[ 0 ], target[ 1 ], options)
        }


        @local()
        async dblClick (target : Point, options? : PointerClickOptions) : Promise<any> {
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
        mouseUp : (options? : Partial<PointerUpDownOptions>) => Promise<any>

        @remote()
        mouseDown : (options? : Partial<PointerUpDownOptions>) => Promise<any>

        @remote()
        mouseMove : (target : Point, options? : PointerMoveOptions) => Promise<any>

        @remote()
        click : (target : Point, options? : PointerClickOptions) => Promise<any>

        @remote()
        dblClick : (target : Point, options? : PointerClickOptions) => Promise<any>
    }
) {}
