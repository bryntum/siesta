import { local } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { InternalId } from "../test/InternalIdSource.js"
import { AssertionAsync, Result, TestNodeResult } from "../test/Result.js"
import { Colorer } from "./Colorer.js"

//---------------------------------------------------------------------------------------------------------------------
export type Color   = string

//---------------------------------------------------------------------------------------------------------------------
export class Style extends Base {
    fgColor         : Color         = ''
    bgColor         : Color         = ''
}

//---------------------------------------------------------------------------------------------------------------------
export class IncreaseIndent extends Base {
    by              : number        = 0
}

//---------------------------------------------------------------------------------------------------------------------
export class SetIndent extends Base {
    to              : number        = 0
}


//---------------------------------------------------------------------------------------------------------------------
export class CancelPreviousIndent extends Base {
}


//---------------------------------------------------------------------------------------------------------------------
export type ReportingCommand    = string | Style | IncreaseIndent | SetIndent | CancelPreviousIndent


export class ReportingSequence extends Base {
    commands        : ReportingCommand[]        = []
}


//---------------------------------------------------------------------------------------------------------------------
export type ReporterDetailing   = 'file' | 'subtest' | 'assertion'

export type ReporterStreaming   = 'live' | 'after_completion'


//---------------------------------------------------------------------------------------------------------------------
export class Reporter extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Reporter extends base {
        detailing           : ReporterDetailing         = 'file'

        streaming           : ReporterStreaming         = 'after_completion'

        resultsCompleted    : Set<TestNodeResult>       = new Set()
        resultsRunning      : Set<TestNodeResult>       = new Set()

        activeTestNode      : TestNodeResult            = undefined

        indentLevelsStack   : number[]                  = [ 0 ]

        c                   : Colorer                   = undefined


        testNodeTemplate (testNode : TestNodeResult) : string {
            return `${ this.testNodeState(testNode) } ${this.testNodeUrl(testNode)}`
        }


        testNodeState (testNode : TestNodeResult) : string {
            if (testNode.state === 'completed') {
                return testNode.passed ? this.c.bgGreen.black.text(' PASS ') : this.c.bgRed.black.text('FAIL')
            } else {
                return this.c.bgYellowBright.black.text(' RUNS ')
            }
        }


        testNodeUrl (testNode : TestNodeResult) : string {
            console.log("URL = ", testNode.descriptor.url)

            return testNode.descriptor.url
        }



        onSubTestStart (testNode : TestNodeResult) {
            this.resultsRunning.add(testNode)
        }

        onSubTestFinish (testNode : TestNodeResult) {
            if (!this.resultsRunning.has(testNode)) throw new Error("Test completed before starting")

            this.resultsRunning.delete(testNode)

            this.resultsCompleted.add(testNode)

            if (!testNode.parentNode) this.c.write(this.testNodeTemplate(testNode))
        }

        onResult (testNode : TestNodeResult, assertion : Result) {
        }

        onAssertionFinish (testNode : TestNodeResult, assertion : AssertionAsync) {
        }
    }
) {}
