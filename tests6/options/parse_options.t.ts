import { it } from "../../main.js"
import { Option, parseOptions } from "../../src/siesta/project/Option.js"

const string    = Option.new({ name : 'string', type : 'string' })
const number    = Option.new({ name : 'number', type : 'number' })
const boolean   = Option.new({ name : 'boolean', type : 'boolean' })



it('Should be able to parse options', async t => {

    t.isDeeply(
        parseOptions([ 'argv1', '--string=str', 'argv2', '--number', '123', '--boolean=', 'true', 'argv3' ], { string, number, boolean }),
        {
            argv        : [ 'argv1', 'argv2', 'argv3' ],
            errors      : [],
            warnings    : [],
            opts        : new Map([
                [ 'string', { option : string, value : 'str' } ],
                [ 'number', { option : number, value : 123 } ],
                [ 'boolean', { option : boolean, value : true } ],
            ])
        }
    )
})


