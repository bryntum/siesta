import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"

//---------------------------------------------------------------------------------------------------------------------
export class Result extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Result extends base {
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class LogMessage extends Mixin(
    [ Result ],
    (base : AnyConstructor<Result, typeof Result>) =>

    class LogMessage extends base {
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class Exception extends Mixin(
    [ Result ],
    (base : AnyConstructor<Result, typeof Result>) =>

    class Exception extends base {
        exception       : Error         = undefined
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class Assertion extends Mixin(
    [ Result ],
    (base : AnyConstructor<Result, typeof Result>) =>

    class Assertion extends base {
        name            : string            = ''



    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class AssertionAsync extends Mixin(
    [ Assertion ],
    (base : AnyConstructor<Assertion, typeof Assertion>) =>

    class AssertionAsync extends base {
        ongoing     : Promise<any>                          = undefined

        state       : 'pending' | 'resolved' | 'rejected'   = 'pending'
    }
) {}
