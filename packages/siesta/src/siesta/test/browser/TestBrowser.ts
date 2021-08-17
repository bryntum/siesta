import { AnyConstructor, Mixin } from "../../../class/Mixin.js"
import { UserAgent } from "../../user_agent/UserAgent.js"
import { Test } from "../Test.js"


//---------------------------------------------------------------------------------------------------------------------
export class TestBrowser extends Mixin(
    [ Test ],
    (base : AnyConstructor<Test, typeof Test>) =>

    class TestBrowser extends base {

        userAgent           : UserAgent     = undefined
    }
) {}
