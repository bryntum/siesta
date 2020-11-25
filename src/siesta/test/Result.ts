import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { LogLevel } from "../../logger/Logger.js"
import { registerSerializableClass, Serializable } from "../../serializable/Serializable.js"
import { TreeNode } from "../../tree/TreeNode.js"

//---------------------------------------------------------------------------------------------------------------------
export class Result extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) =>

    class Result extends base {
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class LogMessage extends Mixin(
    [ Result ],
    (base : AnyConstructor<Result, typeof Result>) =>

    class LogMessage extends base {
        level       : LogLevel      = LogLevel.log

        message     : string        = ''
    }
) {}

registerSerializableClass('LogMessage', LogMessage)

//---------------------------------------------------------------------------------------------------------------------
export class Exception extends Mixin(
    [ Result ],
    (base : AnyConstructor<Result, typeof Result>) =>

    class Exception extends base {
        exception       : Error         = undefined
    }
) {}

registerSerializableClass('Exception', Exception)

//---------------------------------------------------------------------------------------------------------------------
export class Assertion extends Mixin(
    [ Result ],
    (base : AnyConstructor<Result, typeof Result>) =>

    class Assertion extends base {
        name            : string            = ''

        passed          : boolean           = true

        description     : string            = ''

        annotation      : string            = ''
    }
) {}

registerSerializableClass('Assertion', Assertion)

//---------------------------------------------------------------------------------------------------------------------
export class AssertionAsync extends Mixin(
    [ Assertion ],
    (base : AnyConstructor<Assertion, typeof Assertion>) =>

    class AssertionAsync extends base {
        ongoing     : Promise<any>                          = undefined

        state       : 'pending' | 'resolved' | 'rejected'   = 'pending'


        toJSON (key : string) : Partial<this> {
            const jsonObj       = super.toJSON(key)

            delete jsonObj.ongoing

            return jsonObj
        }
    }
) {}

registerSerializableClass('AssertionAsync', AssertionAsync)

//---------------------------------------------------------------------------------------------------------------------
export class TestNodeResult extends Mixin(
    [ Result, TreeNode ],
    (base : ClassUnion<typeof Result, typeof TreeNode>) =>

    class TestNodeResult extends base {
        id              : string

        // "promote" types from TreeNode
        parentNode      : TestNodeResult
        childNodes      : TestNodeResult[]

        assertions      : Assertion[]       = []


        addAssertion (assertion : Assertion) {
            this.assertions.push(assertion)
        }


        pass (description : string = '', annotation : string = '') {
            this.addAssertion(Assertion.new({
                name            : 'pass',
                passed          : true,
                description,
                annotation
            }))
        }


        fail (description : string = '', annotation : string = '') {
            this.addAssertion(Assertion.new({
                name            : 'fail',
                passed          : false,
                description,
                annotation
            }))
        }


        toJSON () {
            const obj : any     = Object.assign({}, this)

            obj.parentNode      = this.parentNode ? this.parentNode.id : undefined

            return obj
        }
    }
) {}
