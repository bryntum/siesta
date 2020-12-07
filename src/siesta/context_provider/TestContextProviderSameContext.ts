import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TestContextProvider } from "./TestContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextProviderSameContext extends Mixin(
    [ TestContextProvider ],
    (base : ClassUnion<typeof TestContextProvider>) => {

        class TestContextProviderSameContext extends base {
        }

        return TestContextProviderSameContext
    }
) {}
