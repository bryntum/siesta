import { SiestaModifierKey } from "./SimulatorKeyboard.js"
import { MouseButton, Point } from "./Types.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type PointerMovePrecision      =
    | number
    | {
        // fixed number of steps, divided equally along the path
        kind            : 'fixed'
        precision       : number
    }
    | {
        // simulate a move event every N-th point along the path
        kind            : 'every_nth'
        precision       : number
    }
    | {
        // simulate a move event for the specified number of points in the beginning of the path and at the end
        kind            : 'first_and_last'
        precision       : number
    }
    | {
        // simulate a move event for the specified number of points at the end of the path
        kind            : 'last_only'
        precision       : number
    }


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type PointerUpDownOptions    = {
    button?             : MouseButton
    modifierKeys?       : SiestaModifierKey[]
}

export type PointerClickOptions    = {
    button?             : MouseButton
    modifierKeys?       : SiestaModifierKey[]
}

export type PointerMoveOptions      = {
    modifierKeys?       : SiestaModifierKey[]
    mouseMovePrecision? : PointerMovePrecision
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface SimulatorMouse {
    currentPosition     : Point

    simulateMouseUp (options? : Partial<PointerUpDownOptions>) : Promise<any>

    simulateMouseDown (options? : Partial<PointerUpDownOptions>) : Promise<any>

    simulateMouseMove (target : Point, options? : PointerMoveOptions) : Promise<any>

    simulateClick (options? : PointerClickOptions) : Promise<any>

    simulateDblClick (options? : PointerClickOptions) : Promise<any>
}
