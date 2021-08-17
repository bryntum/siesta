import { Base } from "../../class/Base.js"
import { Launcher } from "../launcher/Launcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class Terminal extends Base {

    // TODO probably should be the opposite - Launcher should have reference to Terminal
    // terminal should handle the printing
    launcher        : Launcher          = undefined


    getMaxLen () : number {
        return Number.MAX_SAFE_INTEGER
    }


    showCursor () {
        throw new Error("Abstract method")
    }

    hideCursor () {
        throw new Error("Abstract method")
    }


    moveCursor (dx : number, dy : number) {
        throw new Error("Abstract method")
    }


    clearLine (dir : 'left' | 'right' | 'line') {
        throw new Error("Abstract method")
    }
}
