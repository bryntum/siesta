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

        sigintIterator      : AsyncIterableIterator<any> & { dispose : Function }   = undefined
        sigtermIterator     : AsyncIterableIterator<any> & { dispose : Function }   = undefined


        onTestSuiteStart () {
            super.onTestSuiteStart()

            this.sigintIterator     = Deno.signal(Deno.Signal.SIGINT)
            this.sigtermIterator    = Deno.signal(Deno.Signal.SIGTERM)

            ; (async () => {
                for await (const _ of this.sigtermIterator) {
                    this.sigtermIterator.dispose()
                    this.sigintIterator.dispose()

                    this.print('\n')
                    this.terminal.showCursor()

                    Deno.exit(ExitCodes.UNHANDLED_EXCEPTION)
                }

                for await (const _ of this.sigintIterator) {
                    this.sigtermIterator.dispose()
                    this.sigintIterator.dispose()

                    this.print('\n')
                    this.terminal.showCursor()

                    Deno.exit(ExitCodes.UNHANDLED_EXCEPTION)
                }
            })()
        }


        onTestSuiteFinish () {
            super.onTestSuiteFinish()

            this.sigtermIterator.dispose()
            this.sigintIterator.dispose()
        }
    }

    return ReporterDenoTerminal
}) {}
