import { Base } from "../../class/Base.js"
import { serializable, Serializable } from "../../serializable/Serializable.js"
import { typeOf } from "../../util/Helpers.js"
import { IsolationLevel } from "../common/IsolationLevel.js"

//---------------------------------------------------------------------------------------------------------------------
@serializable('TestDescriptor')
export class TestDescriptor extends Serializable.mix(Base) {
    title           : string                = ''

    filename        : string                = ''

    url             : string                = ''

    env             : 'generic' | 'browser' | 'nodejs'  = 'generic'

    tags            : string[]              = []

    isTodo          : boolean               = false

    isolation       : IsolationLevel        = undefined

    // will be applied directly to test instance
    config          : object                = undefined


    // merge (anotherObj : Partial<TestDescriptor>) {
    //     const another   = (this.constructor as typeof TestDescriptor).maybeNew(anotherObj)
    //
    //     if (this.filename) {
    //         if (another.filename !== this.filename) throw new Error('Can not merge test descriptor - `name` does not match')
    //     } else {
    //         this.filename       = another.filename
    //     }
    //
    //     // TODO can promote `env` from `generic` to either `browser` or `nodejs`, anything else should throw
    //
    //     if (isSuperclassOf(another.testClass, this.testClass)) {
    //         this.testClass      = another.testClass
    //     }
    //     else if (another.testClass === this.testClass || isSubclassOf(another.testClass, this.testClass)) {
    //         // do nothing
    //     }
    //     else
    //         throw new Error("Can not merge descriptor - different `testClass` hierarchies")
    //
    //     // strip duplicates
    //     this.tags           = Array.from(new Set(this.tags.concat(another.tags)))
    // }


    static fromTestDescriptorArgument<T extends typeof TestDescriptor> (this : T, props? : string | Partial<InstanceType<T>>) : InstanceType<T> {
        if (typeOf(props) === 'String') {
            // @ts-ignore
            return this.new({ title : props })
        } else {
            // @ts-ignore
            return this.new(props)
        }
    }
}

export type TestDescriptorArgument = string | Partial<TestDescriptor>
