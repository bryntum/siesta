import { it } from "../../index.js"
import { Option, OptionsBag, OptionsParseErrorCodes, OptionsParseWarningCodes } from "../../src/siesta/option/Option.js"

const string        = Option.new({ name : 'string', type : 'string' })
const number        = Option.new({ name : 'number', type : 'number' })
const boolean       = Option.new({ name : 'boolean', type : 'boolean' })
const stringArray   = Option.new({ name : 'string', type : 'string', structure : 'array' })
const enumArray     = Option.new({ name : 'enumArray', type : 'enum', structure : 'array', enumeration : [ 'enum1', 'enum2' ] })


it('Should be able to parse options', async t => {
    const bag       = OptionsBag.new({
        input   : [ 'argv1', '--string=str', 'argv2', '--number', '123', '--boolean', 'true', 'argv3' ]
    })

    t.equal(
        bag.extractOptions([ string, number, boolean ]),
        {
            errors      : [],
            warnings    : [],
            values      : new Map<Option, unknown>([
                [ string, 'str' ],
                [ number, 123 ],
                [ boolean, true ],
            ])
        },
        'Basics should work'
    )
})


it('Should be able to parse array options with single element', async t => {
    const bag       = OptionsBag.new({
        input   : [ '--string=str1' ]
    })

    t.equal(
        bag.extractOptions([ stringArray, number, boolean ]),
        {
            errors      : [],
            warnings    : [],
            values      : new Map<Option, unknown>([
                [ stringArray, [ 'str1' ] ]
            ])
        }
    )
})


it('Should be able to parse array options with many elements', async t => {
    const bag       = OptionsBag.new({
        input   : [ '--string=str1', '--string=str2' ]
    })

    t.equal(
        bag.extractOptions([ stringArray, number, boolean ]),
        {
            errors      : [],
            warnings    : [],
            values      : new Map<Option, unknown>([
                [ stringArray, [ 'str1', 'str2' ] ]
            ])
        }
    )
})


it('Should be able to parse enum array options', async t => {
    const bag       = OptionsBag.new({
        input   : [ '--enum-array=enum1', '--enum-array=enum2' ]
    })

    t.equal(
        bag.extractOptions([ enumArray, stringArray, number, boolean ]),
        {
            errors      : [],
            warnings    : [],
            values      : new Map<Option, unknown>([
                [ enumArray, [ 'enum1', 'enum2' ] ]
            ])
        }
    )
})


it('Should detect errors in invalid input', async t => {
    const bag2       = OptionsBag.new({
        input   : [ '--number', 'foo', '--boolean', 'bar', '--string' ]
    })

    t.equal(
        bag2.extractOptions([ string, number, boolean ]),
        {
            errors      : [
                { error : OptionsParseErrorCodes.InvalidNumericValue, input : 'foo', option : number },
                { error : OptionsParseErrorCodes.InvalidBooleanValue, input : 'bar', option : boolean },
                { error : OptionsParseErrorCodes.OptionDoesNotHaveValue, option : string }
            ],
            warnings    : [],
            values      : new Map<Option, unknown>()
        },
        'Should detect invalid input'
    )
})


it('Should set boolean options w/o value to true', async t => {
    const bag2       = OptionsBag.new({
        input   : [ '--string=str', 'argv2', '--number', '123', '--boolean' ]
    })

    t.equal(
        bag2.extractOptions([ boolean ]),
        {
            errors      : [],
            warnings    : [],
            values      : new Map<Option, unknown>([
                [ boolean, true ]
            ])
        }
    )
})


it('Should detect overwritten values', async t => {
    const bag2       = OptionsBag.new({
        input   : [ '--string=string', '--string=strung' ]
    })

    t.equal(
        bag2.extractOptions([ string ]),
        {
            errors      : [],
            warnings    : [
                { warning : OptionsParseWarningCodes.ExistingValueOverwritten, option : string, value : 'string', overwrittenWith : 'strung' },
            ],
            values      : new Map<Option, unknown>([
                [ string, 'strung' ]
            ])
        },
        'Should detect invalid input'
    )

    t.equal(bag2.entries, [], 'Should remove all duplicated entries')
})


