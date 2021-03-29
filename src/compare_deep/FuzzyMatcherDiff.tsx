import { Base } from "../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../class/Mixin.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { serializationVisitSymbol, SerializerXml } from "../serializer/SerializerXml.js"
import { typeOf } from "../util/Helpers.js"
import { isNumber, isRegExp } from "../util/Typeguards.js"
import { Visitor } from "../visitor/Visitor.js"
import { DeepCompareOptions, DeepCompareState, Difference, DifferenceAtomic, DifferenceHeterogeneous, valueAsDifference } from "./CompareDeepDiff.js"


//---------------------------------------------------------------------------------------------------------------------
export class FuzzyMatcher extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class FuzzyMatcher extends base {

        toString () : string {
            throw new Error("Abstract method")
        }


        [ serializationVisitSymbol ] (visitor : Visitor, depth : number) : this {
            throw new Error("Abstract method")
        }


        equalsToDiff (
            v : unknown, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new(),
            convertingToDiff    : 'value1' | 'value2' | undefined = undefined
        ) : Difference {
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
export class FuzzyMatcherNumberApproximation extends Mixin(
    [ FuzzyMatcher ],
    (base : ClassUnion<typeof FuzzyMatcher>) =>

    class FuzzyMatcherNumberApproximation extends base {
        value       : number                = undefined

        approx      : NumberApproximation   = NumberApproximation.new({ percent : 5 })


        toString () : string {
            if (this.approx.threshold !== undefined) {
                return `${ this.value }±${ this.approx.getThreshold(this.value) }`
            }
            else if (this.approx.percent !== undefined) {
                return `${ this.value }±${ this.approx.percent }%`
            }
            else if (this.approx.digits !== undefined) {
                const parts     = String(this.value).split('.')

                if (parts.length < 2) parts.push('0'.repeat(this.approx.digits))

                return `${ parts[ 0 ] }.${ parts[ 1 ].substr(0, this.approx.digits) }${ parts[ 1 ].length - this.approx.digits > 0 ? 'x'.repeat(parts[ 1 ].length - this.approx.digits) : '' }`
            }
        }


        [ serializationVisitSymbol ] (visitor : SerializerXml, depth : number) : this {
            visitor.write(<number>{ this }</number>)

            return this
        }


        equalsToDiff (
            v : number, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new(),
            convertingToDiff    : 'value1' | 'value2' | undefined = undefined
        ) : Difference {
            const v1        = flipped ? v : this
            const v2        = flipped ? this : v

            const type1     = flipped ? typeOf(v) : 'Number'
            const type2     = flipped ? 'Number' : typeOf(v)

            if (type1 !== type2)
                return DifferenceHeterogeneous.new({
                    value1 : valueAsDifference(v1, 'value1', options, state),
                    value2 : valueAsDifference(v2, 'value2', options, state)
                })
            else {
                return DifferenceAtomic.new({ value1 : v1, value2 : v2, same : this.approx.equalApprox(v, this.value) })
            }
        }
    }
){}

export const anyNumberApprox = (value : number, approx : Approximation = { threshold : 0.05 * value }) : FuzzyMatcherNumberApproximation =>
    FuzzyMatcherNumberApproximation.new({ value, approx : NumberApproximation.fromApproximation(approx) })


//---------------------------------------------------------------------------------------------------------------------
export class FuzzyMatcherNumberBetween extends Mixin(
    [ FuzzyMatcher ],
    (base : ClassUnion<typeof FuzzyMatcher>) =>

    class FuzzyMatcherNumberBetween extends base {
        min         : number        = undefined
        max         : number        = undefined

        inclusive   : boolean       = true


        toString () : string {
            const relation      = this.inclusive ? '≤' : '<'

            return `${ this.min } ${ relation } x ${ relation } ${ this.max }`
        }


        [ serializationVisitSymbol ] (visitor : SerializerXml, depth : number) : this {
            visitor.write(<number>{ this }</number>)

            return this
        }


        equalsToDiff (
            v : number, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new(),
            convertingToDiff    : 'value1' | 'value2' | undefined = undefined
        ) : Difference {
            const v1        = flipped ? v : this
            const v2        = flipped ? this : v

            const type1     = flipped ? typeOf(v) : 'Number'
            const type2     = flipped ? 'Number' : typeOf(v)

            if (type1 !== type2)
                return DifferenceHeterogeneous.new({
                    value1 : valueAsDifference(v1, 'value1', options, state),
                    value2 : valueAsDifference(v2, 'value2', options, state)
                })
            else {
                const relation  = (num1 : number, num2 : number) => this.inclusive ? num1 <= num2 : num1 < num2

                return DifferenceAtomic.new({ value1 : v1, value2 : v2, same : relation(this.min, v) && relation(v, this.max) })
            }
        }
    }
){}


export const anyNumberBetween = (min : number, max : number, inclusive : boolean = true) : FuzzyMatcherNumberBetween =>
    FuzzyMatcherNumberBetween.new({ min, max, inclusive })


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
                return `any string containing "${ this.pattern }"`
        }


        [ serializationVisitSymbol ] (visitor : SerializerXml, depth : number) : this {
            visitor.write(<special>{ this }</special>)

            return this
        }


        equalsToDiff (
            v : string, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new(),
            convertingToDiff    : 'value1' | 'value2' | undefined = undefined
        ) : Difference {
            const v1        = flipped ? v : this
            const v2        = flipped ? this : v

            const type1     = flipped ? typeOf(v) : 'String'
            const type2     = flipped ? 'String' : typeOf(v)

            if (type1 !== type2)
                return DifferenceHeterogeneous.new({
                    value1 : valueAsDifference(v1, 'value1', options, state),
                    value2 : valueAsDifference(v2, 'value2', options, state)
                })
            else {
                return DifferenceAtomic.new({
                    value1  : v1,
                    value2  : v2,
                    same    : isRegExp(this.pattern) ? this.pattern.test(v) : String(v).indexOf(this.pattern) !== -1
                })
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


        equalsToDiff (
            v : unknown, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new(),
            convertingToDiff    : 'value1' | 'value2' | undefined = undefined
        ) : Difference {
            const selfAtomicDifference = DifferenceAtomic.new({
                [ flipped ? 'value2' : 'value1' ] : this
            })

            return DifferenceHeterogeneous.new({
                // the 1st part of `||` handles the case of primitives,
                // like `1 instanceof Number === false`, but `Object.getPrototypeOf(1) === Number.prototype` - true
                same        : Object.getPrototypeOf(v) === this.cls.prototype || (v instanceof this.cls),

                value1      : flipped ? valueAsDifference(v, 'value1', options, state) : selfAtomicDifference,
                value2      : flipped ? selfAtomicDifference : valueAsDifference(v, 'value2', options, state)
            })
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


        equalsToDiff (
            v : unknown, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new(),
            convertingToDiff    : 'value1' | 'value2' | undefined = undefined
        ) : Difference {
            const selfAtomicDifference = DifferenceAtomic.new({
                [ flipped ? 'value2' : 'value1' ] : this
            })

            return DifferenceHeterogeneous.new({
                same        : true,

                value1      : flipped ? valueAsDifference(v, 'value1', options, state) : selfAtomicDifference,
                value2      : flipped ? selfAtomicDifference : valueAsDifference(v, 'value2', options, state)
            })
        }
    }
){}

export const any = <T extends [] | [ AnyConstructor ]>(...args : T) : [] extends T ? FuzzyMatcherAny : FuzzyMatcherInstance =>
    // @ts-ignore
    args.length === 0 ?  FuzzyMatcherAny.new() : FuzzyMatcherInstance.new({ cls : args[ 0 ] })
