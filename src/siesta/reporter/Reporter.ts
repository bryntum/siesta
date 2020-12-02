import { local } from "../../channel/Channel.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { relative } from "../../util/Path.js"
import { Project } from "../project/Project.js"
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
        project             : Project                   = undefined

        detailing           : ReporterDetailing         = 'subtest'

        streaming           : ReporterStreaming         = 'after_completion'

        resultsCompleted    : Set<TestNodeResult>       = new Set()
        resultsRunning      : Set<TestNodeResult>       = new Set()

        activeTestNode      : TestNodeResult            = undefined

        indentLevelsStack   : number[]                  = [ 0 ]

        c                   : Colorer                   = undefined


        testNodeTemplate (testNode : TestNodeResult) : string {
            let text : string   = ''

            if (testNode.parentNode) {
                text    = `${ this.testNodeState(testNode) } ${testNode.descriptor.title}`
            } else {
                text    = `${ this.testNodeState(testNode) } ${this.testNodeUrl(testNode)}`
            }

            if (this.detailing === 'subtest' || this.detailing === 'assertion') {
                testNode.childNodes.forEach(childTestNode => text += this.c.gray.text('\n├─') + this.testNodeTemplate(childTestNode))
            }

            return text
        }


        testNodeState (testNode : TestNodeResult) : string {
            if (testNode.state === 'completed') {
                return testNode.passed ? this.c.green.text('✔') : this.c.red.text('✘')
                // return testNode.passed ? this.c.bgGreen.black.text(' PASS ') : this.c.bgRed.black.text(' FAIL ')
            } else {
                return this.c.bgYellowBright.black.text(' RUNS ')
            }
        }


        testNodeUrl (testNode : TestNodeResult) : string {
            const rel = relative(this.project.baseUrl, testNode.descriptor.url)

            const match = /(.*?\/)?([^/]+)/.exec(rel)

            return this.c.gray.text(match[ 1 ] || '') + this.c.whiteBright.text(match[ 2 ])
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
