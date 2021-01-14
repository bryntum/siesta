import { it } from "../../main.js"
import { Option, OptionsBag, OptionsParseErrorCodes, OptionsParseWarningCodes } from "../../src/siesta/launcher/Option.js"

const string    = Option.new({ name : 'string', type : 'string' })
const number    = Option.new({ name : 'number', type : 'number' })
const boolean   = Option.new({ name : 'boolean', type : 'boolean' })


it('Should be able to parse options', async t => {
    const bag       = OptionsBag.new({
        input   : [ 'argv1', '--string=str', 'argv2', '--number', '123', '--boolean', 'true', 'argv3' ]
    })

    t.isDeeply(
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


it('Should detect errors in invalid input', async t => {
    const bag2       = OptionsBag.new({
        input   : [ '--number', 'foo', '--boolean', 'bar' ]
    })

    t.isDeeply(
        bag2.extractOptions([ string, number, boolean ]),
        {
            errors      : [
                { error : OptionsParseErrorCodes.InvalidNumericValue, input : 'foo', option : number },
                { error : OptionsParseErrorCodes.InvalidBooleanValue, input : 'bar', option : boolean }
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

    t.isDeeply(
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

    t.isDeeply(
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

    t.isDeeply(bag2.entries, [], 'Should remove all duplicated entries')
})


