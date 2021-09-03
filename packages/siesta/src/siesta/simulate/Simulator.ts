import { MouseButton, Point } from "./Types.js"


//---------------------------------------------------------------------------------------------------------------------
export type PointerUpDownOptions    = {
    button?     : MouseButton
    clickCount? : number
}

export type PointerClickOptions    = {
    button?     : MouseButton
    clickCount? : number
    delay?      : number
}


export type PointerMovePrecision      =
    | {
        kind            : 'fixed'
        precision       : number
    }
    | {
        kind            : 'every_nth'
        precision       : number
    }
    | {
        kind            : 'first_and_last'
    }
    | {
        kind            : 'last_only'
    }



export type PointerMoveOptions      = {
    precision       : PointerMovePrecision
}


//---------------------------------------------------------------------------------------------------------------------
interface SimulatorMouse {
    currentPosition     : Point

    simulateMouseUp (options? : Partial<PointerUpDownOptions>) : Promise<any>

    simulateMouseDown (options? : Partial<PointerUpDownOptions>) : Promise<any>

    simulateMouseMove (target : Point, options? : PointerMoveOptions) : Promise<any>

    simulateClick (target : Point, options? : PointerClickOptions) : Promise<any>

    simulateDblClick (target : Point, options? : PointerClickOptions) : Promise<any>
}


//---------------------------------------------------------------------------------------------------------------------
export interface Simulator extends SimulatorMouse {
}

