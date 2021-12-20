import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { ExitCodes } from "../launcher/Types.js"
import { ReporterDeno } from "./ReporterDeno.js"
import { ReporterTerminal } from "./ReporterTerminal.js"
import { Terminal } from "./Terminal.js"
import { TerminalDeno } from "./TerminalDeno.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
declare const Deno : any

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ReporterDenoTerminal extends Mixin(
    [ ReporterTerminal, ReporterDeno ],
    (base : ClassUnion<typeof ReporterTerminal, typeof ReporterDeno>) =>

    class ReporterDenoTerminal extends base {
        terminalClass       : typeof Terminal           = TerminalDeno


        onTestSuiteStart () {
            super.onTestSuiteStart()

            Deno.addSignalListener("SIGINT", () => {
                this.print('\n')
                this.terminal.showCursor()

                Deno.exit(ExitCodes.UNHANDLED_EXCEPTION)
            })

            Deno.addSignalListener("SIGTERM", () => {
                this.print('\n')
                this.terminal.showCursor()

                Deno.exit(ExitCodes.UNHANDLED_EXCEPTION)
            })
        }


        onTestSuiteFinish () {
            super.onTestSuiteFinish()
        }
    }
) {}
