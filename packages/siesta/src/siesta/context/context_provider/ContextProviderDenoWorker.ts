import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TestDescriptorDeno } from "../../test/TestDescriptorDeno.js"
import { ContextDenoWorker } from "../ContextDenoWorker.js"
import { ContextProvider } from "./ContextProvider.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderDenoWorker extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) =>

    class ContextProviderDenoWorker extends base {
        local                   : boolean           = true

        supportsDeno            : boolean           = true

        contextClass            : typeof ContextDenoWorker    = ContextDenoWorker


        async doCreateContext (desc? : TestDescriptorDeno) : Promise<InstanceType<this[ 'contextClass' ]>> {
            const worker = new Worker(
                new URL("./deno_worker_seed.js", import.meta.url).href,
                {
                    type : "module",
                    // @ts-ignore
                    deno : {
                        namespace : true
                    }
                }
            )

            return this.contextClass.new({ worker }) as InstanceType<this[ 'contextClass' ]>
        }

        static providerName : string = 'deno'
    }
) {}
