import { Base } from "../../class/Base.js"
import { randomElement } from "../../util/Helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Spinner extends Base {
    interval        : number        = 200

    frames          : string[]      = []

    currentFrameIndex   : number    = 0


    get frame () : string {
        return this.frames[ this.currentFrameIndex ]
    }


    tick () {
        this.currentFrameIndex++

        if (this.currentFrameIndex >= this.frames.length) this.currentFrameIndex = 0
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const clockSpinner = Spinner.new({
    frames  : [
        "🕛", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚"
    ]
})

export const arrowSpinner = Spinner.new({
    frames  : [
        "←", "↖", "↑", "↗", "→", "↘", "↓", "↙"
    ]
})

export const barSpinner = Spinner.new({
    frames  : [
        '▉', '▊', '▋', '▌', '▍', '▎', '▏', '▎', '▍', '▌', '▋', '▊', '▉'
    ]
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const spinners   = [ clockSpinner, arrowSpinner, barSpinner ]

export const randomSpinner = () => randomElement(spinners)
