import { clearLine, clearLeft, clearRight, goDown, goLeft, goRight, goUp, hideCursor, showCursor } from "../../util_nodejs/TerminalDeno.js"
import { Terminal } from "./Terminal.js"


//---------------------------------------------------------------------------------------------------------------------
export class TerminalDeno extends Terminal {

    showCursor () {
        this.launcher.performPrint(() => showCursor())
    }

    hideCursor () {
        this.launcher.performPrint(() => hideCursor())
    }


    moveCursor (dx : number, dy : number) {
        this.launcher.performPrint(() => {
            if (dx > 0)
                goRight(dx)
            else if (dx < 0)
                goLeft(-dx)

            if (dy > 0)
                goDown(dy)
            else if (dy < 0)
                goUp(-dy)
        })
    }


    clearLine (dir : 'left' | 'right' | 'line') {
        this.launcher.performPrint(() => {
            if (dir === 'left')
                clearLeft()
            else if (dir === 'right')
                clearRight()
            else
                clearLine()
        })
    }
}
