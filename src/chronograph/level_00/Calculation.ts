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
    }
)<V>{}


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

        state


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


        cleanupCalculation () {
            this.iterationResult    = undefined
        }
    }
)<V>{}


