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

    mouseUp (options? : Partial<PointerUpDownOptions>) : Promise<any>

    mouseDown (options? : Partial<PointerUpDownOptions>) : Promise<any>

    mouseMove (target : Point, options? : PointerMoveOptions) : Promise<any>

    click (target : Point, options? : PointerClickOptions) : Promise<any>

    dblClick (target : Point, options? : PointerClickOptions) : Promise<any>
}


//---------------------------------------------------------------------------------------------------------------------
export interface Simulator extends SimulatorMouse {
}

