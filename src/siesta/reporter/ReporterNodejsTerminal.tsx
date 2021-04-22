import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { ExitCodes } from "../launcher/Launcher.js"
import { ReporterNodejs } from "./ReporterNodejs.js"
import { ReporterTerminal } from "./ReporterTerminal.js"
import { Terminal } from "./Terminal.js"
import { TerminalNodejs } from "./TerminalNodejs.js"


//---------------------------------------------------------------------------------------------------------------------
export class ReporterNodejsTerminal extends Mixin(
    [ ReporterTerminal, ReporterNodejs ],
    (base : ClassUnion<typeof ReporterTerminal, typeof ReporterNodejs>) => {

    class ReporterNodejsTerminal extends base {
        terminalClass       : typeof Terminal           = TerminalNodejs


        onTestSuiteStart () {
            super.onTestSuiteStart()

            process.on('SIGTERM', () => {
                process.stdout.write('\n')
                this.terminal.showCursor()
            })
            process.on('SIGINT', () => {
                process.stdout.write('\n')
                this.terminal.showCursor()
                process.exit(ExitCodes.UNHANDLED_EXCEPTION)
            })
            process.on('exit', () => {
                this.terminal.showCursor()
            })
        }
    }

    return ReporterNodejsTerminal
}) {}
