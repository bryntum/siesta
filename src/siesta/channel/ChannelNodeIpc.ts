import child_process from "child_process"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { PortNodeIpcParent } from "../../port/PortNodeIpc.js"
import { Channel } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelNodeIpc extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class ChannelNodeIpc extends base {
            parentPort              : PortNodeIpcParent     = undefined

            parentPortClass         : typeof PortNodeIpcParent  = PortNodeIpcParent


            async setup () {
                const childProcess  = child_process.fork(
                    '',
                    {
                        execArgv : [
                            // '--inspect-brk=127.0.0.1:9339',
                            '--input-type', 'module',
                            '--eval', [
                                `import { ${this.childPortClassSymbol} } from "${this.childPortClassUrl}"`,

                                `const context = ${this.childPortClassSymbol}.new()`,

                                `context.connect()`,
                            ].join('\n')
                        ]
                    }
                )

                const parentPort        = new this.parentPortClass

                parentPort.media        = childProcess

                await parentPort.connect()

                this.parentPort         = parentPort
            }
        }

        return ChannelNodeIpc
    }
) {}
