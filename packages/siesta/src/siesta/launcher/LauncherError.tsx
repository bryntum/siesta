import { Base, ClassUnion, Mixin } from "typescript-mixin-class"
import { Serializable, serializable } from "typescript-serializable-mixin"
import { XmlElement } from "../../jsx/XmlElement.js"
import { ExitCodes } from "./Launcher.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'LauncherError' })
export class LauncherError extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) =>

    class LauncherError extends base {
        message             : string        = undefined

        annotation          : XmlElement    = undefined

        exitCode            : ExitCodes     = undefined
    }
) {}
