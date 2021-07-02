import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaWebWorkerParent } from "../../rpc/media/MediaWebWorker.js"
import { PortHandshakeParent } from "../../rpc/port/PortHandshake.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { Context } from "./Context.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextDenoWorker extends Mixin(
    [ Context ],
    (base : ClassUnion<typeof Context>) =>

    class ContextDenoWorker extends base {
        worker                          : Worker                            = undefined

        parentMediaClass                : typeof MediaWebWorkerParent       = MediaWebWorkerParent

        relativeChildMediaModuleUrl     : string    = 'src/rpc/media/MediaWebWorker.js'
        relativeChildMediaClassSymbol   : string    = 'MediaWebWorkerChild'


        async evaluateBasic <A extends unknown[], R extends unknown> (func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>> {
            // TODO need to add some basic queuing to this method to avoid race conditions

            const promise = new Promise<UnwrapPromise<R>>((resolve, reject) => {
                let listener

                this.worker.addEventListener('message', listener = (event : MessageEvent) => {
                    if (event && event.data.__SIESTA_CONTEXT_EVALUATE_RESPONSE__) {
                        if (event.data.status === 'resolved')
                            resolve(event.data.result)
                        else
                            reject(event.data.result)
                    }

                    this.worker.removeEventListener('message', listener)
                })
            })

            this.worker.postMessage({
                __SIESTA_CONTEXT_EVALUATE_REQUEST__     : true,
                functionSource                          : func.toString(),
                arguments                               : args
            })

            return await promise
        }


        async destroy () {
            this.worker.terminate()

            await super.destroy()
        }


        async setupChannel (parentPort : PortHandshakeParent, relativeChildPortModuleUrl : string, relativeChildPortClassSymbol : string) {
            const parentMedia           = new this.parentMediaClass()

            parentMedia.worker          = this.worker

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
