import readline from "readline"
import { hideCursor, showCursor } from "../../util_nodejs/Terminal.js"
import { Terminal } from "./Terminal.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TerminalNodejs extends Terminal {

    getMaxLen () : number {
        return process.stdout.columns ?? Number.MAX_SAFE_INTEGER
    }


    showCursor () {
        this.launcher.performPrint(() => process.stdout.write(showCursor))
    }

    hideCursor () {
        this.launcher.performPrint(() => process.stdout.write(hideCursor))
    }


    moveCursor (dx : number, dy : number) {
        this.launcher.performPrint(() => readline.moveCursor(process.stdout, dx, dy, () => {}))
    }


    clearLine (dir : 'left' | 'right' | 'line') {
        this.launcher.performPrint(() => readline.clearLine(process.stdout, dir === 'left' ? -1 : dir === 'right' ? 1 : 0, () => {}))
    }
}
