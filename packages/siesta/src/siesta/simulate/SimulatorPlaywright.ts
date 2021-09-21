import { Page } from "playwright"
import { Base, ClassUnion, Mixin } from "typescript-mixin-class/index.js"
import { local, remote, remote_wrapped } from "../../rpc/port/Port.js"
import { PortHandshakeChild, PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { filterPathAccordingToPrecision, getPathBetweenPoints } from "../../util_browser/Coordinates.js"
import { PointerClickOptions, PointerMoveOptions, PointerUpDownOptions, Simulator } from "./Simulator.js"
import { Point, sumPoints } from "./Types.js"


//---------------------------------------------------------------------------------------------------------------------
export class SimulatorPlaywrightServer extends Mixin(
    [ PortHandshakeParent, Base ],
    (base : ClassUnion<typeof PortHandshakeParent, typeof Base>) =>

    class SimulatorPlaywrightServer extends base implements Simulator {
        page                : Page      = undefined

        currentPosition     : Point     = [ 0, 0 ]


        // wrapper for `mouse.move` which tracks cursor position
        async pageMouseMove (x : number, y : number, options? : { steps? : number }) : Promise<void> {
            await this.page.mouse.move(x, y, options)

            this.currentPosition[ 0 ] = x
            this.currentPosition[ 1 ] = y
        }


        @local()
        async simulateMouseUp (options? : Partial<PointerUpDownOptions>) : Promise<any> {
            await this.page.mouse.up(options)
        }


        @local()
        async simulateMouseDown (options? : Partial<PointerUpDownOptions>) : Promise<any> {
            await this.page.mouse.down(options)
        }


        @local()
        async simulateMouseMove (
            target : Point, options : PointerMoveOptions = { precision : { kind : 'every_nth', precision : 30 } }
        ) : Promise<any> {
            const precision     = options.precision

            const filtered  = filterPathAccordingToPrecision(
                getPathBetweenPoints(this.currentPosition, target),
                precision
            )

            for (const point of filtered) {
                await this.pageMouseMove(point[ 0 ], point[ 1 ])
            }
        }


        @local()
        async simulateClick (options? : PointerClickOptions) : Promise<any> {
            const mouse     = this.page.mouse

            await mouse.down({ button : options?.button ?? 'left', clickCount : 1 })
            await mouse.up({ button : options?.button ?? 'left', clickCount : 1 })
        }


        @local()
        async simulateDblClick (options? : PointerClickOptions) : Promise<any> {
            const mouse     = this.page.mouse

            await mouse.down({ button : options?.button ?? 'left', clickCount : 1 })
            await mouse.up({ button : options?.button ?? 'left', clickCount : 1 })

            await mouse.down({ button : options?.button ?? 'left', clickCount : 2 })
            await mouse.up({ button : options?.button ?? 'left', clickCount : 2 })
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

        @remote_wrapped()
        async simulateMouseMove (target : Point, options? : PointerMoveOptions) : Promise<any> {
            await this.remotes.simulateMouseMove(sumPoints(target, this.offset), options)

            this.currentPosition[ 0 ]   = target[ 0 ]
            this.currentPosition[ 1 ]   = target[ 1 ]
        }

        @remote()
        simulateClick : (options? : PointerClickOptions) => Promise<any>

        @remote()
        simulateDblClick : (options? : PointerClickOptions) => Promise<any>
    }
) {}
