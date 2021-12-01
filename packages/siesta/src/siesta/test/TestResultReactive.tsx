import { ReactiveArray } from "@bryntum/chronograph/src/chrono2/data/Array.js"
import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { FieldBox } from "@bryntum/chronograph/src/replica2/Atom.js"
import { calculate, Entity, field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { Replica } from "@bryntum/chronograph/src/replica2/Replica.js"
import { Field } from "@bryntum/chronograph/src/schema2/Field.js"
import { entity } from "@bryntum/chronograph/src/schema2/Schema.js"
import { ClassUnion, Mixin } from "typescript-mixin-class/index.js"
import {
    exclude,
    lookupSerializableClass,
    Serializable,
    serializable,
    Visitor
} from "typescript-serializable-mixin/index.js"
import { CI } from "../../iterator/Iterator.js"
import {
    AssertionAsyncCreation,
    AssertionAsyncResolution,
    ChildResultsIndex,
    SubTestCheckInfo,
    TestNodeResult,
    TestNodeState,
    TestResult
} from "./TestResult.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const collapserVisitSymbol           = Symbol('collapserVisitSymbol')
export const expanderMappingVisitSymbol     = Symbol('expanderMappingVisitSymbol')


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'TestNodeResultReactive', mode : 'optIn' })
@entity()
export class TestNodeResultReactive extends Mixin(
    [ Serializable, TestNodeResult, Entity ],
    (base : ClassUnion<typeof Serializable, typeof TestNodeResult, typeof Entity>) =>

    class TestNodeResultReactive extends base {
        override $childResultsIndex : ChildResultsIndex<TestNodeResultReactive>
        override parentNode      : TestNodeResultReactive

        // TODO does not belong here, view model
        previous        : this          = undefined

        // TODO does not belong here, view model
        @field()
        checked         : boolean       = false

        // TODO does not belong here, view model
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


        [collapserVisitSymbol] (visitor : Visitor) {
            return {
                $class      : this.$class,

                localId     : this.localId,
                frozen      : this.frozen,
                state       : this.state,

                descriptor  : visitor.visit(this.descriptor),
                parentNode  : visitor.visit(this.parentNode),

                startDate   : visitor.visit(this.startDate),
                endDate     : visitor.visit(this.endDate),

                // small hack - store the reactive array value in different property
                $resultLog  : visitor.visit(this.resultLog)
            }
        }


        [expanderMappingVisitSymbol] (visitor : Visitor) {
            const cls       = lookupSerializableClass(this.$class)

            const instance  = Object.create(cls.prototype)

            Object.assign(instance, {
                localId     : this.localId,
                frozen      : this.frozen,
                state       : this.state,

                descriptor  : visitor.visit(this.descriptor),
                parentNode  : visitor.visit(this.parentNode),

                startDate   : visitor.visit(this.startDate),
                endDate     : visitor.visit(this.endDate),

                // small hack - extract the reactive array value from different property
                resultLog   : visitor.visit(
                    // @ts-ignore
                    this.$resultLog
                )
            })

            instance.enterGraph(globalGraph as Replica)

            return instance
        }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const checkInfoFromTestResult    = (result : TestNodeResultReactive) : SubTestCheckInfo | undefined => {

    const fromChildren  = CI(result.eachResultOfClass(TestNodeResultReactive))
        .map(result => checkInfoFromTestResult(result))
        .filter(el => Boolean(el))
        .toArray()

    if (fromChildren.length || result.checked) {
        const info  = SubTestCheckInfo.fromTestResult(result)

        fromChildren.forEach(checkInfo => info.appendChild(checkInfo))

        return info
    } else
        return undefined
}

// this method returns "check info" which corresponds to a double click on the sub-test
export const individualCheckInfoForTestResult    = (result : TestNodeResultReactive) : SubTestCheckInfo | undefined => {
    if (!result.parentNode) return undefined

    let checkInfo           = SubTestCheckInfo.fromTestResult(result)

    CI(result.eachParent()).forEach(parent => {
        const parentCheckInfo   = SubTestCheckInfo.fromTestResult(parent)

        parentCheckInfo.appendChild(checkInfo)

        checkInfo               = parentCheckInfo
    })

    return checkInfo
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
globalGraph.autoCommit      = true
globalGraph.historyLimit    = 0

// // @ts-ignore
// window.globalGraph = globalGraph


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'AssertionAsyncCreationReactive' })
export class AssertionAsyncCreationReactive extends Mixin(
    [ AssertionAsyncCreation, Entity ],
    (base : ClassUnion<typeof AssertionAsyncCreation, typeof Entity>) =>

    class AssertionAsyncCreation extends base {
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
    }
) {}
