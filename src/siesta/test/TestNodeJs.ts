import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { UserAgent } from "../user_agent/UserAgent.js"
import { Test } from "./Test.js"


//---------------------------------------------------------------------------------------------------------------------
export class TestNodeJs extends Mixin(
    [ Test ],
    (base : AnyConstructor<Test, typeof Test>) =>

    class TestNodeJs extends base {
    }
) {}
