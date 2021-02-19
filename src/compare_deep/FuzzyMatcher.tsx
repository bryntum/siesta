import { Base } from "../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../class/Mixin.js"
import { SiestaJSX } from "../jsx/Factory.js"
import { serializationVisitSymbol, SerializerXml } from "../serializer/SerializerXml.js"
import { typeOf } from "../util/Helpers.js"
import { isNumber, isRegExp } from "../util/Typeguards.js"
import { Visitor } from "../visitor/Visitor.js"
import { DeepCompareOptions, DeepCompareState, Difference, DifferenceTypesAreDifferent, DifferenceValuesAreDifferent } from "./CompareDeep.js"


//---------------------------------------------------------------------------------------------------------------------
export class FuzzyMatcher extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class PlaceHolder extends base {

        toString () : string {
            throw new Error("Abstract method")
        }


        [ serializationVisitSymbol ] (visitor : Visitor, depth : number) : this {
            throw new Error("Abstract method")
        }


        * equalsToGen (v : unknown, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()) : Generator<Difference> {
            throw new Error("Abstract method")
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class NumberApproximation extends Base {
    percent         : number        = undefined

    threshold       : number        = undefined

    digits          : number        = undefined


    getThreshold (value : number) : number {
        if (this.threshold !== undefined) return this.threshold

        if (this.percent !== undefined) return value * this.percent / 100

        if (this.digits !== undefined) return 9.999999999999999 * Math.pow(10, -this.digits - 1)
    }


    equalApprox (v1 : number, v2 : number) : boolean {
        const delta     = Math.abs(v1 - v2) - this.getThreshold(v1)

        // strip the floating number artifacts (1.05 - 1 = 0.050000000000000044)
        return Number(delta.toPrecision(10)) <= 1e-10
    }


    static fromApproximation <T extends typeof NumberApproximation> (this : T, approx : Approximation) : InstanceType<T> {
        return isNumber(approx) ? this.new({ threshold : approx } as Partial<InstanceType<T>>) : this.maybeNew(approx as Partial<InstanceType<T>>)
    }
}

export type Approximation   = number | Partial<NumberApproximation> | NumberApproximation


//---------------------------------------------------------------------------------------------------------------------
export class FuzzyMatcherNumber extends Mixin(
    [ FuzzyMatcher ],
    (base : ClassUnion<typeof FuzzyMatcher>) =>

    class FuzzyMatcherNumber extends base {
        value       : number        = undefined

        approx      : NumberApproximation = undefined

        min         : number        = undefined
        max         : number        = undefined


        initialize (props? : Partial<FuzzyMatcherNumber>) {
            super.initialize(props)

            if (this.value !== undefined && this.approx === undefined) this.approx = NumberApproximation.new({ percent : 5 })
        }


        toString () : string {
            if (this.value !== undefined) return `${ this.value }±${ this.approx.getThreshold(this.value) }`

            return `${ this.min } ≤ x ≤ ${ this.max }`
        }


        [ serializationVisitSymbol ] (visitor : SerializerXml, depth : number) : this {
            visitor.write(<number>{ this }</number>)

            return this
        }


        * equalsToGen (v : number, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()) : Generator<Difference> {
            const v1        = flipped ? v : this
            const v2        = flipped ? this : v

            const type1     = flipped ? typeOf(v) : 'Number'
            const type2     = flipped ? 'Number' : typeOf(v)

            if (type1 !== type2)
                yield DifferenceTypesAreDifferent.new({ v1, v2, type1, type2, keyPath : state.keyPathSnapshot() })
            else if (this.value !== undefined) {
                if (!this.approx.equalApprox(v, this.value))
                    yield DifferenceValuesAreDifferent.new({ v1, v2, keyPath : state.keyPathSnapshot() })
            }
            else {
                if (v < this.min || v > this.max)
                    yield DifferenceValuesAreDifferent.new({ v1, v2, keyPath : state.keyPathSnapshot() })
            }
        }
    }
){}

export const anyNumberApprox = (value : number, approx : Approximation = { percent : 5 }) : FuzzyMatcherNumber =>
    FuzzyMatcherNumber.new({ value, approx : NumberApproximation.fromApproximation(approx) })

export const anyNumberBetween = (min : number, max : number) : FuzzyMatcherNumber =>
    FuzzyMatcherNumber.new({ min, max })


//---------------------------------------------------------------------------------------------------------------------
export class FuzzyMatcherString extends Mixin(
    [ FuzzyMatcher ],
    (base : ClassUnion<typeof FuzzyMatcher>) =>

    class FuzzyMatcherString extends base {
        pattern     : string | RegExp       = ''

        toString () : string {
            if (isRegExp(this.pattern))
                return `any string matching ${ this.pattern }`
            else
                return `any string containing ${ this.pattern }`
        }


        [ serializationVisitSymbol ] (visitor : SerializerXml, depth : number) : this {
            visitor.write(<special>{ this }</special>)

            return this
        }


        * equalsToGen (v : string, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()) : Generator<Difference> {
            const v1        = flipped ? v : this
            const v2        = flipped ? this : v

            const type1     = flipped ? typeOf(v) : 'String'
            const type2     = flipped ? 'String' : typeOf(v)

            if (type1 !== type2)
                yield DifferenceTypesAreDifferent.new({ v1, v2, type1, type2, keyPath : state.keyPathSnapshot() })
            else {
                if (isRegExp(this.pattern) ? !this.pattern.test(v) : String(v).indexOf(this.pattern) === -1)
                    yield DifferenceValuesAreDifferent.new({ v1, v2, keyPath : state.keyPathSnapshot() })
            }
        }
    }
){}

export const anyStringLike = (pattern : string | RegExp) : FuzzyMatcherString => FuzzyMatcherString.new({ pattern })


//---------------------------------------------------------------------------------------------------------------------
export class FuzzyMatcherInstance extends Mixin(
    [ FuzzyMatcher ],
    (base : ClassUnion<typeof FuzzyMatcher>) =>

    class FuzzyMatcherInstance extends base {
        cls         : AnyConstructor    = Object


        toString () : string {
            return `any [${ this.cls.name }]`
        }


        [ serializationVisitSymbol ] (visitor : SerializerXml, depth : number) : this {
            visitor.write(<special>{ this }</special>)

            return this
        }


        * equalsToGen (v : unknown, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()) : Generator<Difference> {
            const v1        = flipped ? v : this
            const v2        = flipped ? this : v

            // this handles the primitives, like `1 instanceof Number` and other simple cases
            if (Object.getPrototypeOf(v) === this.cls.prototype) return

            // generic `instanceof` check, possibly using [Symbol.hasInstance]
            if (!(v instanceof this.cls))
                yield DifferenceValuesAreDifferent.new({ v1, v2, keyPath : state.keyPathSnapshot() })
        }
    }
){}

export const anyInstanceOf = (cls : AnyConstructor) : FuzzyMatcherInstance => FuzzyMatcherInstance.new({ cls })


//---------------------------------------------------------------------------------------------------------------------
export class FuzzyMatcherAny extends Mixin(
    [ FuzzyMatcher ],
    (base : ClassUnion<typeof FuzzyMatcher>) =>

    class FuzzyMatcherAny extends base {
        cls         : AnyConstructor    = Object


        toString () : string {
            return `any`
        }


        [ serializationVisitSymbol ] (visitor : SerializerXml, depth : number) : this {
            visitor.write(<special>{ this }</special>)

            return this
        }


        * equalsToGen (v : unknown, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new()) : Generator<Difference> {
        }
    }
){}

export const any = <T extends [] | [ AnyConstructor ]>(...args : T) : [] extends T ? FuzzyMatcherAny : FuzzyMatcherInstance =>
    // @ts-ignore
    args.length === 0 ?  FuzzyMatcherAny.new() : FuzzyMatcherInstance.new({ cls : args[ 0 ] })
