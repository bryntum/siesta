import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlElement } from "../../jsx/XmlElement.js"
import { MIN_SMI, SetIntervalHandler } from "../../util/Helpers.js"
import { TestNodeResult } from "../test/TestResult.js"
import { Reporter } from "./Reporter.js"
import { randomSpinner, Spinner } from "./Spinner.js"
import { Terminal } from "./Terminal.js"

//---------------------------------------------------------------------------------------------------------------------
type PrintingState  = {
    hadPrintedFooter        : boolean
}

//---------------------------------------------------------------------------------------------------------------------
export class ReporterTerminal extends Mixin(
    [ Reporter ],
    (base : ClassUnion<typeof Reporter>) => {

    class ReporterTerminal extends base {
        spinner             : Spinner                   = randomSpinner()

        spinnerInterval     : SetIntervalHandler        = undefined

        isPrintingFooter    : number                    = 0
        isPrintingSpinner   : boolean                   = false

        footerLines         : number                    = 0
        spinnerChars        : number                    = 0

        terminalClass       : typeof Terminal           = undefined
        terminal            : Terminal                  = undefined


        initialize (props? : Partial<ReporterTerminal>) {
            super.initialize(props)

            this.launcher.beforePrintHook.on((state : PrintingState) => {
                if (this.isPrintingFooter || this.isPrintingSpinner) return

                if (this.hasPrintedFooter) {
                    this.revertFooter()

                    state.hadPrintedFooter = true
                }
            })

            this.launcher.afterPrintHook.on((state : PrintingState) => {
                if (this.isPrintingFooter || this.isPrintingSpinner) return

                if (state.hadPrintedFooter) this.printFooter()
            })

            this.terminal   = this.terminalClass.new()
        }


        getMaxLen () : number {
            return this.terminal.getMaxLen()
        }


        get hasPrintedFooter () : boolean {
            return this.footerLines > 0
        }


        progressBar () : XmlElement {
            const completedChars = Math.round(this.resultsCompleted.size / this.launch.projectPlanItemsToLaunch.length * this.progressBarTotalLength)

            return <span>
                <span class={ this.filesFailed > 0 ? 'progress_bar_completed_failed' : 'progress_bar_completed_passed' }>{ ' '.repeat(completedChars) }</span>
                <span class="progress_bar_pending">{ '░'.repeat(this.progressBarTotalLength - completedChars) }</span>
            </span>
        }


        spinnerFrame () : string {
            return this.spinner.frame
        }


        get progressBarTotalLength () : number {
            return Math.min(this.getMaxLen() - this.spinnerFrame().length - 2, 50)
        }


        doPrint (str : string) {
            super.doPrint(str)

            if (this.isPrintingFooter && !this.isPrintingSpinner) {
                this.footerLines += Array.from(str.matchAll(/\n/g)).length
            }
        }


        onTestSuiteStart () {
            this.terminal.hideCursor()

            this.spinnerInterval    = setInterval(this.onSpinnerTick.bind(this), this.spinner.interval)

            super.onTestSuiteStart()
        }


        onTestSuiteStartDo () {
            super.onTestSuiteStartDo()

            this.printFooter()
        }


        onTestSuiteFinish () {
            super.onTestSuiteFinish()

            this.terminal.showCursor()

            clearInterval(this.spinnerInterval)
        }


        onSubTestStart (testNode : TestNodeResult) {
            if (testNode.isRoot) this.revertFooter()

            super.onSubTestStart(testNode)

            // to update the "RUNS" section
            if (testNode.isRoot) this.printFooter()
        }


        printFinished () {
            this.revertFooter()

            super.printFinished()

            this.printFooter()
        }


        finalizePrinting () {
            this.revertFooter()

            super.finalizePrinting()
        }


        revertFooter () {
            this.isPrintingFooter++

            // after printing spinner cursor is on the same line, there's no new line after spinner
            // so we clear this line first
            if (this.footerLines > 0) this.terminal.clearLine('line')

            // then clear the rest
            for (let i = 1; i <= this.footerLines; i++) {
                // tried to use `-Number.MAX_SAFE_INTEGER` here, but that overflows in the JetBrains built-in terminal
                this.terminal.moveCursor(MIN_SMI, -1)

                this.terminal.clearLine('line')
            }

            this.footerLines    = 0
            this.spinnerChars   = 0

            this.isPrintingFooter--
        }


        printFooter () {
            this.isPrintingFooter++

            this.revertFooter()

            this.printSuiteFooter()

            this.printProgressBar()
            this.print(' ')
            this.printSpinner()

            this.isPrintingFooter--
        }


        printProgressBar () {
            this.print(this.render(this.progressBar()))
        }


        printSpinner () {
            this.isPrintingSpinner  = true

            if (this.spinnerChars > 0) {
                this.print('\b'.repeat(this.spinnerChars))

                this.terminal.moveCursor(MIN_SMI, -1)
                this.terminal.clearLine('line')

                // this will start a new line
                this.write(this.testSuiteFooterTime())

                // so we just need to move the cursor back to the spinner position to the right
                this.terminal.moveCursor(this.progressBarTotalLength + 1, 0)
            }

            const spinnerText       = this.spinnerFrame()

            this.print(spinnerText)

            this.spinnerChars       = spinnerText.length

            this.isPrintingSpinner  = false
        }


        onSpinnerTick () {
            this.printSpinner()

            this.spinner.tick()
        }
    }

    return ReporterTerminal
}) {}
