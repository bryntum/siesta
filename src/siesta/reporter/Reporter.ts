import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { LogLevel } from "../../logger/Logger.js"
import { saneSplit } from "../../util/Helpers.js"
import { relative } from "../../util/Path.js"
import { span, xml, XmlElement, XmlNode, XmlStream } from "../jsx/XmlElement.js"
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


    indentMut (howMany : number) {
        const indenter  = ' '.repeat(howMany)

        this.text.forEach(line => line.unshift(indenter))
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


    testFilePass (testNode : TestNodeResult) : XmlNode {
        return span('test_file_pass', ' PASS ')
    }

    testFileFail (testNode : TestNodeResult) : XmlNode {
        return span('test_file_fail', ' FAIL ')
    }

    testFileRunning (testNode : TestNodeResult) : string {
        return this.c.yellowBright.inverse.text(' RUNS ')
    }


    subTestPass (testNode : TestNodeResult) : XmlNode {
        return span('sub_test_pass', '✔')
    }

    subTestFail (testNode : TestNodeResult) : XmlNode {
        return span('sub_test_fail', '✘')
    }


    assertionPass (assertion : Assertion) : XmlNode {
        return span('this.c.green.text', '✔')
    }

    assertionFail (assertion : Assertion) : XmlNode {
        return span('this.c.red.text', '✘')
    }


    logMessage (message : LogMessage) : XmlNode {
        return span('this.c.yellow.text', 'ⓘ')
    }


    testNodeState (testNode : TestNodeResult) : XmlNode {
        if (testNode.isRoot) {
            return testNode.passed ? this.testFilePass(testNode) : this.testFileFail(testNode)
        } else {
            return testNode.passed ? this.subTestPass(testNode) : this.subTestFail(testNode)
        }
    }


    testNodeUrl (testNode : TestNodeResult) : string {
        const rel       = relative(this.project.baseUrl, testNode.descriptor.url)
        const match     = /(.*?\/)?([^/]+)/.exec(rel)

        return this.c.gray.text(match[ 1 ] || '') + this.c.whiteBright.text(match[ 2 ])
    }


    assertionTemplate (assertion : Assertion) : XmlNode {
        let text : XmlElement     = XmlElement.new({ tagName : 'div', class : 'assertion' })

        text.appendChild(
            assertion.passed ? this.assertionPass(assertion) : this.assertionFail(assertion),
            ' ',
            assertion.description
        )

        return text
    }


    logMessageMethod (message : LogMessage) : string {
        switch (message.level) {
            case LogLevel.error :
                return this.c.red.inverse.text(` ${ LogLevel[ message.level ].toUpperCase() } `)
            case LogLevel.warn :
                return this.c.redBright.inverse.text(` ${ LogLevel[ message.level ].toUpperCase() } `)

            default :
                return this.c.inverse.text(` ${ LogLevel[ message.level ].toUpperCase() } `)
        }
    }


    logMessageTemplate (message : LogMessage) : XmlElement {
        return span('',
            this.logMessage(message),
            ' ',
            this.c.whiteBright.text(this.logMessageMethod(message)),
            ' ',
            message.message
        )
    }


    treeLine (str : string) : string {
        return this.c.gray.text(str)
    }


    testSuiteHeader () : XmlElement {
        return xml({ tagName : 'div', childNodes : [
            `Launching test suite: ${ this.c.underline.text(this.project.title) }`
        ] })
    }


    testSuiteFooter () : TextBlock {
        let text : TextBlock     = TextBlock.new()

        if (this.reporter.resultsRunning.size > 0 && this.reporter.resultsCompleted.size > 0) text.push('\n')

        this.reporter.resultsRunning.forEach(testNodeResult => {
            text.pushLn(
                this.testFileRunning(testNodeResult),
                ' ',
                this.testNodeUrl(testNodeResult)
            )
        })

        text.push('\n')

        text.pushLn(
            this.c.whiteBright.text(`Test suite : `),
                this.c.green.text(String(this.reporter.filesPassed) + ' passed, '),
                this.c[ this.reporter.filesFailed > 0 ? 'red' : 'noop' ].text(String(this.reporter.filesFailed) + ' failed, '),

                this.c.whiteBright.text(String(this.launch.projectPlanItemsToLaunch.length) + ' total'),
        )

        text.push(
            this.c.whiteBright.text('Time       : '),
            humanReadableDuration(Date.now() - this.reporter.startTime.getTime())
        )


        return text
    }


    progressBar () : string {
        const completedChars = Math.round(this.reporter.resultsCompleted.size / this.launch.projectPlanItemsToLaunch.length * this.progressBarTotalLength)

        return this.c.bgGreen.text(' '.repeat(completedChars)) + '░'.repeat(this.progressBarTotalLength - completedChars)
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
            let node : XmlElement       = XmlElement.new({ tagName : 'tree' })

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

                    node.appendChild(
                        xml({ tagName : 'leaf', childNodes: [
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
                                                span('', 'Unknown element')
                        ] })
                    )
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

            this.write(this.t.testSuiteHeader())
        }


        onTestSuiteFinish () {
            this.print(this.t.testSuiteFooter().toString())
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
