import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { LogLevel } from "../../logger/Logger.js"
import { serializable, Serializable } from "../../serializable/Serializable.js"
import { escapeRegExp } from "../../util/Helpers.js"
import { XmlElement } from "../jsx/XmlElement.js"
import { TestDescriptor } from "./Descriptor.js"
import { LUID, luid } from "./LUID.js"

//---------------------------------------------------------------------------------------------------------------------
export class Result extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Result extends base {
        localId     : number            = luid()
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class LogMessage extends Mixin(
    [ Serializable, Result ],
    (base : ClassUnion<typeof Serializable, typeof Result>) =>

    class LogMessage extends base {
        level       : LogLevel      = LogLevel.log

        message     : string        = ''
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class Exception extends Mixin(
    [ Serializable, Result ],
    (base : ClassUnion<typeof Serializable, typeof Result>) =>

    class Exception extends base {
        exception       : unknown           = undefined

        stack           : string            = ''

        initialize (props? : Partial<Exception>) {
            super.initialize(props)

            // @ts-ignore
            this.stack      = this.exception?.stack
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class Assertion extends Mixin(
    [ Serializable, Result ],
    (base : ClassUnion<typeof Serializable, typeof Result>) =>

    class Assertion extends base {
        name            : string            = ''

        $passed         : boolean           = true

        get passed () : boolean {
            return this.$passed
        }

        set passed (value : boolean) {
            this.$passed = value
        }

        description     : string            = ''

        sourceLine      : number            = undefined

        annotation      : XmlElement        = undefined
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class AssertionAsyncCreation extends Mixin(
    [ Assertion, Serializable, Result ],
    (base : ClassUnion<typeof Assertion, typeof Serializable, typeof Result>) => {

    class AssertionAsyncCreation extends base {
        resolution      : AssertionAsyncResolution  = undefined

        get passed () : boolean {
            return this.resolution.passed
        }

        set passed (value : boolean) {
        }
    }
    return AssertionAsyncCreation
}) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class AssertionAsyncResolution extends Mixin(
    [ Serializable, Result ],
    (base : ClassUnion<typeof Serializable, typeof Result>) => {

    class AssertionAsyncResolution extends base {
        creationId      : LUID              = undefined

        passed          : boolean           = true

        timeoutHappened : boolean           = false
    }
    return AssertionAsyncResolution
}) {}



//---------------------------------------------------------------------------------------------------------------------
export type TestNodeState   = 'created' | 'running' | 'completed'

// serializable leaf nodes
export type TestResultLeaf  = Exception | LogMessage | Assertion | AssertionAsyncCreation

// non-serializable tree node - the serializable part is `descriptor`
export type TestResultTree  = TestNodeResult

export type TestResult      = TestResultLeaf | TestResultTree


export class TestNodeResult extends Mixin(
    [ Result ],
    (base : ClassUnion<typeof Result>) => {

    class TestNodeResult extends base {
        // TODO should probably have separate flag for assertions??
        // (I guess still valid to throw exceptions even if can not add assertions??)
        frozen          : boolean           = false

        state           : TestNodeState     = 'created'

        descriptor      : TestDescriptor    = undefined

        parentNode      : TestNodeResult    = undefined

        resultLog       : TestResult[]      = []

        resultMap       : Map<LUID, TestResult> = new Map()


        get url () : string {
            return this.root.descriptor.url
        }

        $sourceLineExtractor       : RegExp            = undefined

        get sourceLineExtractor () : RegExp {
            if (this.$sourceLineExtractor !== undefined) return this.$sourceLineExtractor

            return this.$sourceLineExtractor = new RegExp(escapeRegExp(this.url) + ':(\\d+)')
        }


        // this is here to be available for the assertion mixins
        getSourceLine () : number | undefined {
            const stack         = new Error().stack

            if (stack) {
                const match     = stack.match(this.sourceLineExtractor)

                if (match) return Number(match[ 1 ])
            }

            return undefined
        }


        $depth           : number    = undefined

        get depth () : number {
            if (this.$depth !== undefined) return this.$depth

            let depth                   = 0
            let node : TestNodeResult   = this

            while (node.parentNode) { node = node.parentNode; depth++ }

            return this.$depth = depth
        }


        get isRoot () : boolean {
            return !this.parentNode
        }


        $root           : TestNodeResult    = undefined

        get root () : TestNodeResult {
            if (this.$root !== undefined) return this.$root

            let root : TestNodeResult       = this

            while (root.parentNode) root    = root.parentNode

            return this.$root = root
        }


        addResult (result : TestResult) : TestResult {
            if (this.frozen) throw new Error("Adding result after test finalization")

            // clear the `$childNodes` cache
            if (result instanceof TestNodeResult) this.$childNodes = undefined

            this.resultLog.push(result)
            this.resultMap.set(result.localId, result)

            return result
        }


        addAsyncResolution (resolution : AssertionAsyncResolution) : AssertionAsyncResolution {
            if (this.frozen) throw new Error("Adding async resolution after test finalization")

            if (!this.resultMap.has(resolution.creationId)) throw new Error("Result to update does not exists")

            const creation  = this.resultMap.get(resolution.creationId) as AssertionAsyncCreation

            creation.resolution = resolution

            return resolution
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
