import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { LogLevel } from "../../logger/Logger.js"
import { saneSplit } from "../../util/Helpers.js"
import { relative } from "../../util/Path.js"
import { SiestaJSX } from "../jsx/Factory.js"
import { streamToElement, XmlElement, XmlStream } from "../jsx/XmlElement.js"
import { Launch } from "../project/Launch.js"
import { Project } from "../project/Project.js"
import { Assertion, AssertionAsyncResolution, LogMessage, Result, TestNodeResult, TestResult } from "../test/Result.js"
import { Colorer } from "./Colorer.js"
import { Printer } from "./Printer.js"
import { randomSpinner, Spinner } from "./Spinner.js"

//---------------------------------------------------------------------------------------------------------------------
export class TextBlock extends Base {
    text            : string[][]        = [ [] ]


    addSameLineText (str : string) {
        this.text[ this.text.length - 1 ].push(str)
    }


    addNewLine () {
        this.text.push([])
    }


    push (...strings : string[]) {
        strings.forEach(string => saneSplit(string, '\n').forEach((str, index, array) => {
            this.addSameLineText(str)

            if (index !== array.length - 1) this.addNewLine()
        }))
    }


    pushLn (...strings : string[]) {
        this.push(...strings, '\n')
    }


    pullFrom (another : TextBlock) {
        const [ firstLine, ...otherLines ]  = another.text

        this.text[ this.text.length - 1 ].push(...firstLine)

        this.text.push(...otherLines)
    }


    toString () : string {
        return this.text.map(parts => parts.join('')).join('\n')
    }


    colorizeMut (c : Colorer) {
        this.text.forEach((line, index) => this.text[ index ] = [ c.text(line.join('')) ])
    }


    indentMut (howMany : number, includeMarker : boolean = true) {
        const indenter  = ' '.repeat(howMany)

        this.text.forEach((line, index) => {
            if (index === 0 && includeMarker) {
                line.unshift('·' + indenter.slice(1))
            } else {
                line.unshift(indenter)
            }
        })
    }


    indentAsTreeLeafMut (howMany : number, isLast : boolean) {
        const indenterPlain     = ' '.repeat(howMany - 1)
        const indenterTree      = '─'.repeat(howMany - 1)

        this.text.forEach((line, index) => {
            if (index === 0) {
                line.unshift(isLast ? '└' + indenterTree : '├' + indenterTree)
            } else {
                line.unshift(isLast ? ' ' + indenterPlain : '│' + indenterPlain)
            }
        })
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class ReporterTheme extends Base {
    reporter    : Reporter              = undefined

    progressBarTotalLength : number     = 50


    get c () : Colorer {
        return this.reporter.c
    }

    get project () : Project {
        return this.reporter.launch.project
    }

    get launch () : Launch {
        return this.reporter.launch
    }


    testFilePass (testNode : TestNodeResult) : XmlStream {
        return <span class='test_file_pass'> PASS </span>
    }

    testFileFail (testNode : TestNodeResult) : XmlStream {
        return <span class='test_file_fail'> FAIL </span>
    }

    subTestPass (testNode : TestNodeResult) : XmlStream {
        return <span class='sub_test_pass'>✔</span>
    }

    subTestFail (testNode : TestNodeResult) : XmlStream {
        return <span class='sub_test_fail'>✘</span>
    }


    testNodeState (testNode : TestNodeResult) : XmlStream {
        if (testNode.isRoot) {
            return testNode.passed ? this.testFilePass(testNode) : this.testFileFail(testNode)
        } else {
            return testNode.passed ? this.subTestPass(testNode) : this.subTestFail(testNode)
        }
    }


    testFileRunning (testNode : TestNodeResult) : XmlElement {
        return <div class="test_file_runs"> RUNS </div>
    }


    testNodeUrl (testNode : TestNodeResult) : XmlElement {
        const rel       = relative(this.project.baseUrl, testNode.descriptor.url)
        const match     = /(.*?\/)?([^/]+)/.exec(rel)

        return <span>
            <span class="test_file_url_dirname">{ match[ 1 ] || '' }</span><span class="test_file_url_filename">{ match[ 2 ] }</span>
        </span>
    }


    assertionTemplate (assertion : Assertion) : XmlStream {
        return <div class="assertion">
            <span class={`assertion_icon ${ assertion.passed ? 'assertion_icon_pass' : 'assertion_icon_fail' }`}>
                { assertion.passed ? '✔' : '✘' }
            </span>
            { ' ' }
            [<span class="assertion_name">{ assertion.name }</span>]
            <span class="assertion_description">{ assertion.description ? ' ' + assertion.description : '' }</span>
            { ' ' }
            at line <span class="assertion_source_line">{ assertion.sourceLine }</span>
            { assertion.annotation }
        </div>
    }


    logMessageTemplate (message : LogMessage) : XmlStream {
        return <div class="log_message">
            <span class='log_message_icon'>ⓘ</span>
            { ' ' }
            <span class={ `log_message_${ LogLevel[ message.level ].toLowerCase() }` }> { LogLevel[ message.level ].toUpperCase() } </span>
            { ' ' }
            { message.message }
        </div>
    }


    testSuiteHeader () : XmlStream {
        return <div>
            Launching test suite: <span class="project_title">{ this.project.title }</span>
            <div></div>
        </div>
    }


    testSuiteFooter () : XmlElement {
        let text : XmlElement       = <div></div>

        if (this.reporter.resultsRunning.size > 0 && this.reporter.resultsCompleted.size > 0) text.appendChild(<div></div>)

        this.reporter.resultsRunning.forEach(testNodeResult => {
            text.appendChild(
                this.testFileRunning(testNodeResult),
                ' ',
                this.testNodeUrl(testNodeResult)
            )
        })

        text.appendChild(<div></div>)

        text.appendChild(<div class="summary">
            { 'Test suite : ' }
            <span class="summary_tests_passed">{ this.reporter.filesPassed } passed, </span>
            <span class={ this.reporter.filesFailed > 0 ? "summary_tests_failed" : '' }>{ this.reporter.filesFailed } failed, </span>
            <span class="summary_tests_total">{ this.launch.projectPlanItemsToLaunch.length } total</span>
            <div>
                { 'Time       : ' }
                { humanReadableDuration(Date.now() - this.reporter.startTime.getTime()) }
            </div>
        </div>)

        return text
    }


    progressBar () : XmlElement {
        const completedChars = Math.round(this.reporter.resultsCompleted.size / this.launch.projectPlanItemsToLaunch.length * this.progressBarTotalLength)

        return <span>
            <span class={ this.reporter.filesFailed > 0 ? 'progress_bar_completed_failed' : 'progress_bar_completed_passed' }>{ ' '.repeat(completedChars) }</span>
            <span class="progress_bar_pending">{ '░'.repeat(this.progressBarTotalLength - completedChars) }</span>
        </span>
    }


    spinner () : string {
        return this.reporter.spinner.frame
    }
}

//---------------------------------------------------------------------------------------------------------------------
export type ReporterDetailing   = 'file' | 'subtest' | 'assertion'


//---------------------------------------------------------------------------------------------------------------------
export class Reporter extends Mixin(
    [ Printer, Base ],
    (base : ClassUnion<typeof Printer, typeof Base>) => {

    class Reporter extends base {
        launch              : Launch                    = undefined

        detailing           : ReporterDetailing         = 'assertion'
        includePassed       : boolean                   = true

        filesPassed         : number                    = 0
        filesFailed         : number                    = 0

        resultsCompleted    : Set<TestNodeResult>       = new Set()
        resultsRunning      : Set<TestNodeResult>       = new Set()

        c                   : Colorer                   = undefined
        t                   : ReporterTheme             = ReporterTheme.new({ reporter : this })

        spinner             : Spinner                   = randomSpinner()

        startTime           : Date                      = undefined


        needToShowResult (result : TestResult) : boolean {
            if (
                this.detailing === 'assertion' && (result instanceof Assertion || result instanceof TestNodeResult)
                ||
                this.detailing === 'subtest' && (result instanceof TestNodeResult)
            ) {
                return this.includePassed || !result.passed
            } else {
                return true
            }
        }


        testNodeTemplateXml (testNode : TestNodeResult, isLastNode : boolean = false) : XmlElement {
            let node : XmlElement       = <tree></tree>

            node.setAttribute('isLastNode', isLastNode)

            if (testNode.isRoot) {
                node.appendChild(this.t.testNodeState(testNode), ' ', this.t.testNodeUrl(testNode))
            } else {
                node.appendChild(this.t.testNodeState(testNode), ' ', this.c[ this.detailing === 'assertion' ? 'underline' : 'noop' ].text(testNode.descriptor.title))
            }

            if (this.detailing === 'assertion' || this.detailing === 'subtest') {
                const nodesToShow : TestResult[]  = testNode.resultLog.filter(result => this.needToShowResult(result))

                nodesToShow.forEach((result, index) => {
                    const isLast            = index === nodesToShow.length - 1

                    node.appendChild(<leaf>{
                        (result instanceof Assertion)
                            ?
                                this.t.assertionTemplate(result)
                            :
                                (result instanceof TestNodeResult)
                                    ?
                                        this.testNodeTemplateXml(result, isLast)
                                    :
                                    (result instanceof LogMessage)
                                        ?
                                            this.t.logMessageTemplate(result)
                                        :
                                            <span>Unknown element</span>
                    }</leaf>)
                })
            }

            return node
        }


        onSubTestStart (testNode : TestNodeResult) {
            if (testNode.isRoot) this.resultsRunning.add(testNode)
        }

        onSubTestFinish (testNode : TestNodeResult) {
            if (testNode.isRoot) {
                if (!this.resultsRunning.has(testNode)) throw new Error("Test completed before starting")

                this.resultsRunning.delete(testNode)

                this.resultsCompleted.add(testNode)

                this[ testNode.passed ? 'filesPassed' : 'filesFailed' ]++

                this.write(this.testNodeTemplateXml(testNode, this.resultsCompleted.size === this.launch.projectPlanItemsToLaunch.length))
            }
        }

        onResult (testNode : TestNodeResult, assertion : Result) {
        }


        onAssertionFinish (testNode : TestNodeResult, assertion : AssertionAsyncResolution) {
        }


        onTestSuiteStart () {
            this.startTime      = new Date()

            this.write(streamToElement(this.t.testSuiteHeader()))
        }


        onTestSuiteFinish () {
            this.write(this.t.testSuiteFooter())
        }
    }

    return Reporter
}) {}


//---------------------------------------------------------------------------------------------------------------------
export const humanReadableDuration = (milliSeconds : number) : string => {
    if (milliSeconds >= 1000) {
        const seconds       = Math.floor(milliSeconds / 1000)

        if (seconds >= 60) {
            const minutes   = Math.floor(seconds / 60)

            if (minutes >= 60) {
                const hours     = Math.floor(minutes / 60)

                return `${ hours }h ${ minutes % 60 }m`
            } else {
                return `${ minutes }m ${ seconds % 60 }s`
            }
        } else {
            return `${ seconds }s`
        }
    } else {
        return `${ milliSeconds }ms`
    }
}
