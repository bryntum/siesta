import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { queueable } from "../../class/QueueableMethods.js"
import { SetIntervalHandler, SetTimeoutHandler } from "../../util/Helpers.js"
import { TestNodeResult } from "../test/Result.js"
import { Reporter } from "./Reporter.js"

import readline from "readline"

//---------------------------------------------------------------------------------------------------------------------
export class ReporterNodejs extends Mixin(
    [ Reporter ],
    (base : ClassUnion<typeof Reporter>) => {

    class ReporterNodejs extends base {

        spinnerInterval : SetIntervalHandler            = undefined

        isPrintingFooter    : boolean                   = false

        footerLines     : number                        = 0

        // rl              : readline.Interface            = undefined


        print (str : string) {
            console.log(str)

            if (this.isPrintingFooter) this.footerLines++
        }


        @queueable()
        async onTestSuiteStart () {
            // this.rl                 = readline.createInterface({ input : process.stdin, output : process.stdout })
            this.spinnerInterval    = setInterval(this.onSpinnerTick.bind(this), this.spinner.interval)

            super.onTestSuiteStart()

            this.printFooter()
        }


        @queueable()
        async onTestSuiteFinish () {
            clearInterval(this.spinnerInterval)
            // this.rl.close()

            this.revertFooter()

            super.onTestSuiteFinish()
        }


        @queueable()
        async onSubTestStart (testNode : TestNodeResult) {
            super.onSubTestStart(testNode)

            // to update the "RUNS" section
            this.printFooter()
        }


        @queueable()
        async onSubTestFinish (testNode : TestNodeResult) {
            super.onSubTestFinish(testNode)

            if (testNode.isRoot) {
                this.printFooter()
            }
        }


        @queueable()
        async revertFooter () {
            if (this.footerLines > 0) {
                await new Promise<void>(resolve => readline.moveCursor(process.stdout, 0, -this.footerLines, resolve))
                await new Promise<void>(resolve => readline.clearScreenDown(process.stdout, resolve))
            }
        }


        @queueable()
        async printFooter () {
            this.revertFooter()

            this.isPrintingFooter   = true

            this.print(this.t.testSuiteFooter().toString())

            this.printProgressBar()
            this.printSpinner()

            this.isPrintingFooter   = false
        }


        @queueable()
        async printProgressBar () {
            this.print(this.t.progressBar())
        }


        @queueable()
        async printSpinner () {
            this.print(this.t.spinner())
        }


        onSpinnerTick () {
            this.spinner.tick()

            this.print(this.t.spinner())
        }
    }

    return ReporterNodejs
}) {}
