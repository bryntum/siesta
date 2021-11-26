import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { CI } from "../../iterator/Iterator.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlElement } from "../../jsx/XmlElement.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type OptionAtomType         = 'boolean' | 'string' | 'number' | 'object' | 'enum'

export type OptionStructureType    = 'map' | 'array' | 'set' | 'atom'


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class OptionGroup extends Base {
    name            : string        = ''
    title           : string        = ''
    weight          : number        = 100
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Option extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Option extends base {
        name                : string                = ''

        type                : OptionAtomType        = 'string'

        // maps are supposed to always have string keys
        structure           : OptionStructureType   = 'atom'

        enumeration         : string[]              = []

        group               : OptionGroup           = undefined

        help                : XmlElement            = undefined

        defaultValue        : () => unknown     = () => undefined

        reviver             : (value : string) => unknown   = undefined


        get printableDeclaration () : XmlElement {
            return <span>--{ camelCaseToSnakeCase(this.name, '-') } : <span class='secondary_pass'>{ this.printableType }</span> { this.printableDefaultValue }</span>
        }


        get printableType () : string {
            const type      = this.type === 'enum'
                ? this.enumeration.map(member => "'" + member + "'").join(' | ')
                : this.type

            if (this.structure === 'atom') {
                return type
            }
            else if (this.structure === 'array') {
                return this.type === 'enum'
                    ? '(' + type + ')[]'
                    : type + '[]'
            }
            else if (this.structure === 'set') {
                return `Set<${ type }`
            }
            else if (this.structure === 'map') {
                return `Map<string, ${ type }`
            }
        }


        get printableDefaultValue () : string {
            const defaultValue      = this.defaultValue()

            return (defaultValue === undefined || defaultValue === null || this.type === 'string' && defaultValue === '')
                ?
                    ''
                :
                    '= ' + JSON.stringify(defaultValue)
        }


        applyValue (target : HasOptions, value : unknown) {
            target[ this.name ] = value
        }


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
                        warnings.push({
                            warning             : OptionsParseWarningCodes.ExistingValueOverwritten,
                            option              : this,
                            value               : valueEntry.value,
                            overwrittenWith     : parseRes.value
                        })

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
                if (input === undefined)
                    return { error : { error : OptionsParseErrorCodes.OptionDoesNotHaveValue, option : this } }

                return { value : input }
            }
            else if (this.type === 'number') {
                if (input === undefined)
                    return { error : { error : OptionsParseErrorCodes.OptionDoesNotHaveValue, option : this } }

                const value       = Number(input)

                if (isNaN(value)) {
                    return { error : { error : OptionsParseErrorCodes.InvalidNumericValue, option : this, input } }
                } else {
                    return { value }
                }
            }
            else if (this.type === 'enum') {
                if (input === undefined)
                    return { error : { error : OptionsParseErrorCodes.OptionDoesNotHaveValue, option : this } }

                if (!this.enumeration.some(enumMember => enumMember.toLowerCase() === input.toLowerCase())) {
                    return { error : { error : OptionsParseErrorCodes.UnknownEnumMember, option : this, input } }
                }

                return { value : this.enumeration.find(enumMember => enumMember.toLowerCase() === input.toLowerCase()) }
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


// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// export class OptionArray extends Mixin(
//     [ Option ],
//     (base : ClassUnion<typeof Option>) =>
//
//     class Option extends base {
//
//     }
// ) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export enum OptionsParseWarningCodes {
    UnknownOption               = 'UnknownOption',
    ExistingValueOverwritten    = 'ExistingValueOverwritten'
}


export enum OptionsParseErrorCodes {
    OptionDoesNotHaveValue      = 'OptionDoesNotHaveValue',
    InvalidNumericValue         = 'InvalidNumericValue',
    InvalidBooleanValue         = 'InvalidBooleanValue',
    InvalidKeyValuePair         = 'InvalidKeyValuePair',
    UnknownEnumMember           = 'UnknownEnumMember'
}

export type OptionParseError = {
    error       : OptionsParseErrorCodes,
    option      : Option,
    input?      : string
}

export type OptionParseWarning = {
    warning     : OptionsParseWarningCodes,
    option      : Option,

    value?              : unknown,
    overwrittenWith?    : unknown
}



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class HasOptions extends Mixin(
    [],
    (base : AnyConstructor) =>

    class HasOptions extends base {
        // resides in prototype
        $options        : { [ key : string ] : Option }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const initOptionsStorage = (proto : HasOptions) => {
    if (!proto.hasOwnProperty('$options')) proto.$options = Object.create(proto.$options || null)
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const option = (config? : Partial<Option>, optionCls : typeof Option = Option) : PropertyDecorator => {

    return (proto : HasOptions, propertyKey : string) : void => {
        initOptionsStorage(proto)

        const option                    = optionCls.new(Object.assign({}, config, { name : propertyKey }))

        proto.$options[ propertyKey ]   = option
        proto[ propertyKey ]            = option.defaultValue()
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type OptionTokenEntry = { key : string, value : string }

type OptionsTokenizingResult = {
    argv        : string[],
    opts        : OptionTokenEntry[]
}

function parseOptions (input : string[]) : OptionsTokenizingResult {
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type ExtractOptionsResult = { values : Map<Option, unknown>, errors : OptionParseError[], warnings : OptionParseWarning[] }

export class OptionsBag extends Base {
    input                   : string[]              = []

    $argv                   : string[]              = undefined

    $entries                : OptionTokenEntry[]    = undefined

    get argv () : string[] {
        if (this.$argv !== undefined) return this.$argv

        const parseRes          = parseOptions(this.input)

        this.$entries           = parseRes.opts

        return this.$argv       = parseRes.argv
    }

    get entries () : OptionTokenEntry[] {
        if (this.$entries !== undefined) return this.$entries

        const parseRes          = parseOptions(this.input)

        this.$argv              = parseRes.argv

        return this.$entries    = parseRes.opts
    }

    set entries (value : OptionTokenEntry[]) {
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const unknownOption = (warning : OptionParseWarning) : XmlElement => <div>
    <span class="log_message_warn"> WARNING </span> Unknown option: <span class="accented">--{ warning.option.name }</span>
</div>

const existingValueOverwritten = (warning : OptionParseWarning) : XmlElement => <div>
    <span class="log_message_warn"> WARNING </span> The value of option <span class="accented">--{ warning.option.name }</span>,
    { ' ' }<span class="accented_value">{ warning.value }</span> is overwritten with <span class="accented_value">{ warning.overwrittenWith }</span>
</div>

export const optionWarningTemplateByCode = new Map<OptionsParseWarningCodes, (warning : OptionParseWarning) => XmlElement>([
    [ OptionsParseWarningCodes.UnknownOption, unknownOption ],
    [ OptionsParseWarningCodes.ExistingValueOverwritten, existingValueOverwritten ]
])


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const optionDoesNotHaveValue = (error : OptionParseError) : XmlElement => <div>
    <span class="log_message_error"> ERROR </span> Missing value for option <span class="accented">--{ error.option.name }</span>
</div>

const unknownEnumMember = (error : OptionParseError) : XmlElement => <div>
    <p><span class="log_message_error"> ERROR </span> Unknown value <span class="accented_value">{ error.input }</span> for enumeration option <span class="accented">--{ error.option.name }</span></p>
    <ul>
        Known values are:
        { error.option.enumeration.map(enumEntry => <li>- <span class="accented_value">{ enumEntry }</span></li>) }
    </ul>
</div>

const invalidNumericValue = (error : OptionParseError) : XmlElement => <div>
    <p><span class="log_message_error"> ERROR </span> Invalid numeric value <span class="accented_value">{ error.input }</span> for option <span class="accented">--{ error.option.name }</span></p>
</div>

const invalidBooleanValue = (error : OptionParseError) : XmlElement => <div>
    <p><span class="log_message_error"> ERROR </span> Invalid boolean value <span class="accented_value">{ error.input }</span> for option <span class="accented">--{ error.option.name }</span></p>
</div>

export const optionErrorTemplateByCode = new Map<OptionsParseErrorCodes, (warning : OptionParseError) => XmlElement>([
    [ OptionsParseErrorCodes.OptionDoesNotHaveValue, optionDoesNotHaveValue ],
    [ OptionsParseErrorCodes.UnknownEnumMember, unknownEnumMember ],
    [ OptionsParseErrorCodes.InvalidNumericValue, invalidNumericValue ],
    [ OptionsParseErrorCodes.InvalidBooleanValue, invalidBooleanValue ],
    // TODO
    [ OptionsParseErrorCodes.InvalidKeyValuePair, () => <div></div> ],
])


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const camelCaseToSnakeCase = (str : string, snakeChar : string = '_') : string =>
    str.replace(/([A-Z])/g, (match : string, p1 : string) => snakeChar + p1.toLowerCase())
