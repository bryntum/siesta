import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { CI } from "../../collection/Iterator.js"
import { XmlElement } from "../jsx/XmlElement.js"

//---------------------------------------------------------------------------------------------------------------------
type OptionAtomType         = 'boolean' | 'string' | 'number'

type OptionStructureType    = 'map' | 'array' | 'set' | 'atom'


//---------------------------------------------------------------------------------------------------------------------
export class OptionGroup extends Base {
    name            : string        = ''
    weight          : number        = 100
}


//---------------------------------------------------------------------------------------------------------------------
export class Option extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Option extends base {
        name        : string                = ''

        type        : OptionAtomType        = 'string'

        // maps are supposed to always have string keys
        structure   : OptionStructureType   = 'atom'

        group       : OptionGroup           = undefined

        help        : XmlElement            = undefined


        extractInputValue (
            optionValue         : string,
            valueEntry          : { value : unknown },
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
                            warnings.push({ warning : OptionsParseWarningCodes.ExistingValueOverwritten, option : this, value : valueEntry.value })
                        }
                        else {
                            warnings.push({ warning : OptionsParseWarningCodes.SameValueEncountered, option : this, value : valueEntry.value })
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

            if (!match) return { error : { error : OptionsParseErrorCodes.InvalidKeyValuePair, option : this, input } }

            return { key : match[ 1 ], value : match[ 2 ] }
        }


        parseAtomValue (input : string) : { value? : unknown, error? : OptionParseError } {
            if (this.type === 'string') {
                return { value : input }
            }
            else if (this.type === 'number') {
                const value       = Number(input)

                if (isNaN(value)) {
                    return { error : { error : OptionsParseErrorCodes.InvalidNumericValue, option : this, input } }
                } else {
                    return { value }
                }
            } else {
                if (input === undefined) return { value : true }

                if (/^\s*true|enable|yes|1\s*$/i.test(input)) {
                    return { value : true }
                }
                else if (/^\s*false|disable|no|0\s*$/i.test(input) || /^\s*$/i.test(input)) {
                    return { value : false }
                }
                else {
                    return { error : { error : OptionsParseErrorCodes.InvalidBooleanValue, option : this, input } }
                }
            }
        }
    }
){}


export enum OptionsParseWarningCodes {
    UnknownOption               = 'UnknownOption',
    ExistingValueOverwritten    = 'ExistingValueOverwritten',
    SameValueEncountered        = 'SameValueEncountered'
}


export enum OptionsParseErrorCodes {
    OptionDoesNotHaveValue      = 'OptionDoesNotHaveValue',
    InvalidNumericValue         = 'InvalidNumericValue',
    InvalidBooleanValue         = 'InvalidBooleanValue',
    InvalidKeyValuePair         = 'InvalidKeyValuePair'
}

export type OptionParseError = {
    error       : OptionsParseErrorCodes,
    option      : Option,
    input?      : string
}

export type OptionParseWarning = {
    warning     : OptionsParseWarningCodes,
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
type OptionValueEntry = { key : string, value : string }

export type OptionsParseResult = {
    argv        : string[],
    opts        : OptionValueEntry[]
}

export function parseOptions (input : string[]) : OptionsParseResult {
    let currentOption : string

    const argv : string[]                               = []
    const opts : { key : string, value : string }[]     = []


    const forceFinishCurrentOption = () => {
        if (currentOption) {
            opts.push({ key : currentOption, value : undefined })

            currentOption   = undefined
        }
    }

    for (let i = 0; i < input.length; i++) {
        const arg       = input[ i ]

        if (arg === '--') break

        const match     = /^\s*--([\w_\-.]+)(?:=(.*))?/.exec(arg)

        if (match) {
            forceFinishCurrentOption()

            const optionName : string       = match[ 1 ]
            const optionValue : string      = match[ 2 ]

            if (optionValue !== undefined) {
                opts.push({ key : optionName, value : optionValue })
            } else {
                currentOption               = optionName
            }
        }
        else if (currentOption) {
            opts.push({ key : currentOption, value : arg })

            currentOption                   = undefined
        }
        else {
            argv.push(arg)
        }
    }

    forceFinishCurrentOption()

    return { argv, opts }
}


//---------------------------------------------------------------------------------------------------------------------
type ExtractOptionsResult = { values : Map<Option, unknown>, errors : OptionParseError[], warnings : OptionParseWarning[] }

export class OptionsBag extends Base {
    input                   : string[]              = []

    $argv                   : string[]              = undefined

    $entries                : OptionValueEntry[]    = undefined

    get argv () : string[] {
        if (this.$argv !== undefined) return this.$argv

        const parseRes          = parseOptions(this.input)

        this.$entries           = parseRes.opts

        return this.$argv       = parseRes.argv
    }

    get entries () : OptionValueEntry[] {
        if (this.$entries !== undefined) return this.$entries

        const parseRes          = parseOptions(this.input)

        this.$argv              = parseRes.argv

        return this.$entries    = parseRes.opts
    }

    set entries (value : OptionValueEntry[]) {
        this.$entries           = value
    }


    extractOptions (knownOptions : Option[]) : ExtractOptionsResult {
        const res : ExtractOptionsResult   = { values : new Map(), errors : [], warnings : [] }

        const optionsByName     = CI(knownOptions)
            .map(option => { return [ option.name.toLowerCase(), option ] as [ string, Option ] })
            .toMap()

        this.extract(entry => {
            const option    = optionsByName.get(this.normalizeOptionName(entry.key))

            if (option) {
                option.extractInputValue(
                    entry.value, {
                        get value () {
                            return res.values.get(option)
                        },
                        set value (v) {
                            res.values.set(option, v)
                        }
                    },
                    res.errors,
                    res.warnings
                )

                return true
            }

            return false
        })

        return res
    }


    normalizeOptionName (name : string) : string {
        return name.replace(/[-_]/, '').toLowerCase()
    }


    extract (predicate : (entry : { key : string, value : string }) => boolean) {
        this.entries    = this.entries.filter(entry => !predicate(entry))
    }
}
