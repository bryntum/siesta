import { ReactiveArray } from "@bryntum/chronograph/src/chrono2/data/Array.js"
import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { FieldBox } from "@bryntum/chronograph/src/replica2/Atom.js"
import { calculate, Entity, field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { Replica } from "@bryntum/chronograph/src/replica2/Replica.js"
import { Field } from "@bryntum/chronograph/src/schema2/Field.js"
import { entity } from "@bryntum/chronograph/src/schema2/Schema.js"
import { ClassUnion, Mixin } from "typescript-mixin-class"
import { exclude, serializable } from "typescript-serializable-mixin"
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
@entity()
export class TestNodeResultReactive extends Mixin(
    [ TestNodeResult, Entity ],
    (base : ClassUnion<typeof TestNodeResult, typeof Entity>) =>

    class TestNodeResultReactive extends base {
        override $childResultsIndex : ChildResultsIndex<TestNodeResultReactive>
        override parentNode      : TestNodeResultReactive

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
