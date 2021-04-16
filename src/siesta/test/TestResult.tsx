import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { OutputType } from "../../context/ExecutionContext.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../../jsx/XmlElement.js"
import { LogLevel } from "../../logger/Logger.js"
import { serializable, Serializable } from "../../serializable/Serializable.js"
import { escapeRegExp } from "../../util/Helpers.js"
import { LUID, luid } from "../common/LUID.js"
import { TestDescriptor } from "./TestDescriptor.js"

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
        type        : 'log' | 'console' | 'output'  = 'log'

        outputType  : OutputType    = undefined

        level       : LogLevel      = LogLevel.log

        message     : XmlNode[]     = undefined


        template (includeIcon : boolean = true) : XmlElement {
            let tagText : string
            let classSuffix : string

            const logLevelName  = LogLevel[ this.level ]

            if (this.type === 'log') {
                tagText         = logLevelName.toUpperCase()
                classSuffix     = logLevelName.toLowerCase()
            }
            else if (this.type === 'console') {
                tagText         = `CONSOLE.${ logLevelName.toUpperCase() }`
                classSuffix     = logLevelName.toLowerCase()
            }
            else {
                tagText         = this.outputType === 'stdout' ? 'STD_OUT' : 'STD_ERR'
                classSuffix     = this.outputType === 'stdout' ? 'log' : 'error'
            }

            return <div class="log_message">
                { includeIcon ? [ <span class='log_message_icon'>ⓘ</span>, ' ' ] : null }
                <span class={ `log_message_${ classSuffix }` }> { tagText } </span>
                { ' ' }
                { this.message }
            </div>
        }
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
export type SourcePoint = { line : number, char : number }


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

        sourcePoint     : SourcePoint       = undefined

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

export type TestResultLeafConstructor  = typeof Exception | typeof LogMessage | typeof Assertion | typeof AssertionAsyncCreation

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

            return this.$sourceLineExtractor = new RegExp(escapeRegExp(this.url) + ':(\\d+):(\\d+)')
        }


        negateExpectationName (name : string) : string {
            return name.replace(/^(expect\(.+?\)\.)/, '$1not.')
        }


        // this is here to be available for the assertion mixins
        getSourcePoint () : SourcePoint | undefined {
            const stack         = new Error().stack

            if (stack) {
                const match     = stack.match(this.sourceLineExtractor)

                if (match) return { line : Number(match[ 1 ]), char : Number(match[ 2 ]) }
            }

            return undefined
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

            this.$passed    = undefined

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
                if ((result instanceof Exception) && !this.isTodo) passed = false

                if ((result instanceof Assertion) && !result.passed && !this.isTodo) passed = false

                if ((result instanceof TestNodeResult) && !result.passed && !this.isTodo) passed = false
            })

            return this.$passed     = passed
        }


        // // does not take `isTodo` into account
        // $passedRaw   : boolean       = undefined
        //
        // get passedRaw () : boolean {
        //     if (this.$passedRaw !== undefined) return this.$passedRaw
        //
        //     let passedRaw : boolean    = true
        //
        //     this.resultLog.forEach(result => {
        //         if ((result instanceof Exception)) passedRaw = false
        //
        //         if ((result instanceof Assertion) && !result.passed) passedRaw = false
        //
        //         if ((result instanceof TestNodeResult) && !result.passedRaw) passedRaw = false
        //     })
        //
        //     return this.$passedRaw     = passedRaw
        // }


        $childNodes   : TestNodeResult[]       = undefined

        get childNodes () : TestNodeResult[] {
            if (this.$childNodes !== undefined) return this.$childNodes

            return this.$childNodes = (this.resultLog as TestNodeResult[]).filter(result => {
                return result instanceof TestNodeResult
            })
        }


        collectParents (rootFirst : boolean = false) : this[ 'parentNode' ][] {
            const parents   : this[ 'parentNode' ][]    = []

            let node : TestNodeResult       = this.parentNode

            while (node) {
                parents.push(node)

                node    = node.parentNode
            }

            if (rootFirst) parents.reverse()

            return parents
        }


        $isTodo           : boolean    = undefined

        get isTodo () : boolean {
            if (this.$isTodo !== undefined) return this.$isTodo

            const snoozeConfig      = new Date(this.descriptor.snooze)
            const snoozeDate        = isNaN(snoozeConfig.getTime()) ? undefined : snoozeConfig

            return this.$isTodo = this.descriptor.isTodo || (snoozeDate && (snoozeDate > new Date()) || false)
        }

        set isTodo (value : boolean) {
            this.descriptor.isTodo      = value
            this.$isTodo                = undefined
        }


        * eachResultLeafOfClass<Cls extends TestResultLeafConstructor> (resultClass : Cls) : Generator<InstanceType<Cls>> {
            for (const result of this.resultLog) {
                if (result instanceof resultClass) yield result as InstanceType<Cls>

                if (result instanceof TestNodeResult) yield* result.eachResultLeafOfClass(resultClass)
            }
        }
    }

    return TestNodeResult
}) {}