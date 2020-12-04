import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { OrPromise } from "../../../util/Helpers.js"
import { TestNodeResult } from "../Result.js"


type WaitForArg<R> = () => OrPromise<R> | {
    condition       : () => OrPromise<R>,
    timeout?        : number,
    interval?       : number,
    description?    : string
}


//---------------------------------------------------------------------------------------------------------------------
export class CommonAssertions extends Mixin(
    [ TestNodeResult ],
    (base : ClassUnion<typeof TestNodeResult>) =>

    class CommonAssertions extends base {

        waitForTimeout      : number        = 15000
        waitForPollInteval  : number        = 100


        async waitFor <R> (condition : WaitForArg<R>, description? : string) : Promise<R> {
            return
        }
    }
) {}

