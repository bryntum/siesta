import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ExecutionContext } from "./ExecutionContext.js"

//---------------------------------------------------------------------------------------------------------------------
export class ExecutionContextSameContext extends Mixin(
    [ ExecutionContext ],
    (base : ClassUnion<typeof ExecutionContext>) =>

    class ExecutionContextSameContext extends base {

        async evaluate <A extends unknown[], R extends unknown> (func : (...args : A) => R | Promise<R>, ...args : A) : Promise<R> {
            return await func(...args)
        }


        async setup () {
        }


        async destroy () {
        }
    }
) {}

