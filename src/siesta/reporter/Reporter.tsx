import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Hook } from "../../hook/Hook.js"
import { CI } from "../../iterator/Iterator.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { Tree } from "../../jsx/Tree.js"
import { XmlElement } from "../../jsx/XmlElement.js"
import { LogLevel } from "../../logger/Logger.js"
import { relative } from "../../util/Path.js"
import { LUID, luid } from "../common/LUID.js"
import { Dispatcher } from "../launcher/Dispatcher.js"
import { Launcher } from "../launcher/Launcher.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import {
    Assertion,
    AssertionAsyncResolution,
    Exception,
    LogMessage,
    Result,
    SourcePoint,
    TestNodeResult,
    TestNodeResultReactive,
    TestResult
} from "../test/TestResult.js"
import { ConsoleXmlRenderer } from "./ConsoleXmlRenderer.js"


//---------------------------------------------------------------------------------------------------------------------
export type ReporterDetailing   = 'file' | 'subtest' | 'assertion'


//---------------------------------------------------------------------------------------------------------------------
export class Reporter extends Mixin(
    [ ConsoleXmlRenderer, Base ],
    (base : ClassUnion<typeof ConsoleXmlRenderer, typeof Base>) =>

    class Reporter extends base {
        launcher            : Launcher                  = undefined

        get dispatcher () : Dispatcher {
            return this.launcher.dispatcher
        }

        get projectData () : ProjectSerializableData {
            return this.launcher.projectData
        }

        get detail () : ReporterDetailing {
            return this.launcher.detail
        }

        get sourceContext () : number {
            return this.launcher.sourceContext
        }


        filesPassed         : number                    = 0
        filesFailed         : number                    = 0

        resultsCompleted    : Set<TestNodeResult>       = new Set()
        resultsRunningMap   : Map<LUID, TestDescriptor> = new Map()


        resultsToPrint      : Set<{ testNode : TestNodeResultReactive, sources : string[] }>      = new Set()

        startTime           : Date                      = undefined
        endTime             : Date                      = undefined


        // failed assertions are always included (along with all their parent sub-tests)
        // otherwise, include everything at the specified `detail` level
        needToShowResult (result : TestResult, isTodo : boolean) : boolean {
            if (result instanceof Assertion) {
                return this.detail === 'assertion' ? true : isTodo ? false : !result.passed
            }
            else if (result instanceof TestNodeResult) {
                if (this.detail === 'assertion') return true

                return this.detail === 'subtest' ? true : isTodo ? false : !result.passed || this.testNodeHasLogMessagesAboveTheLogLevel(result, this.launcher.logLevel)
            }
            else if (result instanceof LogMessage) {
                return result.level >= this.launcher.logLevel
            } else {
                // exception
                return true
            }
        }


        testNodeHasLogMessagesAboveTheLogLevel (testNode : TestNodeResult, level : LogLevel) : boolean {
            return CI(testNode.eachResultLeafOfClass(LogMessage))
                .filter(logMessage => logMessage.level >= level)
                .take(1)
                .length > 0
        }


        onBeforeTestLaunch (desc : TestDescriptor) {
            this.resultsRunningMap.set(desc.remoteId, desc)
        }


        onSubTestStart (testNode : TestNodeResult) {
        }


        print (str : string) {
            this.launcher.print(str)
        }


        pendingPrints   : number        = 0

        async onSubTestFinish (testNode : TestNodeResultReactive) {
            if (testNode.isRoot) {
                const runningDescId = testNode.descriptor.remoteId
                const runningDesc   = this.resultsRunningMap.get(runningDescId)

                if (!runningDesc) throw new Error("Test completed before starting")

                this.resultsRunningMap.delete(runningDescId)
                this.resultsCompleted.add(testNode)

                if (testNode.passed) {
                    this.resultsToPrint.add({ testNode, sources : undefined })
                } else {
                    this.pendingPrints++

                    // this little async gap messes up the things and makes us
                    // to use the `allPrintedHook` hook etc
                    const sources      = await this.fetchSources(testNode.descriptor.url)

                    this.pendingPrints--

                    this.resultsToPrint.add({ testNode, sources })
                }

                this.printFinished()
            }
        }


        printTest (testNode : TestNodeResultReactive, isLast : boolean, sources : string[]) {
            this.write(this.testNodeTemplateXml(testNode, isLast, sources))
        }


        allPrintedHook : Hook       = new Hook()

        printFinished () {
            Array.from(this.resultsToPrint).forEach(({ testNode, sources }, index, array) => {
                this[ testNode.passed ? 'filesPassed' : 'filesFailed' ]++

                this.printTest(testNode, index === array.length - 1 && this.pendingPrints === 0 && this.isCompleted(), sources)
            })

            this.resultsToPrint.clear()

            // delay the hook, to allow the subclass method to fully complete
            // before it
            Promise.resolve().then(() => this.allPrintedHook.trigger())
        }


        printSuiteFooter () {
            this.write(this.testSuiteFooter())
        }


        isCompleted () : boolean {
            return this.resultsCompleted.size === this.dispatcher.projectPlanItemsToLaunch.length
        }


        onResult (testNode : TestNodeResult, assertion : Result) {
        }


        onAssertionFinish (testNode : TestNodeResult, assertion : AssertionAsyncResolution) {
        }


        async fetchSources (url : string) : Promise<string[]> {
            throw new Error("Abstract method")
        }


        onTestSuiteStart () {
            this.startTime      = new Date()

            this.onTestSuiteStartDo()
        }


        onTestSuiteStartDo () {
            this.write(this.testSuiteHeader())
        }


        onTestSuiteFinish () {
            this.endTime        = new Date()

            this.allPrintedHook.on(() => this.pendingPrints === 0 && this.finalizePrinting())

            // no `resultsToPrint` means all printing happened synchronously
            // trigger the hook manually then
            if (this.pendingPrints === 0) this.allPrintedHook.trigger()
        }


        finalizePrinting () {
            this.printSuiteFooter()
        }

        // region templates

        testNodeTemplateXml (testNode : TestNodeResultReactive, isTopLevelLastNode : boolean | undefined = undefined, sources : string[]) : XmlElement {
            let node : XmlElement       = <Tree isTopLevelLastNode={ isTopLevelLastNode }></Tree>

            if (testNode.isRoot) {
                node.appendChild(this.testNodeState(testNode), ' ', this.testNodeUrlTemplate(testNode.descriptor))
            } else {
                node.appendChild(
                    this.testNodeState(testNode),
                    ' ',
                    testNode.isTodo ? <span class="accented">[todo] </span> : '',
                    <span class={ this.detail === 'assertion' ? 'underline' : '' }>{ testNode.descriptor.title }</span>,
                )
            }

            const nodesToShow : TestResult[]  = testNode.resultLog.filter(result => this.needToShowResult(result, testNode.isTodo))

            nodesToShow.forEach(result => {

                node.appendChild(<leaf>{
                    (result instanceof Assertion)
                        ?
                            this.assertionTemplate(result, testNode, sources)
                        :
                            (result instanceof TestNodeResultReactive)
                                ?
                                    this.testNodeTemplateXml(result, undefined, sources)
                                :
                                (result instanceof LogMessage)
                                    ?
                                        this.logMessageTemplate(result)
                                    :
                                        (result instanceof Exception)
                                            ?
                                                this.exceptionTemplate(result)
                                            :
                                                <span>Unknown element</span>
                }</leaf>)
            })

            return node
        }


        testFilePass (testNode : TestNodeResult) : XmlElement {
            return <span class='test_file_pass'> PASS </span>
        }

        testFileFail (testNode : TestNodeResult) : XmlElement {
            return <span class='test_file_fail'> FAIL </span>
        }

        subTestPass (testNode : TestNodeResult) : XmlElement {
            return <span class='sub_test_pass'>✔</span>
        }

        subTestFail (testNode : TestNodeResult) : XmlElement {
            return <span class='sub_test_fail'>✘</span>
        }


        testNodeState (testNode : TestNodeResult) : XmlElement {
            if (testNode.isRoot) {
                return testNode.passed ? this.testFilePass(testNode) : this.testFileFail(testNode)
            } else {
                return testNode.passed ? this.subTestPass(testNode) : this.subTestFail(testNode)
            }
        }


        testFileRunning () : XmlElement {
            return <div class="test_file_runs"> RUNS </div>
        }


        // used in Plus
        testNodeUrl (testNode : TestNodeResult) : string {
            return relative(this.projectData.projectPlan.url, testNode.descriptor.url)
        }


        testNodeUrlTemplate (desc : TestDescriptor) : XmlElement {
            const rel       = relative(this.projectData.projectPlan.url, desc.url)
            const match     = /(.*\/)?([^\/]+)/.exec(rel)

            return <span>
                <span class="test_file_url_dirname">{ match[ 1 ] || '' }</span><span class="test_file_url_filename">{ match[ 2 ] }</span>
            </span>
        }


        assertionTemplate (assertion : Assertion, testNode : TestNodeResult, sources : string[]) : XmlElement {
            const cls   = testNode.isTodo ?
                assertion.passed ? 'assertion_icon_pass_todo' : 'assertion_icon_pass'
            :
                assertion.passed ? 'assertion_icon_pass' : 'assertion_icon_fail'

            const passed                    = assertion.passed || testNode.isTodo
            const canShowSourceContext      = sources && assertion.sourcePoint
            const shouldShowSourceContext   = this.sourceContext > 0

            return <div class="assertion">
                <span class={`assertion_icon ${ cls }`}>{ assertion.passed ? '✔' : '✘' }</span>{ ' ' }
                <span class="assertion_name">{ assertion.name }</span>
                <span class="assertion_description">{ assertion.description ? ' ' + assertion.description : '' }</span>
                { assertion.sourcePoint && !shouldShowSourceContext ? [ ' at line ', <span class="assertion_source_line">{ assertion.sourcePoint.line }</span> ] : false }
                { !passed && canShowSourceContext && shouldShowSourceContext ? this.sourcePointTemplate(assertion.sourcePoint, sources) : false }
                { passed ? false : assertion.annotation }
            </div>
        }


        lineNumberTemplate (isHighlighted : boolean, line : string) : XmlElement {
            return <span>
                <span class="primary_fail">{ isHighlighted ? '➤' : ' ' }</span>
                <span class={ isHighlighted ? 'accented' : 'gray' }> { line } | </span>
            </span>
        }


        sourcePointTemplate ({ line, char } : SourcePoint, sources : string[]) : XmlElement {
            const template              = <div class="source_point"><div></div></div>

            const firstToShow           = Math.max(1, Math.round(line - this.sourceContext / 2))
            const lastToShow            = Math.min(sources.length, Math.round(line + this.sourceContext / 2))

            const lastToShowLen         = String(lastToShow).length

            for (let i = firstToShow; i < lastToShow; i++) {
                const isHighlighted     = i === line
                const lineStr           = String(i)
                const lenDelta          = lastToShowLen - lineStr.length

                template.appendChild(<div>
                    { this.lineNumberTemplate(isHighlighted, ' '.repeat(lenDelta) + lineStr) }
                    <span class={ isHighlighted ? "accented" : "gray" }>{ sources[ i - 1 ] }</span>
                </div>)

                if (isHighlighted) template.appendChild(<div>
                    <span class="gray"> { ' '.repeat(lastToShowLen + 1) } | </span>
                    <span class="primary_fail">{ ' '.repeat(char - 1) + '^' }</span>
                </div>)
            }

            template.appendChild(<div></div>)

            return template
        }


        logMessageTemplate (message : LogMessage) : XmlElement {
            // template moved to `LogMessage` to be reused with the launcher
            return message.template()
        }


        exceptionTemplate (exception : Exception) : XmlElement {
            return <div class="exception">
                <div class='exception_icon'> EXCEPTION </div>
                <div class='indented'>{ exception.stack || exception }</div>
            </div>
        }


        testSuiteHeader () : XmlElement {
            return <div>
                Launching { this.projectData.launchType === 'project' ? 'test suite project' : 'test file' }:{ ' ' }
                <span class="project_title">{ this.projectData.projectPlan.title }</span>{ ' ' }
                in { this.projectData.environment.name } { this.projectData.environment.version }
                <div></div>
            </div>
        }


        testSuiteFooter () : XmlElement {
            let text : XmlElement       = <div></div>

            if (this.resultsRunningMap.size > 0 && this.resultsCompleted.size > 0) text.appendChild(<div></div>)

            this.resultsRunningMap.forEach(testDesc => {
                text.appendChild(
                    this.testFileRunning(),
                    ' ',
                    this.testNodeUrlTemplate(testDesc)
                )
            })

            text.appendChild(<div></div>)

            text.appendChild(<div class="summary">
                { 'Test files : ' }
                <span class="summary_tests_passed">{ this.filesPassed } passed, </span>
                <span class={ this.filesFailed > 0 ? "summary_tests_failed" : '' }>{ this.filesFailed } failed, </span>
                <span class="summary_tests_total">{ this.dispatcher.projectPlanItemsToLaunch.length } total</span>
                { this.testSuiteFooterTime() }
            </div>)

            return text
        }


        testSuiteFooterTime () : XmlElement {
            return <div class="summary">
                { 'Time       : ' }
                { humanReadableDuration(Date.now() - this.startTime.getTime()) }
            </div>
        }
        // endregion
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export const humanReadableDuration = (milliSeconds : number) : string => {
    if (milliSeconds >= 1000) {
        const seconds       = Math.floor(milliSeconds / 100) / 10

        if (seconds >= 60) {
            const minutes   = Math.floor(seconds / 60)

            if (minutes >= 60) {
                const hours     = Math.floor(minutes / 60)

                return `${ hours }h ${ minutes % 60 }m`
            } else {
                return `${ minutes }m ${ Math.round(seconds) % 60 }s`
            }
        } else {
            return `${ seconds }s`
        }
    } else {
        return `${ milliSeconds }ms`
    }
}
