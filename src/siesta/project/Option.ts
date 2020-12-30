import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"

//---------------------------------------------------------------------------------------------------------------------
type OptionAtomType         = 'boolean' | 'string' | 'number'

type OptionStructureType    = 'map' | 'array' | 'set' | 'atom'


//---------------------------------------------------------------------------------------------------------------------
export class Option extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Option extends base {
        name        : string                = ''

        type        : OptionAtomType        = 'string'

        // maps are supposed to have string keys
        structure   : OptionStructureType   = 'atom'


        applyInputValue (
            optionValue         : string,
            valueEntry          : { value : unknown },
            optionNameSegments  : string[],
            errors              : OptionParseError[],
            warnings            : OptionParseWarning[]
        ) {
            if (this.structure === 'map') {
                const keyValueParseRes  = this.parseMapValue(optionValue)

                if (keyValueParseRes.error) {
                    errors.push(keyValueParseRes.error)

                    return
                }

                const parseRes  = this.parseAtomValue(keyValueParseRes.value)

                if (parseRes.error) {
                    errors.push(parseRes.error)

                    return
                }

                if (valueEntry.value === undefined) valueEntry.value = new Map();

                (valueEntry.value as Map<string, unknown>).set(keyValueParseRes.key, parseRes.value)
            } else {
                const parseRes  = this.parseAtomValue(optionValue)

                if (parseRes.error) {
                    errors.push(parseRes.error)

                    return
                }

                if (this.structure === 'atom') {

                    if (valueEntry.value !== undefined)
                        if (valueEntry.value !== parseRes.value) {
                            warnings.push({ warning : OptionsParseWarnings.ExistingValueOverwritten, option : this, value : valueEntry.value })
                        }
                        else {
                            warnings.push({ warning : OptionsParseWarnings.SameValueEncountered, option : this, value : valueEntry.value })
                        }

                    valueEntry.value = parseRes.value
                }
                else if (this.structure === 'array') {
                    if (valueEntry.value === undefined) valueEntry.value = [];

                    (valueEntry.value as unknown[]).push(parseRes.value)
                }
                else if (this.structure === 'set') {
                    if (valueEntry.value === undefined) valueEntry.value = new Set();

                    (valueEntry.value as Set<unknown>).add(parseRes.value)
                }
            }
        }


        parseMapValue (input : string) : { key? : string, value? : string, error? : OptionParseError } {
            const match     = /\s*([\w_-]+)\s*(?:=|:|=>)\s*(.*)\s*/.exec(input)

            if (!match) return { error : { error : OptionsParseErrors.InvalidKeyValuePair, option : this, input } }

            return { key : match[ 1 ], value : match[ 2 ] }
        }


        parseAtomValue (input : string) : { value? : unknown, error? : OptionParseError } {
            if (this.type === 'string') {
                return { value : input }
            }
            else if (this.type === 'number') {
                const value       = Number(input)

                if (isNaN(value)) {
                    return { error : { error : OptionsParseErrors.InvalidNumericValue, option : this, input } }
                } else {
                    return { value }
                }
            } else {
                if (/^\s*true|enable|yes|1\s*$/i.test(input)) {
                    return { value : true }
                }
                else if (/^\s*false|disable|no|0\s*$/i.test(input) || /^\s*$/i.test(input)) {
                    return { value : false }
                }
                else {
                    return { error : { error : OptionsParseErrors.InvalidBooleanValue, option : this, input } }
                }
            }
        }
    }
){}


export enum OptionsParseWarnings {
    UnknownOption               = 'UnknownOption',
    ExistingValueOverwritten    = 'ExistingValueOverwritten',
    SameValueEncountered        = 'SameValueEncountered'
}


export enum OptionsParseErrors {
    OptionDoesNotHaveValue      = 'OptionDoesNotHaveValue',
    InvalidNumericValue         = 'InvalidNumericValue',
    InvalidBooleanValue         = 'InvalidBooleanValue',
    InvalidKeyValuePair         = 'InvalidKeyValuePair'
}

export type OptionParseError = {
    error       : OptionsParseErrors,
    option      : Option,
    input?      : string
}

export type OptionParseWarning = {
    warning     : OptionsParseWarnings,
    option      : Option,
    value?      : unknown
}



//---------------------------------------------------------------------------------------------------------------------
export class HasOptions extends Mixin(
    [],
    (base : AnyConstructor) =>

    class HasOptions extends base {
        // resides in prototype
        $options        : { [ key : string ] : Option }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export const initOptionsStorage = (proto : HasOptions) => {
    if (!proto.hasOwnProperty('$options')) proto.$options = Object.create(proto.$options || null)
}


//---------------------------------------------------------------------------------------------------------------------
export const option = (config? : Partial<Option>, optionCls : typeof Option = Option) : PropertyDecorator => {

    return (target : HasOptions, propertyKey : string) : void => {
        initOptionsStorage(target)

        target.$options[ propertyKey ]  = optionCls.new(Object.assign({}, config, { name : propertyKey }))
    }
}


//---------------------------------------------------------------------------------------------------------------------
export function parseOptions (
    input : string[], knownOptions : { [ key : string ] : Option }
) : {
        argv        : string[],
        opts        : Map<string, { option : Option, value : unknown }>,
        errors      : OptionParseError[],
        warnings    : OptionParseWarning[]
    }
{
    let currentOption : Option

    const argv : string[]   = []
    const opts              = new Map<string, { option : Option, value : unknown }>()

    const warnings : OptionParseWarning[]       = []
    const errors : OptionParseError[]           = []

    const forceFinishCurrentOption = () => {
        if (currentOption)
            if (currentOption.type === 'boolean' && currentOption.structure === 'atom') {
                // boolean options does not need to have a value, just there presence
                // assumes a `true` value, like:
                //     --some_boolean_option --some_option_with_value=1
                currentOption.applyInputValue('true', opts.get(currentOption.name), [], errors, warnings)

                currentOption   = undefined
            } else {
                errors.push({ error : OptionsParseErrors.OptionDoesNotHaveValue, option : currentOption })

                currentOption   = undefined
            }
    }

    for (let i = 0; i < input.length; i++) {
        const arg       = input[ i ]

        if (arg === '--') break

        const match     = /^\s*--([\w_\-.]+)(?:=(.*))?/.exec(arg)

        if (match) {
            forceFinishCurrentOption()

            const optionFullName : string   = match[ 1 ]
            const optionValue : string      = match[ 2 ]

            const optionNameSegments        = optionFullName.split('.')

            const optionName                = optionNameSegments[ 0 ]

            if (!opts.has(optionName)) {
                let option                  = knownOptions[ optionName ]

                if (!option) {
                    option                  = new Option({ name : optionName })

                    warnings.push({ warning : OptionsParseWarnings.UnknownOption, option })
                }

                opts.set(optionName, { option, value : undefined })
            }

            const existingEntry             = opts.get(optionName)

            currentOption                   = existingEntry.option

            if (optionValue !== undefined) {
                currentOption.applyInputValue(optionValue, existingEntry, optionNameSegments, errors, warnings)

                currentOption               = undefined
            }
        }
        else if (currentOption) {
            currentOption.applyInputValue(arg, opts.get(currentOption.name), [], errors, warnings)

            currentOption                   = undefined
        }
        else {
            argv.push(arg)
        }
    }

    forceFinishCurrentOption()

    return { argv, opts, errors, warnings }
}
