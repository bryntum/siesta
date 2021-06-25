import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Atom, AtomI, Quark, QuarkI } from "./Atom.js"
import { CalculationQuark } from "./Calculation.js"
import { Writeable } from "./Writeable.js"

//---------------------------------------------------------------------------------------------------------------------
export class BoxQuark<V> extends Mixin(
    [ Quark ],
    (base : ClassUnion<typeof Quark>) =>

    class BoxQuark<V> extends base {
        owner       : BoxI<V>
    }
)<V>{}


//region BoxQuark helper interface
export interface BoxQuarkI<V> extends QuarkI<V> {
    owner                   : BoxI<V>
}

type BoxQuarkConsistency<V> = BoxQuarkI<V> extends BoxQuark<V> ? BoxQuark<V> extends BoxQuarkI<V> ? true : false : false

const boxQuarkConsistency : BoxQuarkConsistency<unknown> = true
//endregion


//---------------------------------------------------------------------------------------------------------------------
export class Box<V> extends Mixin(
    [ Atom, Writeable ],
    (base : ClassUnion<typeof Atom, typeof Writeable>) =>

    class Box<V> extends base {
        owner               : Box<V>
        immutable           : BoxQuarkI<V>


        // read () : V {
        //     return
        //     // const reactiveContext   = this.reactiveContext
        //     // const activeAtom        = reactiveContext.currentAtom
        //     //
        //     // if (activeAtom) this.immutableForWrite().addOutgoing(activeAtom.immutable)
        //     //
        //     // return this.immutable.read()
        // }
    }
)<V>{}

//region BoxQuark helper interface
export interface BoxI<V> extends AtomI<V>, Writeable<V> {
    immutable               : BoxQuarkI<V>
    owner                   : BoxI<V>
    value                   : V

    addOutgoing (to : CalculationQuark<unknown>)
    read () : V
}

type BoxConsistency1<V> = BoxI<V> extends Box<V> ? true : false
type BoxConsistency2<V> = Box<V> extends BoxI<V> ? true : false

const boxConsistency1 : BoxConsistency1<unknown> = true
const boxConsistency2 : BoxConsistency2<unknown> = true
//endregion
