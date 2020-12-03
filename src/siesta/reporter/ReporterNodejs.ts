import readline from "readline"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { saneSplit, SetIntervalHandler } from "../../util/Helpers.js"
import { TestNodeResult } from "../test/Result.js"
import { Reporter } from "./Reporter.js"

//---------------------------------------------------------------------------------------------------------------------
export class ReporterNodejs extends Mixin(
    [ Reporter ],
    (base : ClassUnion<typeof Reporter>) => {

    class ReporterNodejs extends base {

        spinnerInterval : SetIntervalHandler            = undefined

        isPrintingFooter    : boolean                   = false

        footerLines     : number                        = 0

        spinnerChars    : number                        = 0


        print (str : string) {
            console.log(str)

            if (this.isPrintingFooter) this.footerLines += saneSplit(str, '\n').length
        }


        onTestSuiteStart () {
            this.spinnerInterval    = setInterval(this.onSpinnerTick.bind(this), this.spinner.interval)

            super.onTestSuiteStart()

            this.printFooter()
        }


        onTestSuiteFinish () {
            clearInterval(this.spinnerInterval)

            this.revertFooter()

            super.onTestSuiteFinish()
        }


        onSubTestStart (testNode : TestNodeResult) {
            if (testNode.isRoot) this.revertFooter()

            super.onSubTestStart(testNode)

            // to update the "RUNS" section
            if (testNode.isRoot) this.printFooter()
        }


        onSubTestFinish (testNode : TestNodeResult) {
            if (testNode.isRoot) this.revertFooter()

            super.onSubTestFinish(testNode)

            if (testNode.isRoot) this.printFooter()
        }


        revertFooter () {
            for (let i = 1; i <= this.footerLines; i++) {
                readline.moveCursor(process.stdout, 0, -1, () => {})
                readline.clearLine(process.stdout, 0, () => {})
            }

            this.footerLines    = 0
            this.spinnerChars   = 0
        }


        printFooter () {
            this.revertFooter()

            this.isPrintingFooter   = true

            this.print(this.t.testSuiteFooter().toString())

            this.printProgressBar()
            this.printSpinner()

            this.isPrintingFooter   = false
        }


        printProgressBar () {
            this.print(this.t.progressBar())
        }


        printSpinner () {
            // if (this.spinnerChars > 0) console.log('\b'.repeat(this.spinnerChars))
            //
            // const spinnerText       = this.t.spinner()
            //
            // this.print(spinnerText)
            //
            // this.spinnerChars       = spinnerText.length
        }


        onSpinnerTick () {
            this.printSpinner()

            this.spinner.tick()
        }
    }

    return ReporterNodejs
}) {}
