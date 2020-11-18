import { Base } from "../../../class/Base.js"
import { AnyConstructor, Mixin } from "../../../class/Mixin.js"
import { Assertion } from "../Result.js"
import { SubTest } from "../Test.js"

//---------------------------------------------------------------------------------------------------------------------
export class Reporter extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Reporter extends base {

        onTestSuiteStart () {

        }


        onTestSuiteFinish () {

        }


        onTopTestStart () {

        }


        onTopTestFinish () {

        }


        onSubTestStart () {

        }


        onSubTestFinish () {

        }


        onException () {

        }


        onLogMessage () {

        }


        onAssertionStarted (test : SubTest, assertion : Assertion) {
            console.log("Assertion: ", assertion.name, "passed : ", assertion.passed)
        }


        onAssertionFinished (test : SubTest, assertion : Assertion) {
        }
    }
) {}


