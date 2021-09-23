import { Page } from "playwright"
import { AnyFunction, Base, ClassUnion, Mixin } from "typescript-mixin-class/index.js"
import { local, remote, remote_wrapped } from "../../rpc/port/Port.js"
import { PortHandshakeChild, PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { filterPathAccordingToPrecision, getPathBetweenPoints } from "../../util_browser/Coordinates.js"
import { extractKeysAndSpecialKeys, SiestaModifierKey, SiestaTypeString, TypeOptions } from "./SimulatorKeyboard.js"
import {
    PointerClickOptions,
    PointerMoveOptions,
    PointerUpDownOptions,
} from "./SimulatorMouse.js"
import { Point, Simulator, sumPoints } from "./Types.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SimulatorPlaywrightServer extends Mixin(
    [ PortHandshakeParent, Base ],
    (base : ClassUnion<typeof PortHandshakeParent, typeof Base>) =>

    class SimulatorPlaywrightServer extends base implements Simulator {
        page                : Page      = undefined

        //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        currentPosition     : Point     = [ 0, 0 ]


        // wrapper for `mouse.move` which tracks cursor position
        async pageMouseMove (x : number, y : number, options? : { steps? : number }) : Promise<void> {
            await this.page.mouse.move(x, y, options)

            this.currentPosition[ 0 ] = x
            this.currentPosition[ 1 ] = y
        }


        async setModifierKeys (modifierKeys : SiestaModifierKey[], state : 'up' | 'down') {
            for (const key of modifierKeys)
                await this.page.keyboard[ state ](siestaKeyToSimulatorKey(key))
        }


        async doWithModifierKeys (action : AnyFunction, modifierKeys : SiestaModifierKey[] = []) : Promise<any> {
            await this.setModifierKeys(modifierKeys, 'down')

            await action()

            await this.setModifierKeys(modifierKeys, 'up')
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
            target : Point, options : PointerMoveOptions = { mouseMovePrecision : { kind : 'every_nth', precision : 30 } }
        ) : Promise<any> {
            const filtered  = filterPathAccordingToPrecision(
                getPathBetweenPoints(this.currentPosition, target),
                options.mouseMovePrecision
            )

            for (const point of filtered) await this.pageMouseMove(point[ 0 ], point[ 1 ])
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


        //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        getSingleKeyToPress (key : SiestaTypeString) : string {
            const tokens        = extractKeysAndSpecialKeys(key)

            if (tokens.length > 1 || tokens.length === 0) throw new Error("Should provide a single key")

            return siestaKeyToSimulatorKey(tokens[ 0 ])
        }


        @local()
        async simulateKeyPress (key : SiestaTypeString, options? : TypeOptions) : Promise<any> {
            const keyboard      = this.page.keyboard

            await this.doWithModifierKeys(async () => {
                await keyboard.press(this.getSingleKeyToPress(key), { delay : options?.delay })
            }, options?.modifierKeys)
        }


        @local()
        async simulateKeyDown (key : SiestaTypeString) : Promise<any> {
            const keyboard      = this.page.keyboard

            await keyboard.down(this.getSingleKeyToPress(key))
        }


        @local()
        async simulateKeyUp (key : SiestaTypeString) : Promise<any> {
            const keyboard      = this.page.keyboard

            await keyboard.up(this.getSingleKeyToPress(key))
        }


        @local()
        async simulateType (text : SiestaTypeString, options? : TypeOptions) : Promise<any> {
            const keyboard      = this.page.keyboard
            const tokens        = extractKeysAndSpecialKeys(text)

            await this.doWithModifierKeys(async () => {
                for (const token of tokens)
                    await keyboard.press(siestaKeyToSimulatorKey(token), { delay : options?.delay })
            }, options?.modifierKeys)
        }
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class SimulatorPlaywrightClient extends Mixin(
    [ PortHandshakeChild, Base ],
    (base : ClassUnion<typeof PortHandshakeChild, typeof Base>) =>

    class SimulatorPlaywrightClient extends base implements Simulator {
        //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

        //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        @remote()
        simulateKeyPress : (key : string, options? : TypeOptions) => Promise<any>

        @remote()
        simulateKeyDown : (key : string) => Promise<any>

        @remote()
        simulateKeyUp : (key : string) => Promise<any>

        @remote()
        simulateType : (text : string, options? : TypeOptions) => Promise<any>
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const siestaToPuppeteerKeys : Record<SiestaTypeString, string> = {
    'BACKSPACE'     : 'Backspace',

    'TAB'           : 'Tab',

    'RETURN'        : 'Enter',
    'ENTER'         : 'Enter',

    //special
    'SHIFT'         : 'Shift',
    'CTRL'          : 'Control',
    'ALT'           : 'Alt',
    'CMD'           : 'Meta', // Mac
    'META'          : 'Meta', // Mac

    // //weird
    'PAUSE-BREAK'   : 'Pause',
    'CAPS'          : 'CapsLock',

    'ESCAPE'        : 'Escape',
    'ESC'           : 'Escape',
    'NUM-LOCK'      : 'NumLock',
    'SCROLL-LOCK'   : 'ScrollLock',
    'PRINT'         : 'Print',

    //navigation
    'PAGE-UP'       : 'PageUp',
    'PAGE-DOWN'     : 'PageDown',
    'END'           : 'End',
    'HOME'          : 'Home',
    'LEFT'          : 'ArrowLeft',
    'ARROWLEFT'     : 'ArrowLeft',
    'UP'            : 'ArrowUp',
    'ARROWUP'       : 'ArrowUp',
    'RIGHT'         : 'ArrowRight',
    'ARROWRIGHT'    : 'ArrowRight',
    'DOWN'          : 'ArrowDown',
    'ARROWDOWN'     : 'ArrowDown',
    'INSERT'        : 'Insert',
    'DELETE'        : 'Delete',

    //NORMAL-CHARACTERS, NUMPAD
    'NUM0'          : 'Numpad0',
    'NUM1'          : 'Numpad1',
    'NUM2'          : 'Numpad2',
    'NUM3'          : 'Numpad3',
    'NUM4'          : 'Numpad4',
    'NUM5'          : 'Numpad5',
    'NUM6'          : 'Numpad6',
    'NUM7'          : 'Numpad7',
    'NUM8'          : 'Numpad8',
    'NUM9'          : 'Numpad9',

    'F1'            : 'F1',
    'F2'            : 'F2',
    'F3'            : 'F3',
    'F4'            : 'F4',
    'F5'            : 'F5',
    'F6'            : 'F6',
    'F7'            : 'F7',
    'F8'            : 'F8',
    'F9'            : 'F9',
    'F10'           : 'F10',
    'F11'           : 'F11',
    'F12'           : 'F12'
}


const siestaKeyToSimulatorKey = (key : SiestaTypeString) : string => key.length === 1 ? key : siestaToPuppeteerKeys[ key ]
