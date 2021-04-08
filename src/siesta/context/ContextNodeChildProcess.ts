import { ChildProcess } from "child_process"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { MediaNodeIpcParent } from "../../rpc/media/MediaNodeIpc.js"
import { Port } from "../../rpc/port/Port.js"
import { UnwrapPromise } from "../../util/Helpers.js"
import { Context } from "./Context.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextNodeChildProcess extends Mixin(
    [ Context ],
    (base : ClassUnion<typeof Context>) =>

    class ContextNodeChildProcess extends base {

        childProcess            : ChildProcess      = undefined

        parentMediaClass        : typeof MediaNodeIpcParent         = MediaNodeIpcParent

        relativeChildMediaModuleUrl     : string    = 'src/siesta/rpc/media/MediaNodeIpc.js'
        relativeChildMediaClassSymbol   : string    = 'MediaNodeIpcChild'


        async evaluateBasic <A extends unknown[], R extends unknown> (func : (...args : A) => R, ...args : A) : Promise<UnwrapPromise<R>> {
            // TODO need to add some basic queuing to this method to avoid race conditions

            const promise = new Promise<UnwrapPromise<R>>((resolve, reject) => {
                process.once('message', message => {
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
            this.childProcess.disconnect()

            await super.destroy()
        }


        async setupChannel (parentPort : Port, relativeChildPortModuleUrl : string, relativeChildPortClassSymbol : string) {
            parentPort.media        = new this.parentMediaClass()

            const awaitConnection   = parentPort.connect()

            await this.seedChildPort(relativeChildPortModuleUrl, relativeChildPortClassSymbol, {}, {})

            await awaitConnection
        }
    }
) {}
