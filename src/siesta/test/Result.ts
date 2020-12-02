import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { LogLevel } from "../../logger/Logger.js"
import { exclude, registerSerializableClass, Serializable } from "../../serializable/Serializable.js"
import { TestDescriptor } from "./Descriptor.js"
import { InternalId, nextInternalId } from "./InternalIdSource.js"

//---------------------------------------------------------------------------------------------------------------------
export class Result extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) =>

    class Result extends base {
        internalId      : number            = nextInternalId()
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
export type TestNodeState   = 'created' | 'running' | 'completed'

// TODO `TestNodeResult` is supposed to be not serializable currently
// this is to avoid resolving references, like `parentNode`
export class TestNodeResult extends Mixin(
    [ Result ],
    (base : ClassUnion<typeof Result>) => {

    class TestNodeResult extends base {
        // TODO should probably have separate flag for assertions??
        // (I guess still valid to throw exceptions even if can not add assertions??)
        frozen          : boolean           = false

        state           : TestNodeState     = 'created'

        descriptor      : TestDescriptor    = undefined

        parentNode      : TestNodeResult

        resultLog       : Result[]          = []

        resultMap       : Map<InternalId, number>   = new Map()

        $root           : TestNodeResult    = undefined

        get root () : TestNodeResult {
            if (this.$root !== undefined) return this.$root

            let root : TestNodeResult       = this

            while (root.parentNode) root    = root.parentNode

            return this.$root = root
        }


        addResult (result : Result) {
            if (this.frozen) throw new Error("Adding result after test finalization")

            if (result instanceof TestNodeResult) this.$childNodes = undefined

            this.resultLog.push(result)
            this.resultMap.set(result.internalId, this.resultLog.length - 1)
        }


        updateResult (result : Result) {
            if (this.frozen) throw new Error("Updating result after test finalization")

            if (!this.resultMap.has(result.internalId)) throw new Error("Result to update does not exists")

            this.resultLog[ this.resultMap.get(result.internalId) ] = result
        }


        pass (description : string = '', annotation : string = '') {
            this.addResult(Assertion.new({
                name            : 'pass',
                passed          : true,
                description,
                annotation
            }))
        }


        fail (description : string = '', annotation : string = '') {
            this.addResult(Assertion.new({
                name            : 'fail',
                passed          : false,
                description,
                annotation
            }))
        }


        toJSON () {
            const obj : any     = Object.assign({}, this)

            obj.parentNode      = this.parentNode ? this.parentNode.internalId : undefined

            return obj
        }


        $passed   : boolean       = undefined

        get passed () : boolean {
            if (this.$passed !== undefined) return this.$passed

            let passed : boolean    = true

            this.resultLog.forEach(result => {
                if (result instanceof Exception) passed = false

                if ((result instanceof Assertion) && !result.passed) passed = false

                if ((result instanceof TestNodeResult) && !result.passed) passed = false
            })

            return this.$passed     = passed
        }


        $childNodes   : TestNodeResult[]       = undefined

        get childNodes () : TestNodeResult[] {
            if (this.$childNodes !== undefined) return this.$childNodes

            return this.$childNodes = (this.resultLog as TestNodeResult[]).filter(result => {
                return result instanceof TestNodeResult
            })
        }
    }

    return TestNodeResult
}) {}
