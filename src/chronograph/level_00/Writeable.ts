import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Atom, Quark } from "./Atom.js"

//---------------------------------------------------------------------------------------------------------------------
export class Writeable<V> extends Mixin(
    [ Atom ],
    (base : ClassUnion<typeof Atom>) =>

    class Writeable<V> extends base {
        immutable   : Quark<V>


        write (value : V) {
            if (value === undefined) value = null

            if (this.equality && this.equality(this.immutable.read(), value)) return

            this.doWrite(value)
        }


        doWrite (value : V) {

        }
    }
)<V>{}

