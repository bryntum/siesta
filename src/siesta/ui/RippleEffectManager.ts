import { Base, ClassUnion, Mixin } from "../../class/Mixin.js"
import { awaitDomInteractive } from "../../util/Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export class RippleEffectManager extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class RippleEffectManager extends base {

        listenerDown    : (e : PointerEvent) => void        = undefined
        listenerUp      : (e : PointerEvent) => void        = undefined

        // TODO handle several touches?
        lastRippledEl   : HTMLElement                       = undefined


        async start () {
            await awaitDomInteractive()

            const listenerDown  = this.listenerDown = e => this.onPointerDown(e)
            const listenerUp    = this.listenerUp   = e => this.onPointerUp(e)

            document.addEventListener('pointerdown', listenerDown)
            document.addEventListener('pointerup', listenerUp, true)
        }


        stop () {
            document.removeEventListener('pointerdown', this.listenerDown)
            document.removeEventListener('pointerup', this.listenerUp, true)
        }


        onPointerUp (e : PointerEvent) {
            const el                = this.lastRippledEl
            const style             = el.style

            style.setProperty('--r-opacity', '0')
        }


        onPointerDown (e : PointerEvent) {
            const el : HTMLElement = (e.target as Element).closest('.ripple')

            if (el) {
                this.lastRippledEl  = el

                const rect      = el.getBoundingClientRect()
                const maxSide   = Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2
                const style     = el.style

                // TODO it theory should be possible to to set the ripple background automatically,
                // based on the background color of the element
                // needs more attention though, in a quick experiment bgColor is returned as `rbga(0, 0, 0, 0)`

                // const [ red, green, blue, opacity ] = parseRgbaColor(getComputedStyle(el).backgroundColor)
                // const brightness    = getColorPerceivedBrightness(red, green, blue)
                // style.setProperty(
                //     '--ripple-background',
                //     brightness > 127.5
                //         // light
                //         ? 'rgba(0, 0, 0, 0.7)'
                //         // dark
                //         : 'rgba(255, 255, 255, 0.7)'
                // )

                // position the ripple el correctly, but hide it
                style.setProperty('--r-scale', '0')
                style.setProperty('--r-duration', '0')
                style.setProperty('--r-opacity', '1')
                style.setProperty('--r-size', String(maxSide))
                style.setProperty('--r-left', String(e.clientX - rect.left))
                style.setProperty('--r-top', String(e.clientY - rect.top))

                // flush the style changes
                el.offsetTop

                // trigger the animation
                style.setProperty('--r-scale', '1')
                style.setProperty('--r-duration', '1')
                style.setProperty('--r-opacity', '0.5')
            }
        }
    }
) {}

// based on: https://awik.io/determine-color-bright-dark-using-javascript/
// which is in turn based on: http://alienryderflex.com/hsp.html
// alternative: https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
export const getColorPerceivedBrightness = (red : number, green : number, blue : number) : number =>
    Math.sqrt(0.299 * red * red + 0.587 * green * green + 0.114 * blue * blue)


export const parseRgbaColor = (color : string) : [ number, number, number, number ] | undefined => {
    const match     = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/.exec(color)

    return match
        ? [ Number(match[ 1 ]), Number(match[ 2 ]), Number(match[ 3 ]), Number(match[ 4 ]) ]
        : undefined
}
