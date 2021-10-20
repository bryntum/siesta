import { SiestaModifierKey } from "./SimulatorKeyboard.js"
import { MouseButton, Point } from "./Types.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Union type, that describes the precision of the pointer movement. It defines how many `mousemove/pointermove` events
 * will be fired for the mouse move actions. This also includes moving cursor the target point for other actions,
 * like [[TestBrowser.click]] and similar.
 *
 * The `kind` options are:
 *
 * - `fixed` - The fixed amount of `mousemove` events will be fired, divided equally along the path.
 * For example, if `precision` is 3, 3 mouse move events will be fired - 1 at the beginning, 1 at the middle and 1
 * at the end of the path.
 * - `every_nth` - Simulate a `mousemove` event every N-th point along the path.
 * For example, if `precision` is 3 and the path is 10 pixels long, `mousemove` events will be simulated
 * for 1st, 4th, 7th and 10th pixels. `mousemove` is always simulated for the last point.
 * - `first_and_last` - Simulate a `mousemove` event for the `precision` number of points in the beginning and the end
 * of path. For example, if `precision` is 2 and the path is 10 pixels long, `mousemove` events will be simulated
 * for 1st, 2nd, 9th and 10th pixels.
 * - `last_only` - Simulate a `mousemove` event for the `precision` number of points at the end
 * of path. For example, if `precision` is 2 and the path is 10 pixels long, `mousemove` events will be simulated
 * for 9th and 10th pixels.
 *
 * The special case of `number` is equivalent to `every_nth` kind.
 *
 * Having precise control over the `mousemove` simulation might be important for certain drag and drop implementations,
 * which relies on at least 2 `mousemove` events fired on the drop target.
 */
export type PointerMovePrecision      =
    | number
    | {
        /**
         * include
         */
        kind            : 'fixed'
        /**
         * include
         */
        precision       : number
    }
    | {
        /**
         * include
         */
        kind            : 'every_nth'
        /**
         * include
         */
        precision       : number
    }
    | {
        /**
         * include
         */
        kind            : 'first_and_last'
        /**
         * include
         */
        precision       : number
    }
    | {
        /**
         * include
         */
        kind            : 'last_only'
        /**
         * include
         */
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
