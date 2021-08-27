import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TestDescriptor } from "../../test/TestDescriptor.js"
import { ContextSameContext } from "../ContextSameContext.js"
import { ContextProvider } from "./ContextProvider.js"


//---------------------------------------------------------------------------------------------------------------------
export class ContextProviderSameContext extends Mixin(
    [ ContextProvider ],
    (base : ClassUnion<typeof ContextProvider>) =>

    class ContextProviderSameContext extends base {
        supportsBrowser         : boolean           = true
        supportsNodejs          : boolean           = true

        contextClass            : typeof ContextSameContext   = ContextSameContext


        async doCreateContext (desc? : TestDescriptor) : Promise<InstanceType<this[ 'contextClass' ]>> {
            return this.contextClass.new() as InstanceType<this[ 'contextClass' ]>
        }

        static providerName : string = 'samecontext'
    }
) {}
