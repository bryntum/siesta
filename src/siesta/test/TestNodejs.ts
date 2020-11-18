import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { Test } from "./Test.js"


//---------------------------------------------------------------------------------------------------------------------
export class TestNodejs extends Mixin(
    [ Test ],
    (base : AnyConstructor<Test, typeof Test>) =>

    class TestNodejs extends base {
    }
) {}
