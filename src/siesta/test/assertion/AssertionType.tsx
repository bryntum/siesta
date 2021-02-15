import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { SiestaJSX } from "../../../jsx/Factory.js"
import { Assertion, TestNodeResult } from "../TestResult.js"
import { GotExpectTemplate } from "./AssertionCompare.js"


//---------------------------------------------------------------------------------------------------------------------
export class AssertionType extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class AssertionType extends base {

        //----------------------------------------------------
        assertDefinedInternal (
            assertionName   : string,
            negated         : boolean,
            inverted        : boolean,
            value           : unknown,
            description     : string = ''
        ) {
            const condition1    = value !== undefined
            const condition2    = inverted ? !condition1 : condition1

            const passed        = negated ? !condition2 : condition2

            const title         = (negated && inverted) ? 'defined' : negated || inverted ? 'undefined' : 'defined'

            this.addResult(Assertion.new({
                name            : negated ? this.negateExpectationName(assertionName) : assertionName,
                passed,
                description,
                annotation      : passed ? undefined : GotExpectTemplate.el({
                    description         : `Expected is ${ title } value`,
                    got                 : value,
                    t                   : this
                })
            }))
        }


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
