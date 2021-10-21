import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { OutputType } from "../../context/ExecutionContext.js"
import { CI } from "../../iterator/Iterator.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../../jsx/XmlElement.js"
import { LogLevel } from "../../logger/Logger.js"
import { serializable, Serializable } from "../../serializable/Serializable.js"
import { TreeNode } from "../../tree/TreeNode.js"
import { escapeRegExp } from "../../util/Helpers.js"
import { LUID, luid } from "../common/LUID.js"
import { TestDescriptor } from "./TestDescriptor.js"
import { TestNodeResultReactive } from "./TestResultReactive.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Result extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Result extends base {
        localId     : number            = luid()
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'LogMessage' })
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'Exception' })
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type SourcePoint = { line : number, char : number }


@serializable({ id : 'Assertion' })
export class Assertion extends Mixin(
    [ Serializable, Result ],
    (base : ClassUnion<typeof Serializable, typeof Result>) =>

    class Assertion extends base {
        name            : string            = ''

        passed          : boolean           = true

        negated         : boolean           = false

        description     : string            = ''

        sourcePoint     : SourcePoint       = undefined

        annotation      : XmlElement        = undefined
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'AssertionAsyncCreation' })
export class AssertionAsyncCreation extends Mixin(
    [ Assertion ],
    (base : ClassUnion<typeof Assertion>) =>

    class AssertionAsyncCreation extends base {
        $resolution     : AssertionAsyncResolution          = undefined

        get resolution () : AssertionAsyncResolution | null {
            return this.$resolution
        }
        set resolution (value : AssertionAsyncResolution) {
            this.$resolution    = value
        }

        get isRunning () : boolean {
            return !this.resolution
        }

        // @ts-ignore
        get passed () : boolean | undefined {
            return this.resolution?.passed
        }
        set passed (value : boolean) {
        }

        // @ts-ignore
        get annotation () : XmlElement {
            return this.resolution?.annotation
        }
        set annotation (value : boolean) {
        }
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'AssertionAsyncResolution' })
export class AssertionAsyncResolution extends Mixin(
    [ Serializable, Result ],
    (base : ClassUnion<typeof Serializable, typeof Result>) =>

    class AssertionAsyncResolution extends base {
        creationId      : LUID                      = undefined

        passed          : boolean                   = true

        annotation      : XmlElement                = undefined
    }
) {}



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type TestNodeState   = 'created' | 'running' | 'completed' | 'ignored'

// serializable leaf nodes
export type TestResultLeaf              = Exception | LogMessage | Assertion | AssertionAsyncCreation

export type TestResultLeafConstructor   = typeof Exception | typeof LogMessage | typeof Assertion | typeof AssertionAsyncCreation

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type TestResult                  = TestNodeResult | TestResultLeaf

export type TestResultConstructor       = typeof TestNodeResult | TestResultLeafConstructor


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestNodeResult extends Mixin(
    [ Result ],
    (base : ClassUnion<typeof Result>) =>

    class TestNodeResult extends base {
        // TODO should probably have separate flag for assertions??
        // (I guess still valid to throw exceptions even if can not add assertions??)
        frozen          : boolean           = false

        state           : TestNodeState     = 'created'

        descriptor      : TestDescriptor    = undefined

        parentNode      : TestNodeResult    = undefined

        resultLog       : TestResult[]      = []

        asyncAssertionsMapping  : Map<LUID, AssertionAsyncCreation>     = new Map()


        get url () : string {
            return this.root.descriptor.url
        }

        $sourceLineExtractor       : RegExp            = undefined

        get sourceLineExtractor () : RegExp {
            if (this.$sourceLineExtractor !== undefined) return this.$sourceLineExtractor

            return this.$sourceLineExtractor = new RegExp(escapeRegExp(this.url) + ':(\\d+):(\\d+)')
        }


        get isAssertionNegated () : boolean {
            return false
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


        resetChildNodesCache () {
            this.$childNodes            = undefined
            this.$childResultsIndex     = undefined
        }


        addResult<T extends TestResult> (result : T) : T {
            if (this.frozen) throw new Error("Adding result after test finalization")

            // clear the `$childNodes` cache
            if (result instanceof TestNodeResult) this.resetChildNodesCache()

            if (result instanceof AssertionAsyncCreation) this.asyncAssertionsMapping.set(result.localId, result)

            this.$passed    = undefined

            this.doAddResult(result)

            return result
        }


        doAddResult<T extends TestResult> (result : T) {
            this.resultLog.push(result)
        }


        addAsyncResolution (resolution : AssertionAsyncResolution) : AssertionAsyncResolution {
            if (this.frozen) throw new Error("Adding async resolution after test finalization")

            const creation      = this.asyncAssertionsMapping.get(resolution.creationId)

            creation.resolution = resolution

            return resolution
        }


        $passed   : boolean       = undefined

        get passed () : boolean {
            if (this.$passed !== undefined) return this.$passed

            return this.$passed     = this.calculatePassed()
        }


        calculatePassed () : boolean {
            let passed : boolean    = true

            this.resultLog.forEach(result => {
                if ((result instanceof Exception) && !this.isTodo) passed = false

                if (
                    (result instanceof Assertion) && (!(result instanceof AssertionAsyncCreation) || !result.isRunning)
                    && !result.passed && !this.isTodo
                ) {
                    passed = false
                }

                if ((result instanceof TestNodeResult) && !result.passed && !this.isTodo) passed = false
            })

            return passed
        }


        // does not take `isTodo` into account
        $passedRaw   : boolean       = undefined

        get passedRaw () : boolean {
            if (this.$passedRaw !== undefined) return this.$passedRaw

            let passedRaw : boolean    = true

            this.resultLog.forEach(result => {
                if ((result instanceof Exception)) passedRaw = false

                if ((result instanceof Assertion) && (!(result instanceof AssertionAsyncCreation) || !result.isRunning) && !result.passed) passedRaw = false

                if ((result instanceof TestNodeResult) && !result.passedRaw) passedRaw = false
            })

            return this.$passedRaw     = passedRaw
        }


        $childNodes   : TestNodeResult[]       = undefined

        get childNodes () : TestNodeResult[] {
            if (this.$childNodes !== undefined) return this.$childNodes

            return this.$childNodes = (this.resultLog as TestNodeResult[]).filter(result => result instanceof TestNodeResult)
        }


        $childResultsIndex : ChildResultsIndex<TestNodeResult>      = undefined

        get childResultsIndex () : this[ '$childResultsIndex' ] {
            if (this.$childResultsIndex !== undefined) return this.$childResultsIndex

            const index : ChildResultsIndex<TestNodeResult>   = {
                idToChild       : new Map(),
                childToId       : new Map()
            }

            const titleCounters                 = new Map<string, number>()

            CI(this.eachResultOfClass(TestNodeResult)).forEach(result => {
                const title         = result.descriptor.title

                let counter         = titleCounters.get(title) ?? -1

                counter++

                titleCounters.set(title, counter)

                const id            = `${ title }::${ counter }`

                index.idToChild.set(id, result)
                index.childToId.set(result, id)
            })

            return this.$childResultsIndex = index
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

            return this.$isTodo = this.descriptor.isTodo || (snoozeDate && (snoozeDate > new Date()))
        }

        set isTodo (value : boolean) {
            this.descriptor.isTodo      = value
            this.$isTodo                = undefined
        }


        * eachResultOfClass<Cls extends TestResultConstructor> (resultClass : Cls) : Generator<InstanceType<Cls>> {
            for (const result of this.resultLog) {
                if (result instanceof resultClass) yield result as InstanceType<Cls>
            }
        }


        * eachResultOfClassDeep<Cls extends TestResultConstructor> (resultClass : Cls) : Generator<InstanceType<Cls>> {
            for (const result of this.resultLog) {
                if (result instanceof resultClass) yield result as InstanceType<Cls>

                if (result instanceof TestNodeResult) yield* result.eachResultOfClassDeep(resultClass)
            }
        }


        * eachParent () : Generator<this[ 'parentNode' ]> {
            const parentNode        = this.parentNode

            if (parentNode) {
                yield parentNode
                yield* parentNode.eachParent()
            }
        }


        get assertions () : Assertion[] {
            return Array.from(this.eachResultOfClass(Assertion))
        }
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type ChildResultsIndex<T extends TestNodeResult> = {
    idToChild       : Map<string, T>,
    childToId       : Map<T, string>
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// This class needs to reside in the `TestResult` file, not the `TestResultReactive`
// this is because Test needs to import it, to be able to de-serialize
// however, we don't want `Test` to depend on the rest of the `TestResultReactive`
// since it brings the ChronoGraph into the `Test` bundle and we want that
// to be as slim as possible

@serializable({ id : 'SubTestCheckInfo' })
export class SubTestCheckInfo extends Mixin(
    [ Serializable, TreeNode, Base ],
    (base : ClassUnion<typeof Serializable, typeof TreeNode, typeof Base>) =>

    class SubTestCheckInfo extends base {
        title       : string        = ''

        titleId     : string        = ''

        childNodeT  : SubTestCheckInfo
        parentNode  : SubTestCheckInfo


        static fromTestResult<T extends typeof SubTestCheckInfo> (this : T, result : TestNodeResultReactive) : InstanceType<T> {
            return this.new({
                title       : result.descriptor.title,
                titleId     : result.parentNode?.childResultsIndex.childToId.get(result)
            } as Partial<InstanceType<T>>)
        }
    }
) {}
