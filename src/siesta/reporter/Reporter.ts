import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { saneSplit } from "../../util/Helpers.js"
import { relative } from "../../util/Path.js"
import { Project } from "../project/Project.js"
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
export class TextBlock extends Base {
    text            : string[][]        = [ [] ]


    addSamelineText (str : string) {
        this.text[ this.text.length - 1 ].push(str)
    }


    addNewLine () {
        this.text.push([])
    }


    push (str : string) {
        saneSplit(str, '\n').forEach((el, index, array) => {
            this.addSamelineText(el)

            if (index !== array.length - 1) this.addNewLine()
        })
    }


    pullFrom (another : TextBlock) {
        this.text.push(...another.text)
    }


    toString () : string {
        return this.text.map(parts => parts.join('')).join('\n')
    }
}


export class TreeFormatter extends Base {
}



//---------------------------------------------------------------------------------------------------------------------
export type ReporterDetailing   = 'file' | 'subtest' | 'assertion'

// export type ReporterStreaming   = 'live' | 'after_completion'


//---------------------------------------------------------------------------------------------------------------------
export class Reporter extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Reporter extends base {
        project             : Project                   = undefined

        detailing           : ReporterDetailing         = 'subtest'
        includePassed       : boolean                   = true

        // streaming           : ReporterStreaming         = 'after_completion'

        resultsCompleted    : Set<TestNodeResult>       = new Set()
        resultsRunning      : Set<TestNodeResult>       = new Set()

        planned             : number                    = 0

        activeTestNode      : TestNodeResult            = undefined

        indentLevelsStack   : number[]                  = [ 0 ]

        c                   : Colorer                   = undefined


        testNodeTemplate (testNode : TestNodeResult, isLastNode : boolean = false) : TextBlock {
            let text : TextBlock     = TextBlock.new()

            if (testNode.parentNode) {
                text.push(`${ this.testNodeState(testNode) } ${testNode.descriptor.title}`)
            } else {
                text.push(`${ this.testNodeState(testNode) } ${this.testNodeUrl(testNode)}`)
            }

            if (this.detailing === 'subtest') {
                const nodesToShow   = testNode.childNodes.filter(childTestNode => {
                    return this.includePassed || !childTestNode.passed
                })

                nodesToShow.forEach((childTestNode, index) => {
                    const isFirst           = index === 0
                    const isLast            = index === nodesToShow.length - 1

                    const childTextBlock    = this.testNodeTemplate(childTestNode, isLast)

                    childTextBlock.text.forEach((strings, index) => {
                        const isFirstLine       = index === 0

                        if (isFirstLine) {
                            strings.unshift(isLast && isLastNode ? this.c.gray.text('└─') : this.c.gray.text('├─'))
                        } else {
                            strings.unshift(isLastNode ? '  ' : this.c.gray.text('│ '))
                        }
                    })

                    text.pullFrom(childTextBlock)
                })
            }
            else if (this.detailing === 'assertion') {
                // testNode.resultLog.forEach(result => {
                //     if (result instanceof TestNodeResult) {}
                //
                //     if (this.includePassed || !childTestNode.passed) {
                //         text += this.c.gray.text('\n├─') + this.testNodeTemplate(childTestNode)
                //     }
                // })
            }

            return text
        }


        testNodeState (testNode : TestNodeResult) : string {
            if (testNode.state === 'completed') {
                return testNode.passed ? this.c.green.text('✔') : this.c.red.text('✘')
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
            if (!testNode.parentNode) this.resultsRunning.add(testNode)
        }

        onSubTestFinish (testNode : TestNodeResult) {
            if (!testNode.parentNode) {
                if (!this.resultsRunning.has(testNode)) throw new Error("Test completed before starting")

                this.resultsRunning.delete(testNode)

                this.resultsCompleted.add(testNode)

                this.c.write(this.testNodeTemplate(testNode, this.resultsCompleted.size === this.planned).toString())
            }
        }

        onResult (testNode : TestNodeResult, assertion : Result) {
        }

        onAssertionFinish (testNode : TestNodeResult, assertion : AssertionAsync) {
        }
    }
) {}
