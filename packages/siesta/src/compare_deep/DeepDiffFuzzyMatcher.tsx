import { Base } from "../class/Base.js"
import { AnyConstructor } from "../class/Mixin.js"
import { TextJSX } from "../jsx/TextJSX.js"
import { DowngradePrimitives, isAtomicValue, typeOf } from "../util/Helpers.js"
import { isNumber, isRegExp } from "../util/Typeguards.js"
import {
    compareDeepDiffImpl,
    compareKeys,
    DeepCompareOptions,
    DeepCompareState,
    valueAsDifference
} from "./DeepDiff.js"
import {
    Difference,
    DifferenceAtomic,
    DifferenceFuzzyArray,
    DifferenceFuzzyArrayEntry,
    DifferenceFuzzyObject,
    DifferenceHeterogeneous
} from "./DeepDiffRendering.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class FuzzyMatcher extends Base {

    toString () : string {
        throw new Error("Abstract method")
    }


    equalsToDiff (
        v : unknown, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new(),
        convertingToDiff    : 'value1' | 'value2' | undefined = undefined
    ) : Difference {
        throw new Error("Abstract method")
    }
}



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Class that represent the number approximation. It is basically a sum type (often cryptically called "discriminated union")
 * with 3 options, determined by the property, set on the instance creation. See the [[percent]], [[threshold]] and [[digits]]
 * below.
 *
 * The instances of this type are expected to be created with the static constructor method [[fromApproximation]].
 */
export class NumberApproximation extends Base {
    /**
     * The number of percents (0 <= x <= 100) on which the provided value may differ from the expected value.
     */
    percent         : number        = undefined

    /**
     * The exact threshold number on which the provided value may differ from the expected value.
     */
    threshold       : number        = undefined

    /**
     * The number of digits after the point, which should be identical in the received and expected values,
     * to consider them equal.
     */
    digits          : number        = undefined


    getThreshold (expected : number) : number {
        if (this.threshold !== undefined) return this.threshold

        if (this.percent !== undefined) return expected * this.percent / 100

        if (this.digits !== undefined) return 9.999999999999999 * Math.pow(10, -this.digits - 1)
    }


    equalApprox (received : number, expected : number) : boolean {
        const delta     = Math.abs(received - expected) - this.getThreshold(received)

        // strip the floating number artifacts (1.05 - 1 = 0.050000000000000044)
        return Number(delta.toPrecision(10)) <= 1e-10
    }

    /**
     * Static constructor, which converts a value of [[Approximation]] into [[NumberApproximation]].
     * @param approx
     */
    static fromApproximation <T extends typeof NumberApproximation> (this : T, approx : Approximation) : InstanceType<T> {
        return isNumber(approx) ? this.new({ threshold : approx } as Partial<InstanceType<T>>) : this.maybeNew(approx as Partial<InstanceType<T>>)
    }
}

/**
 * A sum type for various way of specifying the number approximation. Can be either plain number or
 * configuration object for [[NumberApproximation]] or [[NumberApproximation]] instance.
 */
export type Approximation   = number | Partial<NumberApproximation> | NumberApproximation


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * The instance of this fuzzy matcher will match any number, which is approximately equal to the [[value|expected value]],
 * with the notion of "approximate equality" defined by the [[approx]] configuration property.
 *
 * This class is usually instantiated with the helper method [[Test.anyNumberApprox]]
 *
 * For example:
 *
 * ```ts
 *
 * t.is(10.5, t.anyNumberApprox(10))
 *
 * t.is(10.1, t.anyNumberApprox(10, { percent : 1 }))
 * ```
 */
export class FuzzyMatcherNumberApproximation extends FuzzyMatcher {
    /**
     * Expected value to match with
     */
    value       : number                = undefined

    /**
     * An approximation of the expected value.
     */
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
            return DifferenceAtomic.new({ value1 : v1, value2 : v2, $same : this.approx.equalApprox(v, this.value) })
        }
    }
}

/**
 * Returns an instance of [[FuzzyMatcherNumberApproximation]], configured with the `value` and `approx` arguments.
 *
 * See also [[any]], [[anyInstanceOf]], [[anyStringLike]], [[anyNumberBetween]]
 *
 * @param value
 * @param approx
 */
export const anyNumberApprox = (value : number, approx : Approximation = { threshold : 0.05 * value }) : FuzzyMatcherNumberApproximation =>
    FuzzyMatcherNumberApproximation.new({ value, approx : NumberApproximation.fromApproximation(approx) })


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * The instance of this fuzzy matcher will match any number, which is in the interval between
 * the [[min]]/[[max]] configuration properties. An [[inclusive]] flag defines if boundaries
 * of that interval are matching.
 *
 * This class is usually instantiated with the helper function [[anyNumberBetween]]
 *
 * For example:
 * ```ts
 * t.is(5, anyNumberBetween(0, 10))
 *
 * // fail - not inclusive match
 * t.is(0, anyNumberBetween(0, 1, false))
 * ```
 */
export class FuzzyMatcherNumberBetween extends FuzzyMatcher {
    /**
     * The mininmum of the matching interval.
     */
    min         : number        = undefined

    /**
     * The maxinmum of the matching interval.
     */
    max         : number        = undefined

    /**
     * Whether the boundaries of the interval are matching.
     */
    inclusive   : boolean       = true


    toString () : string {
        const relation      = this.inclusive ? '≤' : '<'

        return `${ this.min } ${ relation } x ${ relation } ${ this.max }`
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

            return DifferenceAtomic.new({ value1 : v1, value2 : v2, $same : relation(this.min, v) && relation(v, this.max) })
        }
    }
}

/**
 * Returns an instance of [[FuzzyMatcherNumberBetween]], configured with the `min`, `max` and `inclusive` arguments.
 *
 * See also [[any]], [[anyInstanceOf]], [[anyStringLike]], [[anyNumberApprox]]
 *
 * @param min
 * @param max
 * @param inclusive
 */
export const anyNumberBetween = (min : number, max : number, inclusive : boolean = true) : FuzzyMatcherNumberBetween =>
    FuzzyMatcherNumberBetween.new({ min, max, inclusive })


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * The instance of this fuzzy matcher will match any string, matching the [[pattern]] configuration property.
 *
 * This class is usually instantiated with the helper function [[anyStringLike]]
 *
 * For example:
 *
 * ```ts
 *
 * t.is('woops', t.anyStringLike('ps')) // passes
 *
 * t.is('boops', t.anyStringLike(/OOP/i)) // passes
 * ```
 */
export class FuzzyMatcherString extends FuzzyMatcher {
    /**
     * Either a string, which the matching strip should contain, or a `RegExp` instance, which the matching string should conform to.
     */
    pattern     : string | RegExp       = ''

    toString () : string {
        if (isRegExp(this.pattern))
            return `any string matching ${ this.pattern }`
        else
            return `any string containing "${ this.pattern }"`
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
                $same   : isRegExp(this.pattern) ? this.pattern.test(v) : String(v).indexOf(this.pattern) !== -1
            })
        }
    }
}

/**
 * This method returns an [[FuzzyMatcherString]] instance, configured with the `pattern` argument.
 *
 * See also [[any]], [[anyInstanceOf]], [[anyNumberApprox]], [[anyNumberBetween]]
 *
 * @param pattern
 */
export const anyStringLike = (pattern : string | RegExp) : FuzzyMatcherString => FuzzyMatcherString.new({ pattern })


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * The instance of this fuzzy matcher will match any array, containing all elements from the `expected` array.
 * The "containment" notion is defined as deep equality.
 *
 * The order in which the elements of the expected array are encountered in the received array is not significant,
 * however all of them should be found in the received array.
 *
 * The `expected` array con contain other fuzzy matchers (at the position of any depth).
 *
 * This class is usually instantiated with the helper test class method [[Test.anyArrayContaining]]
 *
 * For example:
 *
 * ```ts
 *
 * t.is([ 1, 2, 3 ], t.anyArrayContaining([ 3, 1 ])) // passes
 *
 * t.is([ '1', 3 ], t.anyArrayContaining([ 3, t.any(String) ])) // passes
 * ```
 */
export class FuzzyMatcherArrayContaining extends FuzzyMatcher {
    /**
     * An array with the expected elements
     */
    expected        : unknown[]     = []


    toString () : string {
        return `any array containing [${ this.expected }]`
    }


    equalsToDiff (
        v : unknown[], flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new(),
        convertingToDiff    : 'value1' | 'value2' | undefined = undefined
    )
        : Difference
    {
        if (typeOf(v) !== 'Array') {
            const selfDiff = DifferenceFuzzyArray.new()

            this.expected.forEach((expectedEl, index) =>
                selfDiff.entries.push(DifferenceFuzzyArrayEntry.new({
                    // isFirstMissing  : index === 0,
                    difference      : valueAsDifference(expectedEl, 'value1', options, state)
                }))
            )

            return DifferenceHeterogeneous.new({
                value1      : flipped ? valueAsDifference(v, 'value1', options, state) : selfDiff,
                value2      : flipped ? selfDiff : valueAsDifference(v, 'value2', options, state)
            })
        }

        const selfDiff      = DifferenceFuzzyArray.new()

        const unmatched : unknown[]                         = []
        const entries   : DifferenceFuzzyArrayEntry[]       = new Array(v.length).fill(undefined)

        for (let j = 0; j < this.expected.length; j++) {
            const expectedEl    = this.expected[ j ]

            let matched         = false

            for (let i = 0; i < v.length; i++) {
                const innerState    = state.in()

                // TODO take `flipped` into account?
                const difference    = compareDeepDiffImpl(v[ i ], expectedEl, options, innerState, convertingToDiff)

                if (difference.$same) {
                    state.out(innerState)

                    // TODO should actually track the repeated matches and visualize them in separate group/color?
                    // (as it is done currently with the `Missing` header in the `beforeRenderChildGen` of the `DifferenceFuzzyArray`)
                    // for example, comparing [ 1, 2, 3 ] and [ 3, t.anyNumberApprox(3) ]
                    // both elements in the expected array matches the same element in the received array
                    // right now only the match for the 1st element of the expected array is visualized
                    //
                    if (entries[ i ] === undefined) {
                        entries[ i ]    = DifferenceFuzzyArrayEntry.new({ index : i, difference })
                    }

                    matched         = true

                    break
                }
            }

            if (!matched) unmatched.push(expectedEl)
        }

        entries.forEach((entry, index) => {
            selfDiff.entries.push(
                entry === undefined
                    ? DifferenceFuzzyArrayEntry.new({
                        index,
                        // TODO take `flipped` into account?
                        difference  : valueAsDifference(v[ index ], 'value1', options, state)
                    })
                    : entry
            )
        })

        unmatched.forEach((unmatchedEl, index) =>
            selfDiff.entries.push(
                DifferenceFuzzyArrayEntry.new({
                    // isFirstMissing  : index === 0,
                    // TODO take `flipped` into account?
                    difference      : valueAsDifference(unmatchedEl, 'value2', options, state)
                })
            )
        )

        selfDiff.$same          = unmatched.length === 0
        selfDiff.onlyIn2Size    = unmatched.length
        selfDiff.length         = v.length
        selfDiff.length2        = v.length + unmatched.length

        return selfDiff
    }
}

/**
 * This method returns an [[FuzzyMatcherArrayContaining]] instance, configured with the `expected` argument.
 *
 * See also [[any]], [[anyInstanceOf]], [[anyNumberApprox]], [[anyNumberBetween]], [[anyStringLike]]
 *
 * @param expected
 */
export const anyArrayContaining = (expected : unknown[]) : FuzzyMatcherArrayContaining => FuzzyMatcherArrayContaining.new({ expected })


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * The instance of this fuzzy matcher will match any object, containing all properties from the `expected` object.
 * The values of properties need to deeply match the values of corresponding properties in the received array.
 * The values of properties can contain other fuzzy matchers.
 *
 * This class is usually instantiated with the helper test class method [[Test.anyObjectContaining]]
 *
 * For example:
 *
 * ```ts
 *
 * t.is({ a : 1, b : 2, c : 3 }, t.anyObjectContaining({ a : 1 })) // passes
 *
 * t.is({ a : 1, b : 2, c : 3 }, t.anyObjectContaining({ a : 1, b : t.any(Number) })) // passes
 * ```
 */
export class FuzzyMatcherObjectContaining extends FuzzyMatcher {
    /**
     * An object with the expected properties
     */
    expected        : Record<string, unknown>       = {}


    toString () : string {
        return `any object containing ${ this.expected }`
    }


    equalsToDiff (
        v : Record<string, unknown>, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new(),
        convertingToDiff    : 'value1' | 'value2' | undefined = undefined
    )
        : Difference
    {
        if (isAtomicValue(v)) {
            const selfDiff = valueAsDifference(this.expected, 'value2', options, state)

            return DifferenceHeterogeneous.new({
                value1      : flipped ? valueAsDifference(v, 'value1', options, state) : selfDiff,
                value2      : flipped ? selfDiff : valueAsDifference(v, 'value2', options, state)
            })
        }

        const object1       = v
        const object2       = this.expected

        const difference = DifferenceFuzzyObject.new({ value1 : object1, value2 : object2 })

        state.markVisited(object1, object2, difference, convertingToDiff)

        const { common, onlyIn1, onlyIn2 }  = compareKeys(
            new Set(Object.keys(object1)), new Set(Object.keys(object2)), false, options, state, convertingToDiff
        )

        difference.onlyIn2Size              = onlyIn2.size

        for (let i = 0; i < common.length; i++) {
            const key1      = common[ i ].el1
            const key2      = common[ i ].el2

            const diff      = compareDeepDiffImpl(object1[ key1 ], object2[ key2 ], options, state, convertingToDiff)

            difference.addComparison(key1, diff)
        }

        onlyIn1.forEach(key1 => difference.addComparison(key1, valueAsDifference(object1[ key1 ], 'value1', options, state), true))
        onlyIn2.forEach(key2 => difference.addComparison(key2, valueAsDifference(object2[ key2 ], 'value2', options, state)))

        return difference
    }
}

/**
 * This method returns an [[FuzzyMatcherArrayContaining]] instance, configured with the `expected` argument.
 *
 * See also [[any]], [[anyInstanceOf]], [[anyNumberApprox]], [[anyNumberBetween]], [[anyStringLike]]
 *
 * @param expected
 */
export const anyObjectContaining = (expected : Record<string, unknown>) : FuzzyMatcherObjectContaining => FuzzyMatcherObjectContaining.new({ expected })


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * The instance of this fuzzy matcher will match any instance of the class, specified with the [[cls]] configuration property.
 *
 * This class is usually instantiated with the helper functions [[any]] and [[anyInstanceOf]]
 *
 * For example:
 *
 * ```ts
 *
 * // pass
 * t.is([ 1, 2, 3 ], t.any(Array), 'Array is "any array"')
 *
 * // fail
 * t.is([ 1, 2, 3 ], t.any(Map), 'Array is "any map"')
 * ```
 */
export class FuzzyMatcherInstance extends FuzzyMatcher {
    /**
     * The constructor of the class to match the provided value.
     */
    cls         : AnyConstructor    = Object


    toString () : string {
        return `any [${ this.cls.name }]`
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
            $same       : Object.getPrototypeOf(v) === this.cls.prototype || (v instanceof this.cls),

            value1      : flipped ? valueAsDifference(v, 'value1', options, state) : selfAtomicDifference,
            value2      : flipped ? selfAtomicDifference : valueAsDifference(v, 'value2', options, state)
        })
    }
}

/**
 * Returns an instance of the [[FuzzyMatcherInstance]] configured with the `cls` argument
 *
 * See also [[any]], [[anyStringLike]], [[anyNumberApprox]], [[anyNumberBetween]]
 *
 * @param cls
 */
export const anyInstanceOf = (cls : AnyConstructor) : FuzzyMatcherInstance => FuzzyMatcherInstance.new({ cls })


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * An instance of this matcher class will match anything.
 *
 * This class is usually instantiated with the helper method [[Test.any]]
 *
 * For example:
 * ```ts
 * t.is([ 1, 2, 3 ], t.any(), 'Array matches `any()`')
 *
 * t.is(new Set(), t.any(), 'Set matches `any()`')
 * ```
 */
export class FuzzyMatcherAny extends FuzzyMatcher {
    cls         : AnyConstructor    = Object


    toString () : string {
        return `any`
    }


    equalsToDiff (
        v : unknown, flipped : boolean, options : DeepCompareOptions, state : DeepCompareState = DeepCompareState.new(),
        convertingToDiff    : 'value1' | 'value2' | undefined = undefined
    ) : Difference {
        const selfAtomicDifference = DifferenceAtomic.new({
            [ flipped ? 'value2' : 'value1' ] : this
        })

        return DifferenceHeterogeneous.new({
            $same       : true,

            value1      : flipped ? valueAsDifference(v, 'value1', options, state) : selfAtomicDifference,
            value2      : flipped ? selfAtomicDifference : valueAsDifference(v, 'value2', options, state)
        })
    }
}

/**
 * This method returns a fuzzy matcher instance, which can be used in various comparison assertions.
 *
 * If it is called w/o arguments, it returns an instance of [[FuzzyMatcherAny]]. If it is called with
 * single argument, it returns an instance of [[FuzzyMatcherInstance]].
 *
 * See also [[anyInstanceOf]], [[anyStringLike]], [[anyNumberApprox]], [[anyNumberBetween]]
 *
 * @param args
 */
export const any = <T extends [] | [ AnyConstructor ]>(...args : T)
    : T extends [] ? any : T extends [ AnyConstructor<infer I> ] ? DowngradePrimitives<T> : never =>
    // @ts-ignore
    args.length === 0 ?  FuzzyMatcherAny.new() : FuzzyMatcherInstance.new({ cls : args[ 0 ] })
