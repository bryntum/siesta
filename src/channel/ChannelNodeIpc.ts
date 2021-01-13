import child_process from "child_process"
import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { MediaNodeIpcParent } from "../port/MediaNodeIpc.js"
import { Channel } from "./Channel.js"

//---------------------------------------------------------------------------------------------------------------------
export class ChannelNodeIpc extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class ChannelNodeIpc extends base {
            childMediaClassUrl      : string                = import.meta.url
                .replace(/channel\/ChannelNodeIpc.js$/, 'port/MediaNodeIpc.js')
            childMediaClassSymbol   : string                = 'MediaNodeIpcChild'

            parentMedia             : MediaNodeIpcParent     = undefined
            parentMediaClass        : typeof MediaNodeIpcParent  = MediaNodeIpcParent


            async setup () {
                const childProcess  = child_process.fork(
                    '',
                    {
                        execArgv : [
                            // '--inspect-brk=127.0.0.1:9339',
                            '--input-type', 'module',
                            '--eval', [
                                `import { ${ this.childPortClassSymbol } } from "${ this.childPortClassUrl }"`,
                                `import { ${ this.childMediaClassSymbol } } from "${ this.childMediaClassUrl }"`,

                                `const media    = new ${ this.childMediaClassSymbol }()`,
                                `const port     = new ${ this.childPortClassSymbol }()`,

                                `port.media     = media`,
                                `port.connect()`,
                            ].join('\n')
                        ]
                    }
                )

                const parentMedia           = this.parentMedia = new this.parentMediaClass()
                parentMedia.childProcess    = childProcess

                const parentPort            = this.parentPort = new this.parentPortClass
                parentPort.media            = parentMedia

                await parentPort.connect()
            }
        }

        return ChannelNodeIpc
    }
) {}
