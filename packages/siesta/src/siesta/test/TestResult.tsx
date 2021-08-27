import { ReactiveArray } from "@bryntum/chronograph/src/chrono2/data/Array.js"
import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { FieldBox } from "@bryntum/chronograph/src/replica2/Atom.js"
import { calculate, Entity, field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { Replica } from "@bryntum/chronograph/src/replica2/Replica.js"
import { Field } from "@bryntum/chronograph/src/schema2/Field.js"
import { entity } from "@bryntum/chronograph/src/schema2/Schema.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { OutputType } from "../../context/ExecutionContext.js"
import { CI } from "../../iterator/Iterator.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../../jsx/XmlElement.js"
import { LogLevel } from "../../logger/Logger.js"
import { exclude, serializable, Serializable } from "../../serializable/Serializable.js"
import { TreeNode } from "../../tree/TreeNode.js"
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


//---------------------------------------------------------------------------------------------------------------------
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


//---------------------------------------------------------------------------------------------------------------------
export type SourcePoint = { line : number, char : number }


@serializable({ id : 'Assertion' })
export class Assertion extends Mixin(
    [ Serializable, Result ],
    (base : ClassUnion<typeof Serializable, typeof Result>) =>

    class Assertion extends base {
        name            : string            = ''

        passed          : boolean           = true

        description     : string            = ''

        sourcePoint     : SourcePoint       = undefined

        annotation      : XmlElement        = undefined
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable({ id : 'AssertionAsyncCreation' })
export class AssertionAsyncCreation extends Mixin(
    [ Assertion, Entity ],
    (base : ClassUnion<typeof Assertion, typeof Entity>) =>

    class AssertionAsyncCreation extends base {
        $resolution     : AssertionAsyncResolution          = undefined

        @exclude()
        $resolutionBox   : Box<AssertionAsyncResolution>    = undefined

        get resolutionBox () : Box<AssertionAsyncResolution> {
            if (this.$resolutionBox !== undefined) return this.$resolutionBox

            return this.$resolutionBox = Box.new(this.$resolution)
        }

        // the `resolution` property effectively made reactive _and_ serializable
        get resolution () : AssertionAsyncResolution | null {
            return this.resolutionBox.read()
        }
        set resolution (value : AssertionAsyncResolution) {
            this.$resolution    = value
            this.resolutionBox.write(value)
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


//---------------------------------------------------------------------------------------------------------------------
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



//---------------------------------------------------------------------------------------------------------------------
export type TestNodeState   = 'created' | 'running' | 'completed' | 'ignored'

// serializable leaf nodes
export type TestResultLeaf              = Exception | LogMessage | Assertion | AssertionAsyncCreation

export type TestResultLeafConstructor   = typeof Exception | typeof LogMessage | typeof Assertion | typeof AssertionAsyncCreation

//---------------------------------------------------------------------------------------------------------------------
export type TestResult                  = TestNodeResult | TestResultLeaf

export type TestResultConstructor       = typeof TestNodeResult | TestResultLeafConstructor


//---------------------------------------------------------------------------------------------------------------------
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
            this.$childNodes = undefined
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

            return this.$childNodes = (this.resultLog as TestNodeResult[]).filter(result => result instanceof TestNodeResult)
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
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export type ChildResultsIndex = {
    idToChild       : Map<string, TestNodeResultReactive>,
    childToId       : Map<TestNodeResultReactive, string>
}


//---------------------------------------------------------------------------------------------------------------------
@entity()
export class TestNodeResultReactive extends Mixin(
    [ TestNodeResult, Entity ],
    (base : ClassUnion<typeof TestNodeResult, typeof Entity>) =>

    class TestNodeResultReactive extends base {
        override parentNode      : TestNodeResultReactive    = undefined

        previous        : this          = undefined

        @field()
        checked         : boolean       = false

        @field()
        expandedState   : 'collapsed' | 'expanded'      = null

        @field()
        // @ts-ignore
        passed          : boolean

        @field()
        state           : TestNodeState

        @calculate('passed')
        calculatePassed () : boolean {
            return super.calculatePassed()
        }


        @field({ lazy : false, atomCls : ReactiveArray })
        override resultLog       : TestResult[]      = []

        get resultLogReactive () : ReactiveArray<TestResult> {
            return this.$.resultLog as ReactiveArray<TestResult>
        }


        toggleChecked () {
            this.setChecked(!this.checked)
        }


        setChecked (value : boolean) {
            this.checked = value
        }


        override initialize (...args : unknown[]) {
            super.initialize(...args)

            this.enterGraph(globalGraph as Replica)
        }


        override doAddResult<T extends TestResult> (result : T) {
            this.resultLogReactive.push(result)
        }


        resetChildNodesCache () {
            super.resetChildNodesCache()

            this.$childResultsIndex = undefined
        }


        $childResultsIndex : ChildResultsIndex          = undefined

        get childResultsIndex () : ChildResultsIndex {
            if (this.$childResultsIndex !== undefined) return this.$childResultsIndex

            const index : ChildResultsIndex     = {
                idToChild       : new Map(),
                childToId       : new Map()
            }

            let previousTitle : string          = undefined
            let previousCounter : number        = 0

            CI(this.eachResultOfClass(TestNodeResultReactive)).forEach(result => {
                const resultTitle               = result.descriptor.title

                if (previousTitle !== undefined && resultTitle === previousTitle)
                    previousCounter++
                else {
                    previousTitle               = resultTitle
                    previousCounter             = 0
                }

                const id        = `${ resultTitle }::${ previousCounter }`

                index.idToChild.set(id, result)
                index.childToId.set(result, id)
            })

            return this.$childResultsIndex = index
        }


        syncFromPrevious () {
            this.checked        = this.previous.checked
            this.expandedState  = this.previous.expandedState
        }


        static createPropertyAccessorsFor (field : Field) {
            if (!field.atomCls || !(field.atomCls.prototype instanceof ReactiveArray)) {
                super.createPropertyAccessorsFor(field)

                return
            }

            const propertyKey   = field.name
            const target        = this.prototype

            Object.defineProperty(target, propertyKey, {
                get     : function (this : Entity) : any {
                    const fieldAtom : ReactiveArray<unknown> = this.$[ propertyKey ]

                    return fieldAtom.sync ? fieldAtom.readValues() : fieldAtom.readAsync()
                },

                set     : function (this : Entity, value : any) {
                    const atom = this.$[ propertyKey ] as FieldBox

                    // magical effect warning:
                    // `field.write` is populated only after 1st access to `this.$`
                    field.write
                        ?
                            field.write.call(this, atom, value)
                        :
                            atom.write(value)
                }
            })
        }
    }
){}

globalGraph.autoCommit      = true
globalGraph.historyLimit    = 0

// // @ts-ignore
// window.globalGraph = globalGraph

@serializable({ id : 'SubTestCheckInfo' })
export class SubTestCheckInfo extends Mixin(
    [ Serializable, TreeNode, Base ],
    (base : ClassUnion<typeof Serializable, typeof TreeNode, typeof Base>) =>

    class SubTestCheckInfo extends base {
        title       : string        = ''

        childNodeT  : SubTestCheckInfo
        parentNode  : SubTestCheckInfo
    }
) {}


export const checkInfoFromTestResult    = (result : TestNodeResultReactive) : SubTestCheckInfo | undefined => {

    const fromChildren  = CI(result.eachResultOfClass(TestNodeResultReactive))
        .map(result => checkInfoFromTestResult(result))
        .filter(el => Boolean(el))
        .toArray()

    if (fromChildren.length || result.checked) {
        const info  = SubTestCheckInfo.new({ title : result.descriptor.title })

        fromChildren.forEach(checkInfo => info.appendChild(checkInfo))

        return info
    } else
        return undefined
}

export const individualCheckInfoForTestResult    = (result : TestNodeResultReactive) : SubTestCheckInfo | undefined => {
    if (!result.parentNode) return undefined

    let checkInfo           = SubTestCheckInfo.new({ title : result.descriptor.title })

    CI(result.eachParent()).forEach(parent => {
        const parentCheckInfo   = SubTestCheckInfo.new({ title : parent.descriptor.title })

        parentCheckInfo.appendChild(checkInfo)

        checkInfo               = parentCheckInfo
    })

    return checkInfo
}

