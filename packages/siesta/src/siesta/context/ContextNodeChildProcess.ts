import { ChildProcess } from "child_process"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaNodeIpcParent } from "../../rpc/media/MediaNodeIpc.js"
import { PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { Context } from "./Context.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextNodeChildProcess extends Mixin(
    [ Context ],
    (base : ClassUnion<typeof Context>) =>

    class ContextNodeChildProcess extends base {

        childProcess            : ChildProcess      = undefined

        parentMediaClass        : typeof MediaNodeIpcParent         = MediaNodeIpcParent

        relativeChildMediaModuleUrl     : string    = 'src/rpc/media/MediaNodeIpc.js'
        relativeChildMediaClassSymbol   : string    = 'MediaNodeIpcChild'


        async evaluateBasic <A extends unknown[], R extends unknown> (func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>> {
            // TODO need to add some basic queuing to this method to avoid race conditions

            const promise = new Promise<UnwrapPromise<R>>((resolve, reject) => {
                this.childProcess.once('message', (message : any) => {
                    if (message && message.__SIESTA_CONTEXT_EVALUATE_RESPONSE__) {
                        if (message.status === 'resolved')
                            resolve(message.result)
                        else
                            reject(message.result)
                    }
                })
            })

            this.childProcess.send({
                __SIESTA_CONTEXT_EVALUATE_REQUEST__     : true,
                functionSource                          : func.toString(),
                arguments                               : args
            })

            return await promise
        }


        async destroy () {
            if (this.childProcess.connected) this.childProcess.disconnect()

            await super.destroy()
        }


        async setupChannel (parentPort : PortHandshakeParent, relativeChildPortModuleUrl : string, relativeChildPortClassSymbol : string) {
            const parentMedia           = new this.parentMediaClass()

            parentMedia.childProcess    = this.childProcess

            parentPort.media            = parentMedia
            parentPort.handshakeType    = 'parent_first'

            await this.seedChildPort(
                relativeChildPortModuleUrl,
                relativeChildPortClassSymbol,
                { handshakeType : 'parent_first' },
                {}
            )

            await parentPort.connect()
        }
    }
) {}
