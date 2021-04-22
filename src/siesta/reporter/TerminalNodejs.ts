import * as readline from "readline"
import { hideCursor, showCursor } from "../../util_nodejs/Terminal.js"
import { Terminal } from "./Terminal.js"


//---------------------------------------------------------------------------------------------------------------------
export class TerminalNodejs extends Terminal {

    getMaxLen () : number {
        return process.stdout.columns ?? Number.MAX_SAFE_INTEGER
    }


    showCursor () {
        process.stdout.write(showCursor)
    }

    hideCursor () {
        process.stdout.write(hideCursor)
    }


    moveCursor (dx : number, dy : number) {
        readline.moveCursor(process.stdout, dx, dy, () => {})
    }


    clearLine (dir : 'left' | 'right' | 'line') {
        readline.clearLine(process.stdout, dir === 'left' ? -1 : dir === 'right' ? 1 : 0, () => {})
    }
}
