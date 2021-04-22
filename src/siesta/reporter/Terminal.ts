import { Base } from "../../class/Base.js"

//---------------------------------------------------------------------------------------------------------------------
export class Terminal extends Base {

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
