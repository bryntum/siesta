import { CI } from "../../src/iterator/Iterator.js"
import { GotExpectTemplate } from "../../src/siesta/test/assertion/AssertionCompare.js"
import { Test } from "../../src/siesta/test/Test.js"
import { Assertion } from "../../src/siesta/test/TestResult.js"

export const verifyAllFailed = (todoTest : Test, topTest : Test) => {
    CI(todoTest.eachAssertion()).forEach(assertion => {

        if (assertion.passed) {
            topTest.addResult(Assertion.new({
                name        : 'All assertions should fail',
                passed      : false,

                annotation  : GotExpectTemplate.el({
                    gotTitle        : 'Passed assertion',
                    got             : assertion,

                    t               : topTest
                })
            }))
        }
    })
}
