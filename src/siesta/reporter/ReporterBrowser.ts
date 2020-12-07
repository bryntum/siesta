import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Reporter } from "./Reporter.js"

//---------------------------------------------------------------------------------------------------------------------
export class ReporterBrowser extends Mixin(
    [ Reporter ],
    (base : ClassUnion<typeof Reporter>) => {

    class ReporterBrowser extends base {

        // spinnerInterval : SetIntervalHandler            = undefined
        //
        // isPrintingFooter    : boolean                   = false
        //
        // footerLines     : number                        = 0
        //
        // spinnerChars    : number                        = 0


        print (str : string, includeNewLine : boolean = true) {
            console.log(str)
            // process.stdout.write(str)
            //
            // if (includeNewLine) process.stdout.write('\n')
            //
            // if (this.isPrintingFooter) {
            //     this.footerLines += Array.from(str.matchAll(/\n/g)).length
            //
            //     if (includeNewLine) this.footerLines++
            // }
        }


        // onTestSuiteStart () {
        //     process.stdout.write(hideCursor)
        //
        //     process.on('SIGTERM', () => process.stdout.write(showCursor))
        //     process.on('SIGINT', () => { process.stdout.write(showCursor); process.exit(1) })
        //     process.on('exit', () => process.stdout.write(showCursor))
        //
        //     this.spinnerInterval    = setInterval(this.onSpinnerTick.bind(this), this.spinner.interval)
        //
        //     super.onTestSuiteStart()
        //
        //     this.printFooter()
        // }
        //
        //
        // onTestSuiteFinish () {
        //     process.stdout.write(showCursor)
        //
        //     clearInterval(this.spinnerInterval)
        //
        //     this.revertFooter()
        //
        //     super.onTestSuiteFinish()
        // }
        //
        //
        // onSubTestStart (testNode : TestNodeResult) {
        //     if (testNode.isRoot) this.revertFooter()
        //
        //     super.onSubTestStart(testNode)
        //
        //     // to update the "RUNS" section
        //     if (testNode.isRoot) this.printFooter()
        // }
        //
        //
        // onSubTestFinish (testNode : TestNodeResult) {
        //     if (testNode.isRoot) this.revertFooter()
        //
        //     super.onSubTestFinish(testNode)
        //
        //     if (testNode.isRoot) this.printFooter()
        // }
        //
        //
        // revertFooter () {
        //     for (let i = 1; i <= this.footerLines; i++) {
        //         readline.clearLine(process.stdout, 0, () => {})
        //         // stick cursor at the beginning of the previous line
        //         readline.moveCursor(process.stdout, -Number.MAX_SAFE_INTEGER, -1, () => {})
        //     }
        //
        //     this.footerLines    = 0
        //     this.spinnerChars   = 0
        // }
        //
        //
        // printFooter () {
        //     this.revertFooter()
        //
        //     this.isPrintingFooter   = true
        //
        //     this.print(this.t.testSuiteFooter().toString())
        //
        //     this.printProgressBar()
        //     this.print(' ', false)
        //     this.printSpinner()
        //
        //     this.isPrintingFooter   = false
        // }
        //
        //
        // printProgressBar () {
        //     this.print(this.t.progressBar(), false)
        // }
        //
        //
        // printSpinner () {
        //     if (this.spinnerChars > 0) process.stdout.write('\b'.repeat(this.spinnerChars))
        //
        //     const spinnerText       = this.t.spinner()
        //
        //     this.print(spinnerText, false)
        //
        //     this.spinnerChars       = spinnerText.length
        // }
        //
        //
        // onSpinnerTick () {
        //     this.printSpinner()
        //
        //     this.spinner.tick()
        // }
    }

    return ReporterBrowser
}) {}
