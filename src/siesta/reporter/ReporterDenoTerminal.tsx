import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { ExitCodes } from "../launcher/Launcher.js"
import { ReporterDeno } from "./ReporterDeno.js"
import { ReporterTerminal } from "./ReporterTerminal.js"
import { Terminal } from "./Terminal.js"
import { TerminalDeno } from "./TerminalDeno.js"

//---------------------------------------------------------------------------------------------------------------------
declare const Deno : any

//---------------------------------------------------------------------------------------------------------------------
export class ReporterDenoTerminal extends Mixin(
    [ ReporterTerminal, ReporterDeno ],
    (base : ClassUnion<typeof ReporterTerminal, typeof ReporterDeno>) => {

    class ReporterDenoTerminal extends base {
        terminalClass       : typeof Terminal           = TerminalDeno


        onTestSuiteStart () {
            super.onTestSuiteStart()

            const sigint    = Deno.signal(Deno.Signal.SIGINT)
            const sigterm   = Deno.signal(Deno.Signal.SIGTERM)

            ; (async () => {
                for await (const _ of sigterm) {
                    sigterm.dispose()
                    sigint.dispose()

                    this.print('\n')
                    this.terminal.showCursor()

                    Deno.exit(ExitCodes.UNHANDLED_EXCEPTION)
                }

                for await (const _ of sigint) {
                    sigterm.dispose()
                    sigint.dispose()

                    this.print('\n')
                    this.terminal.showCursor()

                    Deno.exit(ExitCodes.UNHANDLED_EXCEPTION)
                }
            })()
        }
    }

    return ReporterDenoTerminal
}) {}
