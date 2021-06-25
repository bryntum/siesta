import { AtomState } from "../../../../../../typescript/chronograph/src/chrono2/atom/Atom.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Quark } from "./Atom.js"
import { Immutable, Owner } from "./Immutable.js"
import { ReactiveContext } from "./ReactiveContext.js"

//---------------------------------------------------------------------------------------------------------------------
export class CalculationQuark<V> extends Mixin(
    [ Immutable ],
    (base : ClassUnion<typeof Immutable>) =>

    class CalculationQuark<V> extends base {
        incoming            : Quark<unknown>[]          = undefined


        getIncomingDeep () : Quark<unknown>[] {
            // let box : this = this
            //
            // while (box) {
            //     // as an edge case, atom may compute its value w/o external dependencies all of the sudden
            //     // in such case `$incoming` will be empty
            //     if (box.incoming !== undefined || box.value !== undefined) return box.$incoming
            //
            //     box     = box.previous
            // }

            return undefined
        }

    }
)<V>{}


//---------------------------------------------------------------------------------------------------------------------
// Benchmarking has shown that there's no difference when using numbers
// v8 optimizes comparison of immutable strings to pointer comparison I guess
export enum CalculationState {
    Empty           = 'Empty',
    UpToDate        = 'UpToDate',
    PossiblyStale   = 'PossiblyStale',
    Stale           = 'Stale',
    CheckingDeps    = 'CheckingDeps',
    Calculating     = 'Calculating'
}


//---------------------------------------------------------------------------------------------------------------------
export const SynchronousCalculationStarted  = Symbol('SynchronousCalculationStarted')

const calculationStartedConstant : IteratorResult<typeof SynchronousCalculationStarted> =
    { done : false, value : SynchronousCalculationStarted }

export class Calculation<V> extends Mixin(
    [ Owner ],
    (base : ClassUnion<typeof Owner>) =>

    class Calculation<V> extends base {
        reactiveContext     : ReactiveContext

        immutable           : CalculationQuark<V>

        context             : unknown
        calculation         : (...args : unknown[]) => V

        iterationResult     : IteratorResult<any, V>        = undefined

        state               : CalculationState              = CalculationState.Empty


        isCalculationStarted ()     : boolean {
            return Boolean(this.iterationResult)
        }


        isCalculationCompleted ()   : boolean {
            return Boolean(this.iterationResult && this.iterationResult.done)
        }


        startCalculation (onEffect : any) : IteratorResult<unknown> {
            // this assignment allows other code to observe, that calculation has started
            this.iterationResult        = calculationStartedConstant

            return this.iterationResult = {
                done    : true,
                value   : this.calculation.call(this.context, onEffect)
            }
        }


        continueCalculation (value : unknown) : IteratorResult<unknown> {
            throw new Error("Can not continue synchronous calculation")
        }


        resetCalculation () {
            this.iterationResult    = undefined
        }


        call () {
            if (this.state === CalculationState.UpToDate) return
        }
    }
)<V>{}


