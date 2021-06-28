import { AnyConstructor, AnyFunction, Mixin } from "../../class/Mixin.js"
import { Atom } from "./Atom.js"
import { Calculation } from "./Calculation.js"


//--------------------------------------------------------------------------------------------------
export class ReactiveContext extends Mixin(
    [],
    (base : AnyConstructor) =>

    class ReactiveContext extends base {
        currentCalculation          : Calculation<unknown>         = undefined


        bindAtomClass<C extends typeof Atom> (atomClass : C) : C {
            const graph         = this
            const className     = atomClass.name || 'Anonymous'

            // this trick will assign the same name of the class to the subclass
            const classHolder   = {
                // @ts-ignore
                [ className ] : class extends atomClass {
                    get reactiveContext () : ReactiveContext {
                        return graph
                    }
                }
            }

            return classHolder[ className ]
        }
    }
) {}
