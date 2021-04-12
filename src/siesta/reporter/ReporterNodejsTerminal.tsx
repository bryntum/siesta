import readline from "readline"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlElement } from "../../jsx/XmlElement.js"
import { SetIntervalHandler } from "../../util/Helpers.js"
import { hideCursor, showCursor } from "../../util_nodejs/Terminal.js"
import { TestNodeResult } from "../test/TestResult.js"
import { ReporterNodejs } from "./ReporterNodejs.js"
import { randomSpinner, Spinner } from "./Spinner.js"

//---------------------------------------------------------------------------------------------------------------------
export class ReporterNodejsTerminal extends Mixin(
    [ ReporterNodejs ],
    (base : ClassUnion<typeof ReporterNodejs>) => {

    class ReporterNodejsTerminal extends base {
        spinner             : Spinner                   = randomSpinner()

        spinnerInterval     : SetIntervalHandler        = undefined

        isPrintingFooter    : boolean                   = false

        footerLines     : number                        = 0

        spinnerChars    : number                        = 0

        rl              : readline.Interface            = readline.createInterface({
            input           : process.stdin,
            output          : process.stdout
        })


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


        print (str : string) {
            super.print(str)

            if (this.isPrintingFooter) {
                this.footerLines += Array.from(str.matchAll(/\n/g)).length
            }
        }


        onTestSuiteStart () {
            process.stdout.write(hideCursor)

            process.on('SIGTERM', () => process.stdout.write('\n' + showCursor))
            process.on('SIGINT', () => { process.stdout.write('\n' + showCursor); process.exit(1) })
            process.on('exit', () => process.stdout.write(showCursor))

            this.spinnerInterval    = setInterval(this.onSpinnerTick.bind(this), this.spinner.interval)

            super.onTestSuiteStart()
        }


        onTestSuiteStartDo () {
            super.onTestSuiteStartDo()

            this.printFooter()
        }


        onTestSuiteFinish () {
            super.onTestSuiteFinish()

            process.stdout.write(showCursor)

            clearInterval(this.spinnerInterval)

            this.rl.close()
        }


        onSubTestStart (testNode : TestNodeResult) {
            if (testNode.isRoot) this.revertFooter()

            super.onSubTestStart(testNode)

            // to update the "RUNS" section
            if (testNode.isRoot) this.printFooter()
        }


        printFinished () : boolean {
            this.revertFooter()

            const allDone = super.printFinished()

            !allDone && this.printFooter()

            return allDone
        }


        revertFooter () {
            // after printing spinner cursor is on the same line, there's no new line after spinner
            // so we clear this line first
            if (this.footerLines > 0) readline.clearLine(process.stdout, 0, () => {})

            // then clear the rest
            for (let i = 1; i <= this.footerLines; i++) {
                readline.moveCursor(process.stdout, -Number.MAX_SAFE_INTEGER, -1, () => {})

                readline.clearLine(process.stdout, 0, () => {})
            }

            this.footerLines    = 0
            this.spinnerChars   = 0
        }


        printFooter () {
            this.revertFooter()

            this.isPrintingFooter   = true

            this.printSuiteFooter()

            this.printProgressBar()
            this.print(' ')
            this.printSpinner()

            this.isPrintingFooter   = false
        }


        printProgressBar () {
            this.print(this.render(this.progressBar()))
        }


        printSpinner () {
            if (this.spinnerChars > 0) {
                process.stdout.write('\b'.repeat(this.spinnerChars))

                readline.moveCursor(process.stdout, -Number.MAX_SAFE_INTEGER, -1, () => {})
                readline.clearLine(process.stdout, 0, () => {})

                this.write(this.testSuiteFooterTime())
                readline.moveCursor(process.stdout, -Number.MAX_SAFE_INTEGER, 0, () => {})

                readline.moveCursor(process.stdout, this.progressBarTotalLength + 1, 1, () => {})
            }

            const spinnerText       = this.spinnerFrame()

            this.print(spinnerText)

            this.spinnerChars       = spinnerText.length
        }


        onSpinnerTick () {
            this.printSpinner()

            this.spinner.tick()
        }
    }

    return ReporterNodejsTerminal
}) {}
