import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TestNodeResult } from "../test/Result.js"
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


const c = Colorer.new()

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

        resultsCompleted    : TestNodeResult[]          = []
        resultsRunning      : TestNodeResult[]          = []

        activeTestNode      : TestNodeResult            = undefined

        indentLevelsStack   : number[]                  = [ 0 ]


        testNodeTemplate (testNode : TestNodeResult) {
            return `${ this.testNodeState(testNode) } ${this.testNodeUrl(testNode)}`
        }


        testNodeState (testNode : TestNodeResult) : string {
            if (testNode.state === 'completed') {
                return testNode.passed ? c.bgGreen.black.text(' PASS ') : c.bgRed.black.text('FAIL')
            } else {
                return 'RUNS'
            }
        }


        testNodeUrl (testNode : TestNodeResult) : string {
            return testNode.descriptor.url
        }
    }
) {}
