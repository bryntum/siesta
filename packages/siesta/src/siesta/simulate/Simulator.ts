import { MouseButton, Point } from "./Types.js"


//---------------------------------------------------------------------------------------------------------------------
export type PointerUpDownOptions    = {
    button      : MouseButton
    clickCount  : number
}

export type PointerMoveOptions      = {
    precision       : number | 'two_last_points' | 'last_point'
}


//---------------------------------------------------------------------------------------------------------------------
interface SimulatorMouse {
    currentPosition     : Point

    mouseUp (options? : Partial<PointerUpDownOptions>) : Promise<any>

    mouseDown (options? : Partial<PointerUpDownOptions>) : Promise<any>

    mouseMove (target : Point, options? : PointerMoveOptions) : Promise<any>
}


//---------------------------------------------------------------------------------------------------------------------
export interface Simulator extends SimulatorMouse {
}

