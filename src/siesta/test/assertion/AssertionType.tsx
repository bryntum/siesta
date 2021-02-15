import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { SiestaJSX } from "../../../jsx/Factory.js"
import { TestNodeResult } from "../TestResult.js"


//---------------------------------------------------------------------------------------------------------------------
export class AssertionType extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionType extends base {

        //----------------------------------------------------
        // region truthy assertions
        assertTypeInternal (
            assertionName   : string,
            negated         : boolean,
            value           : unknown,
            type            : String,
            description     : string = ''
        ) {
            // const passed        = negated || inverted ? !Boolean(value) : Boolean(value)
            //
            // this.addResult(Assertion.new({
            //     name            : negated ? this.negateExpectationName(assertionName) : assertionName,
            //     passed,
            //     description,
            //     annotation      : passed ? undefined : GotExpectTemplate.el({
            //         description         : `Expected is${ negated ? ' not ' : '' } ${ inverted ? '"falsy"' : '"truthy"' } value`,
            //         got                 : value,
            //         t                   : this
            //     })
            // }))
        }


        false<V> (value : V, description : string = '') {
            // this.assertTrueInternal('false(received)', false, true, value, description)
        }

    }
) {}
