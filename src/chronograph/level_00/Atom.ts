import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MIN_SMI } from "../../util/Helpers.js"
import { CalculationQuark } from "./Calculation.js"
import { CombinedOwnerAndImmutable, Immutable } from "./Immutable.js"
import { ReactiveContext } from "./ReactiveContext.js"

//---------------------------------------------------------------------------------------------------------------------
export class Quark<V> extends Mixin(
    [ Immutable ],
    (base : ClassUnion<typeof Immutable>) =>

    class Quark<V> extends base {
        uniqable            : number            = MIN_SMI

        owner               : AtomI<V>

        value               : V                 = undefined

        outgoing            : CalculationQuark<unknown>[] = undefined


        addOutgoing (to : CalculationQuark<unknown>) {
            if (this.outgoing) {
                if (this.outgoing[ this.outgoing.length - 1 ] === to) return

                this.outgoing.push(to)
            } else {
                this.outgoing   = [ to ]
            }
        }


        hasValue () : boolean {
            return this.read() !== undefined
        }


        hasOwnValue () : boolean {
            return this.value !== undefined
        }


        read () : V {
            let quark : this = this

            while (quark) {
                if (quark.value !== undefined) return quark.value

                quark     = quark.previous
            }

            return undefined
        }
    }
)<V>{}

//region Quark helper interface
export interface QuarkI<V> extends Immutable {
    uniqable                : number
    owner                   : AtomI<V>
    value                   : V
    outgoing                : CalculationQuark<unknown>[]
    addOutgoing (to : CalculationQuark<unknown>)
    hasValue () : boolean
    hasOwnValue () : boolean
    read () : V
}

type QuarkConsistency<V> = QuarkI<V> extends Quark<V> ? Quark<V> extends QuarkI<V> ? true : false : false

const quarkConsistency : QuarkConsistency<unknown> = true
//endregion

//---------------------------------------------------------------------------------------------------------------------
export class Atom<V> extends Mixin(
    [ CombinedOwnerAndImmutable, Quark ],
    (base : ClassUnion<typeof CombinedOwnerAndImmutable, typeof Quark>) =>

    class Atom<V> extends base {
        reactiveContext     : ReactiveContext

        immutable           : Quark<V>

        equality            : (v1 : V, v2 : V) => boolean


        read () : V {
            const reactiveContext   = this.reactiveContext
            const activeAtom        = reactiveContext.currentCalculation

            if (activeAtom) this.immutableForWrite().addOutgoing(activeAtom.immutable)

            return this.immutable.read()
        }
    }
)<V>{}


//region Atom helper interface
export interface AtomI<V> extends CombinedOwnerAndImmutable, QuarkI<V> {
    reactiveContext         : ReactiveContext
    immutable               : QuarkI<V>
    owner                   : AtomI<V>
    equality                : (v1 : V, v2 : V) => boolean
}

type AtomConsistency<V> = AtomI<V> extends Atom<V> ? Atom<V> extends AtomI<V> ? true : false : false

type Check<A extends true>  = A

type Check2 = Check<AtomConsistency<unknown>>

// const atomConsistency : AtomConsistency<unknown> = true
//endregion
